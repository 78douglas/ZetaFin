-- Adicionar categorias padrão para o usuário Douglas (78douglas@gmail.com)
-- ID do usuário: cc116640-a6ca-4dde-ab87-cd3d9a02085f

-- Primeiro, verificar se as categorias já existem e deletar se necessário
DELETE FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f';

-- Inserir categorias padrão
INSERT INTO categories (user_id, name, icon, color, is_default) VALUES
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Moradia', '🏠', '#FF6B6B', true),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Alimentação', '🍽️', '#4ECDC4', true),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Transporte', '🚗', '#45B7D1', true),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Saúde', '🏥', '#96CEB4', true),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Educação', '📚', '#FFEAA7', true),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Lazer', '🎮', '#DDA0DD', true),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Vestuário', '👕', '#FFB6C1', true),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Outros', '📦', '#AED6F1', true);