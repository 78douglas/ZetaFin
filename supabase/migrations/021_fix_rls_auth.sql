-- Correção das políticas RLS para funcionar com auth.uid()
-- O problema pode ser que as políticas não estão reconhecendo o usuário autenticado

-- Primeiro, vamos verificar se o usuário existe na tabela auth.users
-- e se corresponde ao usuário na tabela public.users

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "categories_policy" ON categories;
DROP POLICY IF EXISTS "transactions_policy" ON transactions;

-- Criar políticas mais simples e diretas
-- Política para users - permitir acesso completo aos próprios dados
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_policy" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Política para categories - permitir acesso completo às categorias do usuário
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_policy" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_policy" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "categories_delete_policy" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Política para transactions - permitir acesso completo às transações do usuário
CREATE POLICY "transactions_select_policy" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_policy" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_policy" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete_policy" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Garantir que RLS está habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar o auth.uid() atual
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Comentário
COMMENT ON FUNCTION get_current_user_id() IS 'Retorna o ID do usuário autenticado atual'