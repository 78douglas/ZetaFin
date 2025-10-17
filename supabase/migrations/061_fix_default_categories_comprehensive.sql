-- Migração para criar todas as categorias padrão necessárias
-- Esta migração garante que todas as categorias usadas no TransactionForm estejam disponíveis

-- Primeiro, vamos limpar categorias padrão existentes para evitar duplicatas
DELETE FROM categories WHERE is_default = true;

-- Inserir categorias de DESPESA e RECEITA
INSERT INTO categories (id, user_id, name, icon, color, type, is_default, created_at) VALUES
-- Categorias de Despesa
('cat_moradia_default', '00000000-0000-0000-0000-000000000000', 'Moradia', '🏠', '#ef4444', 'DESPESA', true, now()),
('cat_alimentacao_default', '00000000-0000-0000-0000-000000000000', 'Alimentação', '🍽️', '#f97316', 'DESPESA', true, now()),
('cat_transporte_default', '00000000-0000-0000-0000-000000000000', 'Transporte', '🚗', '#eab308', 'DESPESA', true, now()),
('cat_saude_default', '00000000-0000-0000-0000-000000000000', 'Saúde', '🏥', '#22c55e', 'DESPESA', true, now()),
('cat_lazer_default', '00000000-0000-0000-0000-000000000000', 'Lazer', '🎮', '#3b82f6', 'DESPESA', true, now()),
('cat_educacao_default', '00000000-0000-0000-0000-000000000000', 'Educação', '📚', '#6366f1', 'DESPESA', true, now()),
('cat_dividas_despesa_default', '00000000-0000-0000-0000-000000000000', 'Dívidas', '💳', '#8b5cf6', 'DESPESA', true, now()),
('cat_outros_despesa_default', '00000000-0000-0000-0000-000000000000', 'Outros', '📝', '#ec4899', 'DESPESA', true, now()),

-- Categorias de RECEITA
('cat_salario_default', '00000000-0000-0000-0000-000000000000', 'Salário', '💰', '#22c55e', 'RECEITA', true, now()),
('cat_emprestimo_default', '00000000-0000-0000-0000-000000000000', 'Empréstimo', '🏦', '#3b82f6', 'RECEITA', true, now()),
('cat_presente_default', '00000000-0000-0000-0000-000000000000', 'Presente', '🎁', '#f97316', 'RECEITA', true, now()),
('cat_vendas_default', '00000000-0000-0000-0000-000000000000', 'Vendas', '🛒', '#eab308', 'RECEITA', true, now()),
('cat_freelance_default', '00000000-0000-0000-0000-000000000000', 'Freelance', '💻', '#6366f1', 'RECEITA', true, now()),
('cat_investimentos_default', '00000000-0000-0000-0000-000000000000', 'Investimentos', '📈', '#10b981', 'RECEITA', true, now()),
('cat_dividas_receita_default', '00000000-0000-0000-0000-000000000000', 'Dívidas', '💳', '#8b5cf6', 'RECEITA', true, now()),
('cat_outros_receita_default', '00000000-0000-0000-0000-000000000000', 'Outros', '📝', '#ec4899', 'RECEITA', true, now());

-- Criar função para obter categorias padrão por tipo
CREATE OR REPLACE FUNCTION get_default_categories(category_type text DEFAULT 'AMBOS')
RETURNS TABLE (
    id uuid,
    name varchar,
    icon varchar,
    color varchar,
    type varchar,
    is_default boolean
) AS $$
BEGIN
    IF category_type = 'AMBOS' THEN
        RETURN QUERY
        SELECT c.id, c.name, c.icon, c.color, c.type, c.is_default
        FROM categories c
        WHERE c.is_default = true
        ORDER BY c.name;
    ELSE
        RETURN QUERY
        SELECT c.id, c.name, c.icon, c.color, c.type, c.is_default
        FROM categories c
        WHERE c.is_default = true AND c.type = category_type
        ORDER BY c.name;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar políticas RLS para permitir acesso às categorias padrão
DROP POLICY IF EXISTS "Users can view default categories" ON categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Allow public access to default categories" ON categories;

-- Política principal: usuários podem ver suas próprias categorias E categorias padrão
CREATE POLICY "Users can view categories" ON categories
    FOR SELECT USING (user_id = auth.uid() OR is_default = true);

-- Política para permitir acesso público às categorias padrão (para usuários não logados)
CREATE POLICY "Public access to default categories" ON categories
    FOR SELECT USING (is_default = true);

-- Comentário para documentar a migração
COMMENT ON TABLE categories IS 'Tabela de categorias com categorias padrão globais disponíveis para todos os usuários';