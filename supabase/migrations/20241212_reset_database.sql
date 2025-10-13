-- Reset completo do banco de dados para resolver corrupção
-- Causada pela inserção massiva de dados fictícios

-- Primeiro, remover todas as transações
DELETE FROM transacoes;

-- Resetar sequências se existirem
ALTER SEQUENCE IF EXISTS transacoes_id_seq RESTART WITH 1;

-- Limpar e recriar categorias padrão
DELETE FROM categorias;
ALTER SEQUENCE IF EXISTS categorias_id_seq RESTART WITH 1;

-- Inserir categorias padrão novamente
INSERT INTO categorias (nome, tipo_padrao, icone, ativa) VALUES
('Alimentação', 'DESPESA', '🍽️', true),
('Transporte', 'DESPESA', '🚗', true),
('Moradia', 'DESPESA', '🏠', true),
('Saúde', 'DESPESA', '🏥', true),
('Educação', 'DESPESA', '📚', true),
('Lazer', 'DESPESA', '🎮', true),
('Salário', 'RECEITA', '💰', true),
('Freelance', 'RECEITA', '💼', true),
('Investimentos', 'RECEITA', '📈', true);

-- Verificar se há conexões ativas que possam estar travando
-- (Esta query é apenas informativa, não executável em migração)
-- SELECT * FROM pg_stat_activity WHERE datname = current_database();

-- Resetar estatísticas da tabela para melhorar performance
ANALYZE transacoes;
ANALYZE categorias;
ANALYZE usuarios;