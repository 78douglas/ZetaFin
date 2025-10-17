-- Verificar e corrigir a função create_invite_token
-- Esta migração garante que a função funcione corretamente

-- Primeiro, remover a função existente se houver
DROP FUNCTION IF EXISTS create_invite_token(text);

-- Recriar a função com melhor tratamento de erros
CREATE OR REPLACE FUNCTION create_invite_token(p_message text DEFAULT 'Convite para conectar no ZetaFin')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_token text;
    v_expires_at timestamp with time zone;
    v_result json;
    v_attempt_count integer := 0;
    v_max_attempts integer := 10;
BEGIN
    -- Verificar se o usuário está autenticado
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

    -- Verificar se o usuário existe na tabela users
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado na base de dados';
    END IF;

    -- Gerar token único com retry
    LOOP
        v_attempt_count := v_attempt_count + 1;
        
        -- Gerar token aleatório
        v_token := encode(gen_random_bytes(16), 'hex');
        
        -- Verificar se o token já existe
        IF NOT EXISTS (SELECT 1 FROM invite_tokens WHERE token = v_token) THEN
            EXIT; -- Token único encontrado
        END IF;
        
        -- Evitar loop infinito
        IF v_attempt_count >= v_max_attempts THEN
            RAISE EXCEPTION 'Não foi possível gerar token único após % tentativas', v_max_attempts;
        END IF;
    END LOOP;

    -- Definir data de expiração (24 horas)
    v_expires_at := NOW() + INTERVAL '24 hours';

    -- Inserir o novo convite
    INSERT INTO invite_tokens (
        token,
        sender_id,
        message,
        status,
        expires_at
    ) VALUES (
        v_token,
        v_user_id,
        p_message,
        'pending',
        v_expires_at
    );

    -- Preparar resultado
    v_result := json_build_object(
        'success', true,
        'token', v_token,
        'message', 'Convite criado com sucesso',
        'expires_at', v_expires_at
    );

    -- Log da criação bem-sucedida
    INSERT INTO connection_logs (
        user_id,
        action,
        details,
        success
    ) VALUES (
        v_user_id,
        'create_invite',
        json_build_object(
            'token', v_token,
            'message', p_message,
            'expires_at', v_expires_at
        ),
        true
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO connection_logs (
            user_id,
            action,
            details,
            success,
            error_message
        ) VALUES (
            COALESCE(v_user_id, auth.uid()),
            'create_invite',
            json_build_object(
                'message', p_message,
                'error', SQLERRM
            ),
            false,
            SQLERRM
        );
        
        -- Re-lançar o erro
        RAISE;
END;
$$;

-- Garantir que a função tenha as permissões corretas
GRANT EXECUTE ON FUNCTION create_invite_token(text) TO authenticated;

-- Comentário da função
COMMENT ON FUNCTION create_invite_token(text) IS 'Cria um novo token de convite para o usuário autenticado';