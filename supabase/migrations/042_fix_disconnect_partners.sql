-- Corrigir função disconnect_partners para usar a estrutura correta dos dados
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
    
    -- Desconectar usuário 1 (usar myCode em vez de connectionCode)
    UPDATE users 
    SET couple_data = jsonb_build_object(
        'isConnected', false,
        'myCode', new_code1,
        'partnerId', null,
        'partnerName', null,
        'partnerCode', null,
        'connectionDate', null
    )
    WHERE id = user1_id;
    
    -- Desconectar usuário 2 (parceiro) (usar myCode em vez de connectionCode)
    UPDATE users 
    SET couple_data = jsonb_build_object(
        'isConnected', false,
        'myCode', new_code2,
        'partnerId', null,
        'partnerName', null,
        'partnerCode', null,
        'connectionDate', null
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
            (user1_id, COALESCE(partner_id_uuid, '00000000-0000-0000-0000-000000000000'::uuid), 'error', 'Erro ao desconectar parceiros: ' || SQLERRM, NOW()::text);
        
        -- Re-raise o erro
        RAISE;
END;
$$;

-- Comentário atualizado
COMMENT ON FUNCTION disconnect_partners(uuid) IS 'Desconecta um usuário do seu parceiro de forma atômica, limpando todos os dados de conexão';