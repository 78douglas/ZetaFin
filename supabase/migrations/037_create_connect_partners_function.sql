-- Função para conectar parceiros de forma atômica
-- Evita problemas de concorrência e garante consistência dos dados

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
    
    -- Atualizar dados do usuário 1
    UPDATE users 
    SET couple_data = jsonb_build_object(
        'isConnected', true,
        'partnerId', user2_id::text,
        'partnerName', user2_name,
        'connectionDate', connection_date,
        'connectionCode', user1_code
    )
    WHERE id = user1_id;
    
    -- Atualizar dados do usuário 2
    UPDATE users 
    SET couple_data = jsonb_build_object(
        'isConnected', true,
        'partnerId', user1_id::text,
        'partnerName', user1_name,
        'connectionDate', connection_date,
        'connectionCode', user2_code
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

-- Função para desconectar parceiros de forma atômica
CREATE OR REPLACE FUNCTION disconnect_partners(
    user1_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    partner_id_text text;
    partner_id_uuid uuid;
    new_code1 text;
    new_code2 text;
BEGIN
    -- Obter ID do parceiro
    SELECT couple_data->>'partnerId' INTO partner_id_text
    FROM users 
    WHERE id = user1_id;
    
    IF partner_id_text IS NULL THEN
        RAISE EXCEPTION 'Usuário não está conectado a um parceiro';
    END IF;
    
    partner_id_uuid := partner_id_text::uuid;
    
    -- Gerar novos códigos de conexão
    new_code1 := UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6));
    new_code2 := UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6));
    
    -- Desconectar usuário 1
    UPDATE users 
    SET couple_data = jsonb_build_object(
        'isConnected', false,
        'partnerId', null,
        'partnerName', null,
        'connectionDate', null,
        'connectionCode', new_code1
    )
    WHERE id = user1_id;
    
    -- Desconectar usuário 2 (parceiro)
    UPDATE users 
    SET couple_data = jsonb_build_object(
        'isConnected', false,
        'partnerId', null,
        'partnerName', null,
        'connectionDate', null,
        'connectionCode', new_code2
    )
    WHERE id = partner_id_uuid;
    
    -- Log da desconexão
    INSERT INTO connection_logs (user_id, partner_id, event_type, event_details, timestamp)
    VALUES 
        (user1_id, partner_id_uuid, 'disconnect', 'Parceiros desconectados via função atômica', NOW()::text),
        (partner_id_uuid, user1_id, 'disconnect', 'Parceiros desconectados via função atômica', NOW()::text);
        
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO connection_logs (user_id, partner_id, event_type, event_details, timestamp)
        VALUES 
            (user1_id, partner_id_uuid, 'error', 'Erro ao desconectar parceiros: ' || SQLERRM, NOW()::text);
        
        -- Re-raise o erro
        RAISE;
END;
$$;

-- Comentários para documentação
COMMENT ON FUNCTION connect_partners(uuid, text, uuid, text) IS 'Conecta dois usuários como parceiros de forma atômica';
COMMENT ON FUNCTION disconnect_partners(uuid) IS 'Desconecta um usuário do seu parceiro de forma atômica';