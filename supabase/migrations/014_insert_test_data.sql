-- Inserir dados de teste para o usuário logado
-- Primeiro, inserir o usuário se não existir
INSERT INTO users (id, email, name, avatar_url, couple_data, created_at, updated_at) 
VALUES (
  'cc116640-a6ca-4dde-ab87-cd3d9a02085f',
  '78douglas@gmail.com',
  'Douglas',
  NULL,
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categories (id, user_id, name, icon, color, is_default, created_at) VALUES
('cat-1', 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Alimentação', '🍽️', '#FF6B6B', true, NOW()),
('cat-2', 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Transporte', '🚗', '#4ECDC4', true, NOW()),
('cat-3', 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Moradia', '🏠', '#45B7D1', true, NOW()),
('cat-4', 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Outros', '📦', '#AED6F1', true, NOW())
ON CONFLICT (user_id, name) DO NOTHING;

-- Inserir transações de teste
INSERT INTO transactions (id, user_id, category_id, description, amount, type, transaction_date, notes, created_at, updated_at) VALUES
('trans-1', 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'cat-1', 'Almoço', 25.50, 'DESPESA', '2025-01-13', 'Restaurante', NOW(), NOW()),
('trans-2', 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'cat-2', 'Uber', 15.00, 'DESPESA', '2025-01-13', 'Transporte', NOW(), NOW()),
('trans-3', 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'cat-3', 'Aluguel', 1200.00, 'DESPESA', '2025-01-13', 'Moradia', NOW(), NOW()),
('trans-4', 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'cat-4', 'Salário', 5000.00, 'RECEITA', '2025-01-13', 'Trabalho', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;