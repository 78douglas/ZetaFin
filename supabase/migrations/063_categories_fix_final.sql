-- Migração final para criar todas as categorias padrão necessárias
-- Esta migração garante que todas as categorias usadas no TransactionForm estejam disponíveis

-- Primeiro, modificar a estrutura para permitir user_id NULL para categorias padrão
ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;

-- Limpar categorias padrão existentes para evitar duplicatas
DELETE FROM categories WHERE is_default = true;

-- Inserir categorias de DESPESA e RECEITA
INSERT INTO categories (user_id, name, icon, color, type, is_default, created_at) VALUES
-- Categorias de Despesa
(NULL, 'Moradia', '🏠', '#ef4444', 'DESPESA', true, now()),
(NULL, 'Alimentação', '🍽️', '#f97316', 'DESPESA', true, now()),
(NULL, 'Transporte', '🚗', '#eab308', 'DESPESA', true, now()),
(NULL, 'Saúde', '🏥', '#22c55e', 'DESPESA', true, now()),
(NULL, 'Lazer', '🎮', '#3b82f6', 'DESPESA', true, now()),
(NULL, 'Educação', '📚', '#6366f1', 'DESPESA', true, now()),
(NULL, 'Dívidas', '💳', '#8b5cf6', 'DESPESA', true, now()),
(NULL, 'Outros', '📝', '#ec4899', 'DESPESA', true, now()),

-- Categorias de RECEITA
(NULL, 'Salário', '💰', '#22c55e', 'RECEITA', true, now()),
(NULL, 'Empréstimo', '🏦', '#3b82f6', 'RECEITA', true, now()),
(NULL, 'Presente', '🎁', '#f97316', 'RECEITA', true, now()),
(NULL, 'Vendas', '🛒', '#eab308', 'RECEITA', true, now()),
(NULL, 'Freelance', '💻', '#6366f1', 'RECEITA', true, now()),
(NULL, 'Investimentos', '📈', '#10b981', 'RECEITA', true, now()),
(NULL, 'Dívidas', '💳', '#8b5cf6', 'RECEITA', true, now()),
(NULL, 'Outros', '📝', '#ec4899', 'RECEITA', true, now());

-- Atualizar políticas RLS para permitir acesso às categorias padrão
DROP POLICY IF EXISTS "Users can view default categories" ON categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Allow public access to default categories" ON categories;
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Public access to default categories" ON categories;

-- Política principal: usuários podem ver suas próprias categorias E categorias padrão
CREATE POLICY "Users can view categories" ON categories
    FOR SELECT USING (user_id = auth.uid() OR is_default = true OR user_id IS NULL);

-- Política para permitir acesso público às categorias padrão (para usuários não logados)
CREATE POLICY "Public access to default categories" ON categories
    FOR SELECT USING (is_default = true OR user_id IS NULL);

-- Comentário para documentar a migração
COMMENT ON TABLE categories IS 'Tabela de categorias com categorias padrão globais disponíveis para todos os usuários';