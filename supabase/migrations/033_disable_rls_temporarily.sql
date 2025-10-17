-- Desabilitar RLS temporariamente para debug
-- ATENÇÃO: Isso permite acesso total às tabelas - apenas para desenvolvimento

-- Desabilitar RLS nas tabelas principais
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Comentário para lembrar de reabilitar em produção
-- Para reabilitar: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;