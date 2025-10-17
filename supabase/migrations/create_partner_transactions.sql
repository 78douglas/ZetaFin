-- Criar transações de teste para o parceiro
-- Primeiro, vamos verificar os dados do casal para obter o ID do parceiro

-- Inserir transações para o parceiro (usando o ID do parceiro que criamos)
INSERT INTO transactions (
  id,
  user_id,
  descricao,
  valor,
  tipo,
  categoria,
  data,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'partner-test-id-123',  -- ID fictício do parceiro
  'Compra no supermercado - Parceiro',
  -150.00,
  'despesa',
  'Alimentação',
  '2024-01-15',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'partner-test-id-123',  -- ID fictício do parceiro
  'Salário - Parceiro',
  3500.00,
  'receita',
  'Salário',
  '2024-01-01',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'partner-test-id-123',  -- ID fictício do parceiro
  'Conta de luz - Parceiro',
  -120.00,
  'despesa',
  'Utilidades',
  '2024-01-10',
  NOW(),
  NOW()
);