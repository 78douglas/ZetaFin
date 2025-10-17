-- Debug completo dos problemas de dados
-- Verificar dados existentes e problemas

-- 1. Verificar usuários existentes
SELECT 
    id,
    email,
    name,
    couple_data,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. Verificar se há couple_data com códigos
SELECT 
    id,
    email,
    name,
    couple_data->>'myCode' as my_code,
    couple_data->>'partnerCode' as partner_code,
    couple_data->>'isConnected' as is_connected
FROM users 
WHERE couple_data IS NOT NULL;

-- 3. Verificar tokens de convite existentes
SELECT 
    id,
    sender_id,
    token,
    message,
    status,
    expires_at,
    created_at
FROM invite_tokens
ORDER BY created_at DESC;

-- 4. Verificar logs de conexão
SELECT 
    id,
    user_id,
    event_type,
    metadata,
    event_details,
    created_at
FROM connection_logs
ORDER BY created_at DESC
LIMIT 10;

-- 5. Criar dados de teste se não existirem
DO $$
DECLARE
    test_user_id uuid;
    test_code text;
BEGIN
    -- Verificar se há usuários
    IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        -- Criar usuário de teste
        INSERT INTO users (email, name, couple_data) 
        VALUES (
            'teste@zetafin.com',
            'Usuário Teste',
            jsonb_build_object(
                'myCode', 'TEST123',
                'partnerCode', null,
                'isConnected', false,
                'lastUpdated', now()
            )
        )
        RETURNING id INTO test_user_id;
        
        RAISE NOTICE 'Usuário de teste criado: %', test_user_id;
    END IF;
END $$;