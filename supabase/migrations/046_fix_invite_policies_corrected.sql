-- Verificar e corrigir políticas RLS para invite_tokens

-- Habilitar RLS se não estiver habilitado
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can create their own invites" ON invite_tokens;
DROP POLICY IF EXISTS "Users can view their own invites" ON invite_tokens;
DROP POLICY IF EXISTS "Users can view invites sent to them" ON invite_tokens;
DROP POLICY IF EXISTS "Users can update their own invites" ON invite_tokens;
DROP POLICY IF EXISTS "Users can view invites by token" ON invite_tokens;
DROP POLICY IF EXISTS "Users can update invite status" ON invite_tokens;

-- Política para permitir que usuários criem seus próprios convites
CREATE POLICY "Users can create their own invites" ON invite_tokens
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Política para permitir que usuários vejam seus próprios convites
CREATE POLICY "Users can view their own invites" ON invite_tokens
    FOR SELECT USING (auth.uid() = sender_id);

-- Política para permitir que usuários vejam convites enviados para eles (através do token)
CREATE POLICY "Users can view invites by token" ON invite_tokens
    FOR SELECT USING (true); -- Permitir leitura por token para validação

-- Política para permitir que usuários atualizem convites (aceitar/rejeitar)
CREATE POLICY "Users can update invite status" ON invite_tokens
    FOR UPDATE USING (true) -- Permitir atualização para aceitar convites
    WITH CHECK (true);

-- Verificar se as funções RPC têm as permissões corretas
GRANT EXECUTE ON FUNCTION create_invite_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_invite_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invites() TO authenticated;

-- Comentários
COMMENT ON POLICY "Users can create their own invites" ON invite_tokens IS 'Permite que usuários autenticados criem convites';
COMMENT ON POLICY "Users can view their own invites" ON invite_tokens IS 'Permite que usuários vejam seus próprios convites';
COMMENT ON POLICY "Users can view invites by token" ON invite_tokens IS 'Permite validação de convites por token';
COMMENT ON POLICY "Users can update invite status" ON invite_tokens IS 'Permite aceitar/rejeitar convites';