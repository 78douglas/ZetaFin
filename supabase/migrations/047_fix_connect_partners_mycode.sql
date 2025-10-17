-- Corrigir função connect_partners para usar myCode em vez de connectionCode
CREATE OR REPLACE FUNCTION connect_partners(
    user1_id uuid,
    user1_name text,
    user2_id uuid,
    user2_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    connection_date text;
    user1_code text;
    user2_code text;
BEGIN
    -- Verificar se os usuários existem
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = user1_id) THEN
        RAISE EXCEPTION 'Usuário 1 não encontrado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = user2_id) THEN
        RAISE EXCEPTION 'Usuário 2 não encontrado';
    END IF;
    
    -- Gerar data de conexão
    connection_date := NOW()::text;
    
    -- Gerar novos códigos de conexão
    user1_code := UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6));
    user2_code := UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6));
    
    -- Atualizar dados do usuário 1 (usando myCode)
    UPDATE users 
    SET couple_data = jsonb_build_object(
        'isConnected', true,
        'partnerId', user2_id::text,
        'partnerName', user2_name,
        'connectionDate', connection_date,
        'myCode', user1_code,
        'partnerCode', user2_code
    )
    WHERE id = user1_id;
    
    -- Atualizar dados do usuário 2 (usando myCode)
    UPDATE users 
    SET couple_data = jsonb_build_object(
        'isConnected', true,
        'partnerId', user1_id::text,
        'partnerName', user1_name,
        'connectionDate', connection_date,
        'myCode', user2_code,
        'partnerCode', user1_code
    )
    WHERE id = user2_id;
    
    -- Log da conexão
    INSERT INTO connection_logs (user_id, partner_id, event_type, event_details, timestamp)
    VALUES 
        (user1_id, user2_id, 'connect', 'Parceiros conectados via função atômica', connection_date),
        (user2_id, user1_id, 'connect', 'Parceiros conectados via função atômica', connection_date);
        
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO connection_logs (user_id, partner_id, event_type, event_details, timestamp)
        VALUES 
            (user1_id, user2_id, 'error', 'Erro ao conectar parceiros: ' || SQLERRM, NOW()::text);
        
        -- Re-raise o erro
        RAISE;
END;
$$;

COMMENT ON FUNCTION connect_partners(uuid, text, uuid, text) IS 'Conecta dois usuários como parceiros de forma atômica usando myCode';