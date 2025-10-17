-- Criar tabela de logs de conexão se não existir
CREATE TABLE IF NOT EXISTS connection_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    partner_id uuid REFERENCES users(id) ON DELETE CASCADE,
    event_type text NOT NULL CHECK (event_type IN ('connect', 'disconnect', 'reconnect', 'sync', 'error')),
    event_details text,
    timestamp text NOT NULL,
    created_at timestamp with time zone DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_connection_logs_user_id ON connection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_logs_partner_id ON connection_logs(partner_id);
CREATE INDEX IF NOT EXISTS idx_connection_logs_created_at ON connection_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_connection_logs_event_type ON connection_logs(event_type);

-- RLS para logs de conexão
ALTER TABLE connection_logs ENABLE ROW LEVEL SECURITY;

-- Política para visualizar logs próprios e do parceiro
CREATE POLICY "Users can view own and partner connection logs" ON connection_logs
    FOR SELECT USING (
        auth.uid() = user_id::uuid OR 
        auth.uid() = partner_id::uuid OR
        is_partner_of(user_id::uuid) OR
        is_partner_of(partner_id::uuid)
    );

-- Política para inserir logs (apenas sistema)
CREATE POLICY "System can insert connection logs" ON connection_logs
    FOR INSERT WITH CHECK (true);

-- Comentários
COMMENT ON TABLE connection_logs IS 'Logs de eventos de conexão entre parceiros';
COMMENT ON COLUMN connection_logs.event_type IS 'Tipo do evento: connect, disconnect, reconnect, sync, error';
COMMENT ON COLUMN connection_logs.event_details IS 'Detalhes adicionais do evento';
COMMENT ON COLUMN connection_logs.timestamp IS 'Timestamp do evento em formato ISO string';