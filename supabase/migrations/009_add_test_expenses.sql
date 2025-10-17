-- Adicionar transações de despesa para teste
-- Primeiro, obter o user_id do usuário 78douglas@gmail.com
DO $$
DECLARE
    douglas_user_id uuid;
    alimentacao_category_id uuid;
    transporte_category_id uuid;
    moradia_category_id uuid;
    lazer_category_id uuid;
BEGIN
    -- Buscar o user_id do usuário 78douglas@gmail.com
    SELECT id INTO douglas_user_id 
    FROM auth.users 
    WHERE email = '78douglas@gmail.com';
    
    -- Se o usuário existe, buscar as categorias e criar transações de teste
    IF douglas_user_id IS NOT NULL THEN
        -- Buscar IDs das categorias
        SELECT id INTO alimentacao_category_id FROM categories WHERE user_id = douglas_user_id AND name = 'Alimentação';
        SELECT id INTO transporte_category_id FROM categories WHERE user_id = douglas_user_id AND name = 'Transporte';
        SELECT id INTO moradia_category_id FROM categories WHERE user_id = douglas_user_id AND name = 'Moradia';
        SELECT id INTO lazer_category_id FROM categories WHERE user_id = douglas_user_id AND name = 'Lazer';
        
        -- Inserir transações de despesa para teste
        INSERT INTO transactions (user_id, category_id, description, amount, type, transaction_date) VALUES
        (douglas_user_id, alimentacao_category_id, 'Supermercado', 250.00, 'DESPESA', CURRENT_DATE - INTERVAL '5 days'),
        (douglas_user_id, alimentacao_category_id, 'Restaurante', 85.50, 'DESPESA', CURRENT_DATE - INTERVAL '3 days'),
        (douglas_user_id, transporte_category_id, 'Combustível', 120.00, 'DESPESA', CURRENT_DATE - INTERVAL '7 days'),
        (douglas_user_id, transporte_category_id, 'Uber', 35.00, 'DESPESA', CURRENT_DATE - INTERVAL '2 days'),
        (douglas_user_id, moradia_category_id, 'Conta de luz', 180.00, 'DESPESA', CURRENT_DATE - INTERVAL '10 days'),
        (douglas_user_id, moradia_category_id, 'Internet', 99.90, 'DESPESA', CURRENT_DATE - INTERVAL '8 days'),
        (douglas_user_id, lazer_category_id, 'Cinema', 45.00, 'DESPESA', CURRENT_DATE - INTERVAL '4 days'),
        (douglas_user_id, lazer_category_id, 'Netflix', 29.90, 'DESPESA', CURRENT_DATE - INTERVAL '1 day');
        
        RAISE NOTICE 'Transações de despesa criadas para teste';
    ELSE
        RAISE NOTICE 'Usuário 78douglas@gmail.com não encontrado';
    END IF;
END $$;