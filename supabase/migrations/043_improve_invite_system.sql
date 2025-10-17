-- Melhorar sistema de convites com melhor tratamento de erros
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
    attempt_count INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    -- Obter ID do usuário autenticado
    sender_id_val := auth.uid();
    
    IF sender_id_val IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado. Faça login para criar convites.';
    END IF;
    
    -- Verificar se o usuário existe
    IF NOT EXISTS(SELECT 1 FROM users WHERE id = sender_id_val) THEN
        RAISE EXCEPTION 'Usuário não encontrado no sistema.';
    END IF;
    
    -- Gerar token único com tentativas limitadas
    LOOP
        attempt_count := attempt_count + 1;
        new_token := UPPER(SUBSTRING(MD5(RANDOM()::text || NOW()::text || attempt_count::text) FROM 1 FOR 8));
        
        -- Verificar se o token é único
        IF NOT EXISTS(SELECT 1 FROM invite_tokens WHERE token = new_token) THEN
            EXIT; -- Token único encontrado
        END IF;
        
        -- Evitar loop infinito
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Não foi possível gerar um token único após % tentativas', max_attempts;
        END IF;
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
        'message', COALESCE(p_message, ''),
        'attempt_count', attempt_count
    ));
    
    -- Retornar dados do convite
    RETURN QUERY SELECT 
        new_token,
        base_url || '/invite/' || new_token,
        expiry_time;
        
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO connection_logs (user_id, event_type, metadata)
        VALUES (COALESCE(sender_id_val, '00000000-0000-0000-0000-000000000000'::uuid), 'error', jsonb_build_object(
            'error_message', SQLERRM,
            'error_code', SQLSTATE,
            'function', 'create_invite_token',
            'message', p_message
        ));
        
        -- Re-raise o erro
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Melhorar função de validação de convite
CREATE OR REPLACE FUNCTION validate_invite_token(p_token TEXT)
RETURNS TABLE(
    valid BOOLEAN,
    sender_id UUID,
    sender_name TEXT,
    sender_email TEXT,
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT
) AS $$
BEGIN
    -- Verificar se o token existe e está válido
    RETURN QUERY
    SELECT 
        CASE 
            WHEN it.token IS NULL THEN false
            WHEN it.status != 'pending' THEN false
            WHEN it.expires_at < NOW() THEN false
            ELSE true
        END as valid,
        it.sender_id,
        u.name as sender_name,
        u.email as sender_email,
        it.message,
        it.expires_at,
        it.status
    FROM invite_tokens it
    LEFT JOIN users u ON u.id = it.sender_id
    WHERE it.token = p_token;
    
    -- Se não encontrou nenhum resultado, retornar um registro inválido
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            false as valid,
            NULL::UUID as sender_id,
            NULL::TEXT as sender_name,
            NULL::TEXT as sender_email,
            NULL::TEXT as message,
            NULL::TIMESTAMP WITH TIME ZONE as expires_at,
            'not_found'::TEXT as status;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários a