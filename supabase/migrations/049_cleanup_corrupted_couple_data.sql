-- Limpeza de dados corrompidos de couple_data
-- Esta migração corrige dados inválidos que podem estar causando erros

-- Função para validar e corrigir dados de couple_data
CREATE OR REPLACE FUNCTION cleanup_corrupted_couple_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    new_code TEXT;
    clean_data JSONB;
    corrupted_count INTEGER := 0;
    fixed_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Iniciando limpeza de dados corrompidos de couple_data...';
    
    -- Iterar sobre todos os usuários com couple_data
    FOR user_record IN 
        SELECT id, couple_data, name, email 
        FROM users 
        WHERE couple_data IS NOT NULL
    LOOP
        -- Verificar se os dados estão corrompidos
        IF user_record.couple_data IS NULL OR 
           NOT (user_record.couple_data ? 'myCode') OR
           user_record.couple_data->>'myCode' IS NULL OR
           LENGTH(user_record.couple_data->>'myCode') != 6 THEN
            
            corrupted_count := corrupted_count + 1;
            
            RAISE NOTICE '⚠️ Dados corrompidos encontrados para usuário %: %', 
                user_record.id, user_record.couple_data;
            
            -- Gerar novo código
            new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || user_record.id::TEXT) FROM 1 FOR 6));
            
            -- Criar dados limpos
            clean_data := jsonb_build_object(
                'isConnected', false,
                'myCode', new_code
            );
            
            -- Atualizar com dados limpos
            UPDATE users 
            SET couple_data = clean_data
            WHERE id = user_record.id;
            
            fixed_count := fixed_count + 1;
            
            RAISE NOTICE '✅ Dados corrigidos para usuário %: %', 
                user_record.id, clean_data;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 Limpeza concluída: % registros corrompidos encontrados, % corrigidos', 
        corrupted_count, fixed_count;
        
    -- Log da operação
    INSERT INTO connection_logs (
        user_id,
        action,
        details,
        created_at
    ) VALUES (
        NULL,
        'cleanup_corrupted_data',
        jsonb_build_object(
            'corrupted_count', corrupted_count,
            'fixed_count', fixed_count,
            'timestamp', NOW()
        ),
        NOW()
    );
END;
$$;

-- Executar a limpeza
SELECT cleanup_corrupted_couple_data();

-- Função para resetar dados de um usuário específico (para uso em emergência)
CREATE OR REPLACE FUNCTION reset_user_couple_data(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_code TEXT;
    clean_data JSONB;
BEGIN
    -- Verificar se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', target_user_id;
    END IF;
    
    -- Gerar novo código
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || target_user_id::TEXT) FROM 1 FOR 6));
    
    -- Criar dados limpos
    clean_data := jsonb_build_object(
        'isConnected', false,
        'myCode', new_code
    );
    
    -- Atualizar dados
    UPDATE users 
    SET couple_data = clean_data
    WHERE id = target_user_id;
    
    -- Log da operação
    INSERT INTO connection_logs (
        user_id,
        action,
        details,
        created_at
    ) VALUES (
        target_user_id,
        'reset_couple_data',
        jsonb_build_object(
            'new_code', new_code,
            'timestamp', NOW()
        ),
        NOW()
    );
    
    RAISE NOTICE '✅ Dados resetados para usuário %: %', target_user_id, clean_data;
    
    RETURN clean_data;
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION cleanup_corrupted_couple_data() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_couple_data(UUID) TO authenticated;

-- Comentários
COMMENT ON FUNCTION cleanup_corrupted_couple_data() IS 'Limpa dados corrompidos de couple_data em todos os usuários';
COMMENT ON FUNCTION reset_user_couple_data(UUID) IS 'Reseta dados de couple_data para um usuário específico';