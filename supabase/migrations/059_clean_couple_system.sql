-- ============================================================================
-- MIGRATION: Limpeza simples do sistema de casais
-- ============================================================================

-- 1. REMOVER TABELAS DO SISTEMA DE CASAIS
DROP TABLE IF EXISTS connection_logs CASCADE;
DROP TABLE IF EXISTS invite_tokens CASCADE;

-- 2. REMOVER CAMPOS DA TABELA USERS
ALTER TABLE users DROP COLUMN IF EXISTS couple_data CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS couple_code CASCADE;

-- 3. REABILITAR RLS NAS TABELAS PRINCIPAIS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS SIMPLES PARA USUÁRIOS INDIVIDUAIS
-- (Remover todas as políticas existentes primeiro)

-- Users policies
DROP POLICY IF EXISTS "individual_users_select" ON users;
DROP POLICY IF EXISTS "individual_users_update" ON users;

CREATE POLICY "individual_users_select" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "individual_users_update" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Transactions policies
DROP POLICY IF EXISTS "individual_transactions_select" ON transactions;
DROP POLICY IF EXISTS "individual_transactions_insert" ON transactions;
DROP POLICY IF EXISTS "individual_transactions_update" ON transactions;
DROP POLICY IF EXISTS "individual_transactions_delete" ON transactions;

CREATE POLICY "individual_transactions_select" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "individual_transactions_insert" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "individual_transactions_update" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "individual_transactions_delete" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
DROP POLICY IF EXISTS "individual_categories_select" ON categories;
DROP POLICY IF EXISTS "individual_categories_insert" ON categories;
DROP POLICY IF EXISTS "individual_categories_update" ON categories;
DROP POLICY IF EXISTS "individual_categories_delete" ON categories;

CREATE POLICY "individual_categories_select" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "individual_categories_insert" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "individual_categories_update" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "individual_categories_delete" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================