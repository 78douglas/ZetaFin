-- Atualizar tabela connection_logs para suportar novos tipos de eventos

-- Adicionar coluna event_details se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'connection_logs' 
                   AND column_name = 'event_details') THEN
        ALTER TABLE connection_logs ADD COLUMN event_details text;
    END IF;
END $$;

-- Adicionar coluna timestamp se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'connection_logs' 
                   AND column_name = 'timestamp') THEN
        ALTER TABLE connection_logs ADD COLUMN timestamp text;
    END IF;
END $$;

-- Atualizar constraint do event_type para incluir novos tipos
ALTER TABLE connection_logs DROP CONSTRAINT IF EXISTS connection_logs_event_type_check;

ALTER TABLE connection_logs ADD CONSTRAINT connection_logs_event_type_check 
CHECK (event_type IN (
    'connection_established', 'connection_lost', 'reconnection_attempt', 
    'session_recovered', 'tab_change_detected', 'network_status_change', 
    'invite_sent', 'invite_accepted', 'invite_rejected',
    'connect', 'disconnect', 'reconnect', 'sync', 'error'
));

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_connection_logs_user_id ON connection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_logs_partner_id ON connection_logs(partner_id);
CREATE INDEX IF NOT EXISTS idx_connection_logs_created_at ON connection_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_connection_logs_event_type ON connection_logs(event_type);

-- Atualizar políticas RLS
DROP POLICY IF EXISTS "Users can view own and partner connection logs" ON connection_logs;
DROP POLICY IF EXISTS "System can insert connection logs" ON connection_logs;

-- Política para visualizar logs próprios e do parceiro
CREATE POLICY "Users can view own and partner connection logs" ON connection_logs
    FOR SELECT USING (
        auth.uid() = user_id::uuid OR 
        auth.uid() = partner_id::uuid OR
        is_partner_of(user_id::uuid) OR
        is_partner_of(partner_id::uuid)
    );

-- Política para inserir logs (apenas sistema e usuários autenticados)
CREATE POLICY "Authenticated users can insert connection logs" ON connection_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Comentários atualizados
COMMENT ON COLUMN connection_logs.event_details IS 'Detalhes adicionais do evento';
COMMENT ON COLUMN connection_logs.timestamp IS 'Timestamp do evento em formato ISO string'