-- Limpar e recriar políticas RLS para invite_tokens
-- Garantir que usuários autenticados possam criar convites

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE invite_tokens DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'invite_tokens' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON invite_tokens';
    END LOOP;
END $$;

-- Reabilitar RLS
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples e funcionais
CREATE POLICY "invite_tokens_insert_policy" ON invite_tokens
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "invite_tokens_select_policy" ON invite_tokens
    FOR SELECT USING (
        auth.uid() = sender_id 
        OR 
        (status = 'pending' AND expires_at > NOW())
    );

CREATE POLICY "invite_tokens_update_policy" ON invite_tokens
    FOR UPDATE USING (
        auth.uid() = sender_id 
        OR 
        (status = 'pending' AND expires_at > NOW())
    );

-- Verificar se as políticas foram criadas
SELECT 
    policyname, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'invite_tokens' AND schemaname = 'public';