-- Adicionar coluna status à tabela invite_tokens
ALTER TABLE invite_tokens 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'));

-- Atualizar registros existentes baseado no campo 'used'
UPDATE invite_tokens 
SET status = CASE 
    WHEN used = true AND accepted_by IS NOT NULL THEN 'accepted'
    WHEN expires_at < NOW() THEN 'expired'
    ELSE 'pending'
END;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_invite_tokens_status ON invite_tokens(status);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at ON invite_tokens(expires_at);

-- Atualizar função cleanup_expired_invites para usar a nova estrutura
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Marcar convites expirados como 'expired'
    UPDATE invite_tokens 
    SET status = 'expired'
    WHERE expires_at < NOW() 
    AND status = 'pending';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Marcados % tokens como expirados', deleted_count;
    RETURN deleted_count;
END;
$$;

-- Atualizar função create_invite_token para usar status
CREATE OR REPLACE FUNCTION create_invite_token(
    p_message TEXT DEFAULT 'Convite para conectar no ZetaFin'
)
RETURNS TABLE(
    token TEXT,
    invite_link TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    new_token TEXT;
    expiry_time TIMESTAMP WITH TIME ZONE;
    base_url TEXT := 'http://localhost:5173'; -- URL local para desenvolvimento
    sender_id_val UUID;
BEGIN
    -- Obter ID do usuário autenticado
    sender_id_val := auth.uid();
    
    IF sender_id_val IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Verificar se o usuário existe
    IF NOT EXISTS(SELECT 1 FROM users WHERE id = sender_id_val) THEN
        RAISE EXCEPTION 'Usuário não encontrado';
    END IF;
    
    -- Gerar token único
    new_token := UPPER(SUBSTRING(MD5(RANDOM()::text || NOW()::text) FROM 1 FOR 8));
    
    -- Garantir que o token é único
    WHILE EXISTS(SELECT 1 FROM invite_tokens WHERE token = new_token) LOOP
        new_token := UPPER(SUBSTRING(MD5(RANDOM()::text || NOW()::text) FROM 1 FOR 8));
    END LOOP;
    
    -- Calcular data de expiração (24 horas)
    expiry_time := NOW() + INTERVAL '24 hours';
    
    -- Inserir token na tabela
    INSERT INTO invite_tokens (sender_id, token, message, expires_at, status)
    VALUES (sender_id_val, new_token, p_message, expiry_time, 'pending');
    
    -- Registrar log
    INSERT INTO connection_logs (user_id, event_type, metadata)
    VALUES (sender_id_val, 'invite_sent', jsonb_build_object(
        'token', new_token,
        'expires_at', expiry_time,
        'message', COALESCE(p_message, '')
    ));
    
    -- Retornar dados do convite
    RETURN QUERY SELECT 
        new_token,
        base_url || '/invite/' || new_token,
        expiry_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON COLUMN invite_tokens.status IS 'Status do convite: pending, accepted, rejected, expired';
COMMENT ON FUNCTION cleanup_expired_invites() IS 'Marca convites expirados como expired e retorna o número de convites afetados';
COMMENT ON FUNCTION create_invite_token(TEXT) IS 'Cria um novo token de convite com status pending';