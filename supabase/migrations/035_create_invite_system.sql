-- Migração para Sistema de Convites e Monitoramento de Conexão
-- Criado em: 2024-12-13
-- Descrição: Implementa tabelas e funções para links compartilháveis e estabilidade de conexão

-- =====================================================
-- 1. TABELA DE TOKENS DE CONVITE
-- =====================================================

-- Criar tabela invite_tokens
CREATE TABLE IF NOT EXISTS invite_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_sender_id ON invite_tokens(sender_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at ON invite_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_used ON invite_tokens(used);

-- Habilitar RLS
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para invite_tokens
DROP POLICY IF EXISTS "invite_tokens_select_policy" ON invite_tokens;
CREATE POLICY "invite_tokens_select_policy" ON invite_tokens
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = accepted_by OR
    (used = FALSE AND expires_at > NOW())
  );

DROP POLICY IF EXISTS "invite_tokens_insert_policy" ON invite_tokens;
CREATE POLICY "invite_tokens_insert_policy" ON invite_tokens
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "invite_tokens_update_policy" ON invite_tokens;
CREATE POLICY "invite_tokens_update_policy" ON invite_tokens
  FOR UPDATE USING (
    auth.uid() = sender_id OR 
    (token IN (SELECT token FROM invite_tokens WHERE used = FALSE AND expires_at > NOW()))
  );

-- =====================================================
-- 2. TABELA DE LOGS DE CONEXÃO
-- =====================================================

-- Criar tabela connection_logs
CREATE TABLE IF NOT EXISTS connection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'connection_established',
        'connection_lost',
        'reconnection_attempt',
        'session_recovered',
        'tab_change_detected',
        'network_status_change',
        'invite_sent',
        'invite_accepted',
        'invite_rejected'
    )),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_connection_logs_user_id ON connection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_logs_event_type ON connection_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_connection_logs_created_at ON connection_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connection_logs_partner_id ON connection_logs(partner_id);

-- Habilitar RLS
ALTER TABLE connection_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para connection_logs
DROP POLICY IF EXISTS "connection_logs_select_policy" ON connection_logs;
CREATE POLICY "connection_logs_select_policy" ON connection_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "connection_logs_insert_policy" ON connection_logs;
CREATE POLICY "connection_logs_insert_policy" ON connection_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para gerar token único de convite
CREATE OR REPLACE FUNCTION generate_unique_invite_token()
RETURNS TEXT AS $$
DECLARE
    token TEXT;
    exists_token BOOLEAN;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Gerar token aleatório de 32 caracteres
        token := encode(gen_random_bytes(24), 'base64');
        token := replace(replace(replace(token, '/', ''), '+', ''), '=', '');
        token := substr(token, 1, 32);
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM invite_tokens WHERE token = token) INTO exists_token;
        
        -- Se não existe, retornar
        IF NOT exists_token THEN
            RETURN token;
        END IF;
        
        -- Evitar loop infinito
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Não foi possível gerar token único após % tentativas', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_invite_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM invite_tokens 
    WHERE expires_at < NOW() AND used = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Removidos % tokens expirados', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar convite
