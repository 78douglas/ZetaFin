-- ============================================================================
-- MIGRATION: Remover completamente o sistema de casais do ZetaFin (CORRIGIDA)
-- Data: 2024-01-XX
-- Descrição: Remove todas as tabelas, campos, funções e políticas relacionadas
--           ao sistema de casais, simplificando para usuários individuais
-- ============================================================================

-- 1. REMOVER TABELAS RELACIONADAS AO SISTEMA DE CASAIS
-- ============================================================================

-- Remover tabela de logs de conexão
DROP TABLE IF EXISTS connection_logs CASCADE;

-- Remover tabela de tokens de convite
DROP TABLE IF EXISTS invite_tokens CASCADE;

-- 2. REMOVER CAMPOS RELACIONADOS AO SISTEMA DE CASAIS DA TABELA USERS
-- ============================================================================

-- Remover campo couple_data (dados do casal)
ALTER TABLE users DROP COLUMN IF EXISTS couple_data CASCADE;

-- Remover campo couple_code (código do casal)
ALTER TABLE users DROP COLUMN IF EXISTS couple_code CASCADE;

-- 3. REMOVER FUNÇÕES RELACIONADAS AO SISTEMA DE CASAIS
-- ============================================================================

-- Remover função de criar token de convite
DROP FUNCTION IF EXISTS create_invite_token(text) CASCADE;

-- Remover função de conectar parceiros
DROP FUNCTION IF EXISTS connect_partners(text) CASCADE;

-- Remover função de desconectar parceiros
DROP FUNCTION IF EXISTS disconnect_partners() CASCADE;

-- Remover função de limpeza de tokens expirados
DROP FUNCTION IF EXISTS cleanup_expired_invites() CASCADE;

-- Remover função de limpeza de dados corrompidos de casal
DROP FUNCTION IF EXISTS cleanup_corrupted_couple_data() CASCADE;

-- 4. REMOVER TODAS AS POLÍTICAS EXISTENTES E RECRIAR SIMPLIFICADAS
-- ============================================================================

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view own and partner profile" ON users;
DROP POLICY IF EXISTS "Users can update own and partner profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own and partner transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own and partner transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own and partner transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view own and partner categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own and partner categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own and partner categories" ON categories;
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS simplificadas para usuários individuais

-- POLÍTICAS PARA USERS
CREATE POLICY "individual_users_select" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "individual_users_update" ON users
    FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS PARA TRANSACTIONS
CREATE POLICY "individual_transactions_select" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "individual_transactions_insert" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "individual_transactions_update" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "individual_transactions_delete" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS PARA CATEGORIES
CREATE POLICY "individual_categories_select" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "individual_categories_insert" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "individual_categories_update" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "individual_categories_delete" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- 5. LIMPEZA FINAL
-- ============================================================================

-- Remover qualquer trigger relacionado ao sistema de casais
DROP TRIGGER IF EXISTS cleanup_expired_invites_trigger ON invite_tokens;

-- Remover qualquer índice relacionado ao sistema de casais
DROP INDEX IF EXISTS idx_invite_tokens_token;
DROP INDEX IF EXISTS idx_invite_tokens_created_by;
DROP INDEX IF EXISTS idx_invite_tokens_expires_at;
DROP INDEX IF EXISTS idx_connection_logs_user_id;
DROP INDEX IF EXISTS idx_connection_logs_partner_id;

-- 6. CRIAR TABELA DE LOG SE NÃO EXISTIR
-- ============================================================================

-- Criar tabela de log de migração se não existir
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT UNIQUE NOT NULL,
    description TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir comentário de confirmação
INSERT INTO migration_log (migration_name, description, executed_at) 
VALUES (
    '057_remove_couple_system_fixed',
    'Removido completamente o sistema de casais - ZetaFin agora funciona apenas para usuários individuais (versão corrigida)',
    NOW()
) ON CONFLICT (migration_name) DO NOTHING;

COMMENT ON TABLE migration_log IS 'Log de migrações executadas no banco de dados';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================