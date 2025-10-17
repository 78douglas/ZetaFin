-- Criar categorias padrão globais para todos os usuários
-- Estas categorias serão criadas automaticamente para cada novo usuário

-- Função para criar categorias padrão para um usuário
CREATE OR REPLACE FUNCTION create_default_categories_for_user(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Verificar se o usuário já tem categorias
  IF NOT EXISTS (SELECT 1 FROM categories WHERE user_id = user_id_param) THEN
    -- Inserir categorias padrão
    INSERT INTO categories (user_id, name, icon, color, is_default) VALUES
    (user_id_param, 'Alimentação', '🍽️', '#FF6B6B', true),
    (user_id_param, 'Transporte', '🚗', '#4ECDC4', true),
    (user_id_param, 'Moradia', '🏠', '#45B7D1', true),
    (user_id_param, 'Saúde', '🏥', '#96CEB4', true),
    (user_id_param, 'Educação', '📚', '#FFEAA7', true),
    (user_id_param, 'Lazer', '🎮', '#DDA0DD', true),
    (user_id_param, 'Compras', '🛍️', '#F8BBD9', true),
    (user_id_param, 'Contas', '📄', '#FFC107', true),
    (user_id_param, 'Salário', '💰', '#98D8C8', true),
    (user_id_param, 'Freelance', '💻', '#F7DC6F', true),
    (user_id_param, 'Investimentos', '📈', '#BB8FCE', true),
    (user_id_param, 'Outros', '📦', '#AED6F1', true);
    
    RAISE NOTICE 'Categorias padrão criadas para o usuário %', user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar categorias automaticamente quando um novo usuário é inserido
CREATE OR REPLACE FUNCTION trigger_create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar categorias padrão para o novo usuário
  PERFORM create_default_categories_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS create_categories_on_user_insert ON users;
CREATE TRIGGER create_categories_on_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_categories();

-- Criar categorias padrão para usuários existentes que não têm categorias
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM users LOOP
    PERFORM create_default_categories_for_user(user_record.id);
  END LOOP;
END $$;