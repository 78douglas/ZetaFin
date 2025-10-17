-- Script simplificado para simular transações do parceiro
-- Usar um UUID fixo para simular um parceiro
DO $$
DECLARE
    partner_user_id uuid := '11111111-1111-1111-1111-111111111111';
    current_user_id uuid;
    alimentacao_category_id uuid;
    transporte_category_id uuid;
    moradia_category_id uuid;
    lazer_category_id uuid;
BEGIN
    -- Buscar o user_id do usuário atual (78douglas@gmail.com)
    SELECT id INTO current_user_id 
    FROM auth.users 
    WHERE email = '78douglas@gmail.com';
    
    -- Criar perfil do usuário parceiro fictício
    INSERT INTO users (id, name, email, created_at, updated_at)
    VALUES (
        partner_user_id,
        'Maria Silva',
        'maria@teste.com',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        updated_at = NOW();
    
    -- Criar categorias para o parceiro
    INSERT INTO categories (user_id, name, icon, color, type, is_default, created_at, updated_at) VALUES
    (partner_user_id, 'Alimentação', '🍽️', '#FF6B6B', 'DESPESA', true, NOW(), NOW()),
    (partner_user_id, 'Transporte', '🚗', '#4ECDC4', 'DESPESA', true, NOW(), NOW()),
    (partner_user_id, 'Moradia', '🏠', '#45B7D1', 'DESPESA', true, NOW(), NOW()),
    (partner_user_id, 'Lazer', '🎮', '#DDA0DD', 'DESPESA', true, NOW(), NOW()),
    (partner_user_id, 'Salário', '💰', '#90EE90', 'RECEITA', true, NOW(), NOW())
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- Buscar IDs das categorias do parceiro
    SELECT id INTO alimentacao_category_id FROM categories WHERE user_id = partner_user_id AND name = 'Alimentação';
    SELECT id INTO transporte_category_id FROM categories WHERE user_id = partner_user_id AND name = 'Transporte';
    SELECT id INTO moradia_category_id FROM categories WHERE user_id = partner_user_id AND name = 'Moradia';
    SELECT id INTO lazer_category_id FROM categories WHERE user_id = partner_user_id AND name = 'Lazer';
    
    -- Criar transações do parceiro
    INSERT INTO transactions (user_id, category_id, description, amount, type, transaction_date, created_at, updated_at) VALUES
    (partner_user_id, alimentacao_category_id, 'Jantar Romântico', 120.00, 'DESPESA', CURRENT_DATE - INTERVAL '2 days', NOW(), NOW()),
    (partner_user_id, transporte_category_id, 'Uber para o trabalho', 25.50, 'DESPESA', CURRENT_DATE - INTERVAL '1 day', NOW(), NOW()),
    (partner_user_id, moradia_category_id, 'Conta de luz', 180.00, 'DESPESA', CURRENT_DATE - INTERVAL '3 days', NOW(), NOW()),
    (partner_user_id, lazer_category_id, 'Cinema', 45.00, 'DESPESA', CURRENT_DATE, NOW(), NOW()),
    (partner_user_id, alimentacao_category_id, 'Supermercado', 85.30, 'DESPESA', CURRENT_DATE - INTERVAL '4 days', NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Conectar os usuários como casal (simulando conexão)
    INSERT INTO couple_connections (user_id, partner_id, partner_name, connection_code, is_connected, created_at, updated_at)
    VALUES 
    (current_user_id, partner_user_id, 'Maria Silva', 'TEST123', true, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET 
        partner_id = EXCLUDED.partner_id,
        partner_name = EXCLUDED.partner_name,
        is_connected = true,
        updated_at = NOW();
    
    RAISE NOTICE 'Transações do parceiro criadas com sucesso!';
    RAISE NOTICE 'Partner User ID: %', partner_user_id;
    RAISE NOTICE 'Current User ID: %', current_user_id;
END $$;