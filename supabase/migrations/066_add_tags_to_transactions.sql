-- Adicionar campo tags à tabela transactions
ALTER TABLE transactions ADD COLUMN tags text[];

-- Comentário explicativo
COMMENT ON COLUMN transactions.tags IS 'Array de tags associadas à transação';