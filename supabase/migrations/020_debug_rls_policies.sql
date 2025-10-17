-- Debug e correção das políticas RLS
-- Verificar se as políticas estão funcionando corretamente

-- Primeiro, vamos recriar as políticas com uma abordagem mais simples
-- Remover políticas existentes
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "categories_policy" ON categories;
DROP POLICY IF EXISTS "transactions_policy" ON transactions;

-- Criar políticas mais permissivas para debug
-- Política para users - permitir acesso aos próprios dados
CREATE POLICY "users_policy" ON users
  FOR ALL USING (auth.uid() = id);

-- Política para categories - permitir acesso às categorias do usuário
CREATE POLICY "categories_policy" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Política para transactions - permitir acesso às transações do usuário
CREATE POLICY "transactions_policy" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Verificar se auth.uid() está funcionando
-- Criar uma função para debug
CREATE OR REPLACE FUNCTION debug_auth_uid()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Garantir que RLS está habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Comentário para debug
COMMENT ON FUNCTION debug_auth_uid() IS 'Função para debug do auth.uid()';