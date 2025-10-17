-- Função para limpar convites expirados
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Marcar convites expirados como 'expired'
    UPDATE invite_tokens 
    SET status = 'expired'
    WHERE expires_at < NOW() 
    AND status = 'pending';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Marcados % tokens como expirados', deleted_count;
    RETURN deleted_count;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION cleanup_expired_invites() IS 'Marca convites expirados como expired e retorna o número de convites afetados';