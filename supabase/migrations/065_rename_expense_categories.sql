-- Migração para atualizar as categorias de despesas conforme solicitado pelo usuário
-- Renomear categorias para: Moradia, Alimentação, Saúde, Educação, Lazer, Dívidas, Outras

-- Primeiro, limpar categorias padrão de despesas existentes
DELETE FROM categories WHERE is_default = true AND type = 'DESPESA';

-- Inserir as novas categorias de despesas com os nomes corretos
INSERT INTO categories (user_id, name, icon, color, type, is_default, created_at) VALUES
-- Categorias de Despesa (conforme solicitado)
(NULL, 'Moradia', '🏠', '#ef4444', 'DESPESA', true, now()),
(NULL, 'Alimentação', '🍽️', '#f97316', 'DESPESA', true, now()),
(NULL, 'Saúde', '🏥', '#22c55e', 'DESPESA', true, now()),
(NULL, 'Educação', '📚', '#6366f1', 'DESPESA', true, now()),
(NULL, 'Lazer', '🎮', '#3b82f6', 'DESPESA', true, now()),
(NULL, 'Dívidas', '💳', '#8b5cf6', 'DESPESA', true, now()),
(NULL, 'Outras', '📝', '#ec4899', 'DESPESA', true, now());

-- Verificar se as categorias foram inseridas corretamente
SELECT name, icon, type FROM categories WHERE is_default = true AND type = 'DESPESA' ORDER BY name;