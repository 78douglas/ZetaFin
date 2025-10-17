-- Criar transações que simulam ser de um parceiro
-- Vamos usar o usuário atual mas marcar as transações como sendo do parceiro
INSERT INTO transactions (
  id,
  user_id,
  category_id,
  description,
  amount,
  type,
  transaction_date,
  notes,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'cc116640-a6ca-4dde-ab87-cd3d9a02085f',
  (SELECT id FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' LIMIT 1),
  'Compra no supermercado',
  150.00,
  'DESPESA',
  '2024-01-15',
  'PARTNER:Maria Silva',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'cc116640-a6ca-4dde-ab87-cd3d9a02085f',
  (SELECT id FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' LIMIT 1),
  'Salario mensal',
  3500.00,
  'RECEITA',
  '2024-01-01',
  'PARTNER:Maria Silva',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'cc116640-a6ca-4dde-ab87-cd3d9a02085f',
  (SELECT id FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f' LIMIT 1),
  'Conta de luz',
  120.00,
  'DESPESA',
  '2024-01-10',
  'PARTNER:Maria Silva',
  NOW(),
  NOW()
);
