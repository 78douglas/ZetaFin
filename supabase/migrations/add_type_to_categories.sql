-- Adicionar campo type na tabela categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS type VARCHAR DEFAULT 'AMBOS' CHECK (type IN ('RECEITA', 'DESPESA', 'AMBOS'));

-- Atualizar categorias existentes para ter tipo AMBOS por padrão
UPDATE categories SET type = 'AMBOS' WHERE type IS NULL;