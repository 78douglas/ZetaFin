-- Corrigir função reset_user_data para usar nomes corretos das tabelas
-- As tabelas estão em inglês (transactions, categories, users) não em português

-- Remover função antiga
DROP FUNCTION IF EXISTS reset_user_data(UUID);

-- Criar função corrigida
CREATE OR REPLACE FUNCTION reset_user_data(p_usuario_id UUID)
RETURNS JSONB AS $$
DECLARE
    deleted_transactions_count INTEGER := 0;
    deleted_goals_count INTEGER := 0;
    deleted_goal_progress_count INTEGER := 0;
    result JSONB;
BEGIN
    -- Verificar se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_usuario_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não encontrado',
            'deleted_transactions', 0,
            'deleted_goals', 0,
            'deleted_goal_progress', 0
        );
    END IF;

    -- Deletar progresso das metas primeiro (devido às foreign keys)
    DELETE FROM goal_progress 
    WHERE goal_id IN (
        SELECT id FROM goals WHERE user_id = p_usuario_id
    );
    GET DIAGNOSTICS deleted_goal_progress_count = ROW_COUNT;

    -- Deletar metas do usuário
    DELETE FROM goals WHERE user_id = p_usuario_id;
    GET DIAGNOSTICS deleted_goals_count = ROW_COUNT;
    
    -- Deletar todas as transações do usuário
    DELETE FROM transactions WHERE user_id = p_usuario_id;
    GET DIAGNOSTICS deleted_transactions_count = ROW_COUNT;
    
    -- Não deletar categorias pois podem ser compartilhadas ou padrão
    -- Não deletar o usuário da tabela users para manter a referência de auth
    
    -- Construir resultado
    result := jsonb_build_object(
        'success', true,
        'message', 'Dados do usuário resetados com sucesso',
        'deleted_transactions', deleted_transactions_count,
        'deleted_goals', deleted_goals_count,
        'deleted_goal_progress', deleted_goal_progress_count,
        'user_id', p_usuario_id
    );
    
    -- Log da operação
    RAISE NOTICE 'Dados do usuário % foram resetados: % transações, % metas, % progressos de metas removidos', 
        p_usuario_id, deleted_transactions_count, deleted_goals_count, deleted_goal_progress_count;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que apenas usuários autenticados possam executar
REVOKE ALL ON FUNCTION reset_user_data(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reset_user_data(UUID) TO authenticated;

-- Comentário da função
COMMENT ON FUNCTION reset_user_data(UUID) IS 'Reseta todos os dados do usuário (transações, metas, progresso) mantendo o perfil e categorias';