CREATE OR REPLACE FUNCTION create_invite_token(
    p_sender_id UUID,
    p_message TEXT DEFAULT NULL,
    p_expiration_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
    token TEXT,
    invite_link TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    new_token TEXT;
    expiry_time TIMESTAMP WITH TIME ZONE;
    base_url TEXT := 'https://zetafin.app'; -- Ajustar conforme necessário
BEGIN
    -- Verificar se o usuário existe
    IF NOT EXISTS(SELECT 1 FROM users WHERE id = p_sender_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado';
    END IF;
    
    -- Gerar token único
    new_token := generate_unique_invite_token();
    
    -- Calcular data de expiração
    expiry_time := NOW() + (p_expiration_hours || ' hours')::INTERVAL;
    
    -- Inserir token na tabela
    INSERT INTO invite_tokens (sender_id, token, message, expires_at)
    VALUES (p_sender_id, new_token, p_message, expiry_time);
    
    -- Registrar log
    INSERT INTO connection_logs (user_id, event_type, metadata)
    VALUES (p_sender_id, 'invite_sent', jsonb_build_object(
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

-- Função para validar token de convite
CREATE OR REPLACE FUNCTION validate_invite_token(p_token TEXT)
RETURNS TABLE(
    valid BOOLEAN,
    sender_id UUID,
    sender_name TEXT,
    sender_email TEXT,
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (it.expires_at > NOW() AND NOT it.used) as valid,
        it.sender_id,
        u.name as sender_name,
        u.email as sender_email,
        it.message,
        it.expires_at,
        it.used
    FROM invite_tokens it
    JOIN users u ON u.id = it.sender_id
    WHERE it.token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aceitar convite
CREATE OR REPLACE FUNCTION accept_invite_token(
    p_token TEXT,
    p_accepter_id UUID,
    p_accept BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    sender_id UUID,
    connection_established BOOLEAN
) AS $$
DECLARE
    invite_record RECORD;
    connection_success BOOLEAN := FALSE;
BEGIN
    -- Buscar e validar token
    SELECT * INTO invite_record
    FROM invite_tokens 
    WHERE token = p_token 
    AND expires_at > NOW() 
    AND used = FALSE;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Token inválido ou expirado', NULL::UUID, FALSE;
        RETURN;
    END IF;
    
    -- Verificar se não é auto-convite
    IF invite_record.sender_id = p_accepter_id THEN
        RETURN QUERY SELECT FALSE, 'Não é possível aceitar seu próprio convite', invite_record.sender_id, FALSE;
        RETURN;
    END IF;
    
    -- Marcar token como usado
    UPDATE invite_tokens 
    SET used = TRUE, 
        accepted_by = p_accepter_id, 
        used_at = NOW()
    WHERE token = p_token;
    
    IF p_accept THEN
        -- Estabelecer conexão entre os usuários
        BEGIN
            -- Atualizar couple_data JSONB para ambos os usuários
            UPDATE users 
            SET couple_data = jsonb_build_object(
                'partnerId', p_accepter_id,
                'partnerName', (SELECT name FROM users WHERE id = p_accepter_id),
                'partnerEmail', (SELECT email FROM users WHERE id = p_accepter_id),
                'connectionCode', COALESCE((couple_data->>'connectionCode'), ''),
                'connectedAt', NOW()::text,
                'isActive', true,
                'shareTransactions', true,
                'shareGoals', true,
                'shareReports', true
            ),
            updated_at = NOW()
            WHERE id = invite_record.sender_id;
            
            UPDATE users 
            SET couple_data = jsonb_build_object(
                'partnerId', invite_record.sender_id,
                'partnerName', (SELECT name FROM users WHERE id = invite_record.sender_id),
                'partnerEmail', (SELECT email FROM users WHERE id = invite_record.sender_id),
                'connectionCode', COALESCE((couple_data->>'connectionCode'), ''),
                'connectedAt', NOW()::text,
                'isActive', true,
                'shareTransactions', true,
                'shareGoals', true,
                'shareReports', true
            ),
            updated_at = NOW()
            WHERE id = p_accepter_id;
            
            connection_success := TRUE;
            
            -- Registrar logs para ambos
            INSERT INTO connection_logs (user_id, partner_id, event_type, metadata)
            VALUES 
                (invite_record.sender_id, p_accepter_id, 'connection_established', jsonb_build_object('via_invite', TRUE)),
                (p_accepter_id, invite_record.sender_id, 'connection_established', jsonb_build_object('via_invite', TRUE));
                
        EXCEPTION WHEN OTHERS THEN
            connection_success := FALSE;
        END;
        
        -- Registrar aceitação
        INSERT INTO connection_logs (user_id, event_type, metadata)
        VALUES (p_accepter_id, 'invite_accepted', jsonb_build_object(
            'token', p_token,
            'sender_id', invite_record.sender_id,
            'connection_success', connection_success
        ));
        
        RETURN QUERY SELECT TRUE, 'Convite aceito com sucesso', invite_record.sender_id, connection_success;
    ELSE
        -- Registrar rejeição
        INSERT INTO connection_logs (user_id, event_type, metadata)
        VALUES (p_accepter_id, 'invite_rejected', jsonb_build_object(
            'token', p_token,
            'sender_id', invite_record.sender_id
        ));
        
        RETURN QUERY SELECT TRUE, 'Convite rejeitado', invite_record.sender_id, FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TRIGGERS E AUTOMAÇÕES
-- =====================================================

-- Trigger para limpeza automática de tokens expirados (executar a cada hora)
-- Nota: Requer extensão pg_cron para agendamento automático
-- SELECT cron.schedule('cleanup-expired-tokens', '0 * * * *', 'SELECT cleanup_expired_invite_tokens();');

-- =====================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE invite_tokens IS 'Tabela para gerenciar tokens de convite para conexão entre parceiros';
COMMENT ON TABLE connection_logs IS 'Tabela para registrar eventos de conexão e monitoramento de estabilidade';

COMMENT ON FUNCTION generate_unique_invite_token() IS 'Gera um token único de 32 caracteres para convites';
COMMENT ON FUNCTION cleanup_expired_invite_tokens() IS 'Remove tokens expirados da tabela invite_tokens';
COMMENT ON FUNCTION create_invite_token(UUID, TEXT, INTEGER) IS 'Cria um novo token de convite com expiração configurável';
COMMENT ON FUNCTION validate_invite_token(TEXT) IS 'Valida um token de convite e retorna informações do remetente';
COMMENT ON FUNCTION accept_invite_token(TEXT, UUID, BOOLEAN) IS 'Processa aceitação/rejeição de convite e estabelece conexão';

-- Finalizar migração
-- Migração 035_create_invite_system.sql executada com sucesso!