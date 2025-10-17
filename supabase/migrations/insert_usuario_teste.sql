-- Script para inserir usuário de teste para importação dos CSVs
-- Este usuário é necessário para satisfazer a foreign key constraint das transações

-- Inserir usuário de teste com UUID específico usado nos CSVs
INSERT INTO users (
  id,
  email,
  name,
  avatar_url,
  couple_data,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'teste@zetafin.com',
  'Usuário Teste ZetaFin',
  NULL,
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = NOW();

-- Verificar se o usuário foi inserido corretamente
SELECT 
  id,
  email,
  name,
  created_at
FROM users 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';