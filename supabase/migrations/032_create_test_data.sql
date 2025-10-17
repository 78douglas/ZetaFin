-- Criar dados de teste para o usuário cc116640-a6ca-4dde-ab87-cd3d9a02085f

-- Primeiro, inserir o usuário na tabela users se não existir
INSERT INTO users (id, email, name, avatar_url, created_at, updated_at)
VALUES (
  'cc116640-a6ca-4dde-ab87-cd3d9a02085f',
  '78douglas@gmail.com',
  'Douglas',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Inserir categorias padrão para o usuário
INSERT INTO categories (id, user_id, name, icon, color, is_default, created_at)
VALUES 
  (gen_random_uuid(), 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Alimentação', '🍽️', '#FF6B6B', true, NOW()),
  (gen_random_uuid(), 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Transporte', '🚗', '#4ECDC4', true, NOW()),
  (gen_random_uuid(), 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Moradia', '🏠', '#45B7D1', true, NOW()),
  (gen_random_uuid(), 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Saúde', '🏥', '#96CEB4', true, NOW()),
  (gen_random_uuid(), 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Educação', '📚', '#FFEAA7', true, NOW()),
  (gen_random_uuid(), 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Lazer', '🎮', '#DDA0DD', true, NOW()),
  (gen_random_uuid(), 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Outros', '📦', '#AED6F1', true, NOW()),
  (gen_random_uuid(), 'cc116640-a6ca-4dde-ab87-cd3d9a02085f', 'Salário', '💰', '#90EE90', true, NOW())
ON CONFLICT DO NOTHING;

-- Inserir algumas transações de teste
WITH categoria_outros AS (
  SELECT id FROM categories 
  WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' 
  AND name = 'Outros' 
  LIMIT 1
),
categoria_salario AS (
  SELECT id FROM categories 
  WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' 
  AND name = 'Salário' 
  LIMIT 1
)
INSERT INTO transactions (id, user_id, category_id, description, amount, type, transaction_date, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'cc116640-a6ca-4dde-ab87-cd3d9a02085f',
  categoria_outros.id,
  'Teste de despesa',
  1000.00,
  'DESPESA',
  CURRENT_DATE,
  NOW(),
  NOW()
FROM categoria_outros
UNION ALL
SELECT 
  gen_random_uuid(),
  'cc116640-a6ca-4dde-ab87-cd3d9a02085f',
  categoria_salario.id,
  'Teste de receita',
  5000.00,
  'RECEITA',
  CURRENT_DATE,
  NOW(),
  NOW()
FROM categoria_salario;

-- Verificar se os dados foram inseridos
SELECT 'Dados inseridos com sucesso!' as resultado;