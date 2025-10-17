-- Criar categorias padrão para o usuário 78douglas@gmail.com
-- Primeiro, obter o user_id do usuário
DO $$
DECLARE
    douglas_user_id uuid;
BEGIN
    -- Buscar o user_id do usuário 78douglas@gmail.com
    SELECT id INTO douglas_user_id 
    FROM auth.users 
    WHERE email = '78douglas@gmail.com';
    
    -- Se o usuário existe, criar as categorias padrão
    IF douglas_user_id IS NOT NULL THEN
        -- Verificar se já tem categorias
        IF NOT EXISTS (SELECT 1 FROM categories WHERE user_id = douglas_user_id) THEN
            -- Inserir categorias padrão
            INSERT INTO categories (user_id, name, icon, color, is_default) VALUES
            (douglas_user_id, 'Alimentação', '🍽️', '#FF6B6B', true),
            (douglas_user_id, 'Transporte', '🚗', '#4ECDC4', true),
            (douglas_user_id, 'Moradia', '🏠', '#45B7D1', true),
            (douglas_user_id, 'Saúde', '🏥', '#96CEB4', true),
            (douglas_user_id, 'Educação', '📚', '#FFEAA7', true),
            (douglas_user_id, 'Lazer', '🎮', '#DDA0DD', true),
            (douglas_user_id, 'Salário', '💰', '#98D8C8', true),
            (douglas_user_id, 'Freelance', '💻', '#F7DC6F', true),
            (douglas_user_id, 'Investimentos', '📈', '#BB8FCE', true),
            (douglas_user_id, 'Outros', '📦', '#AED6F1', true);
            
            RAISE NOTICE 'Categorias padrão criadas para o usuário 78douglas@gmail.com';
        ELSE
            RAISE NOTICE 'Usuário 78douglas@gmail.com já possui categorias';
        END IF;
    ELSE
        RAISE NOTICE 'Usuário 78douglas@gmail.com não encontrado';
    END IF;
END $$;