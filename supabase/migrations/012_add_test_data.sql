-- Adicionar dados de teste para o usuário Douglas
-- ID do usuário: cc116640-a6ca-4dde-ab87-cd3d9a02085f

-- Primeiro, limpar dados existentes
DELETE FROM transactions WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f';
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

-- Inserir algumas transações de teste
INSERT INTO transactions (user_id, category_id, description, amount, type, transaction_date, notes) VALUES
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 
 (SELECT id FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' AND name = 'Moradia' LIMIT 1),
 'Aluguel', 1200.00, 'DESPESA', '2024-12-01', 'Aluguel mensal'),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 
 (SELECT id FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' AND name = 'Alimentação' LIMIT 1),
 'Supermercado', 350.00, 'DESPESA', '2024-12-05', 'Compras do mês'),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 
 (SELECT id FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' AND name = 'Transporte' LIMIT 1),
 'Combustível', 200.00, 'DESPESA', '2024-12-10', 'Gasolina'),
('cc116640-a6ca-4dde-ab87-cd3d9a02085f', 
 (SELECT id FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' AND name = 'Lazer' LIMIT 1),
 'Cinema', 50.00, 'DESPESA', '2024-12-15', 'Filme com a família');