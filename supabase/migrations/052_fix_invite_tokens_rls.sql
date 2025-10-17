-- Corrigir políticas RLS para a tabela invite_tokens
-- Garantir que usuários autenticados possam criar e gerenciar convites

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can insert their own invite tokens" ON invite_tokens;
DROP POLICY IF EXISTS "Users can view their own invite tokens" ON invite_tokens;
DROP POLICY IF EXISTS "Users can update their own invite tokens" ON invite_tokens;
DROP POLICY IF EXISTS "Users can view invites sent to them" ON invite_tokens;

-- Política para permitir que usuários criem seus próprios convites
CREATE POLICY "Users can insert their own invite tokens" ON invite_tokens
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Política para permitir que usuários vejam seus próprios convites enviados
CREATE POLICY "Users can view their own sent invites" ON invite_tokens
    FOR SELECT USING (auth.uid() = sender_id);

-- Política para permitir que usuários vejam convites recebidos (para aceitar/rejeitar)
CREATE POLICY "Users can view invites sent to them" ON invite_tokens
    FOR SELECT USING (
        -- Permitir ver convites que ainda não foram aceitos por ninguém
        status = 'pending' AND expires_at > NOW()
    );

-- Política para permitir que usuários atualizem convites (aceitar/rejeitar)
CREATE POLICY "Users can update invite status" ON invite_tokens
    FOR UPDATE USING (
        -- Usuários podem atualizar convites que enviaram (para revogar)
        auth.uid() = sender_id
        OR
        -- Ou convites que estão pendentes (para aceitar/rejeitar)
        (status = 'pending' AND expires_at > NOW())
    );

-- Garantir que RLS está habilitado
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Comentários das políticas
COMMENT ON POLICY "Users can insert their own invite tokens" ON invite_tokens IS 'Permite que usuários criem seus próprios convites';
COMMENT ON POLICY "Users can view their own sent invites" ON invite_tokens IS 'Permite que usuários vejam convites que enviaram';
COMMENT ON POLICY "Users can view invites sent to them" ON invite_tokens IS 'Permite que usuários vejam convites válidos disponíveis';
COMMENT ON POLICY "Users can update invite status" ON invite_tokens IS 'Permite que usuários atualizem status de convites';