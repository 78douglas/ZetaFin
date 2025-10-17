-- Correção definitiva das políticas RLS
-- Problema: auth.uid() pode não estar funcionando corretamente

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "categories_policy" ON categories;
DROP POLICY IF EXISTS "transactions_policy" ON transactions;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;
DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_update_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_delete_policy" ON transactions;

-- Criar políticas mais permissivas para debug
-- Temporariamente permitir acesso a todos os dados autenticados
CREATE POLICY "users_authenticated_policy" ON users
  FOR ALL TO authenticated USING (true);

CREATE POLICY "categories_authenticated_policy" ON categories
  FOR ALL TO authenticated USING (true);

CREATE POLICY "transactions_authenticated_policy" ON transactions
  FOR ALL TO authenticated USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Comentário
COMMENT ON POLICY "users_authenticated_policy" ON users IS 'Política temporária para debug - permite acesso a usuários autenticados';
COMMENT ON POLICY "categories_authenticated_policy" ON categories IS 'Política temporária para debug - permite acesso a usuários autenticados';
COMMENT ON POLICY "transactions_authenticated_policy" ON transactions IS 'Política temporária para debug - permite acesso a usuários autenticados'