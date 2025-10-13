-- Limpeza completa de dados fictícios
-- Remove todas as transações e dados de teste

-- Deletar todas as transações existentes
DELETE FROM transacoes;

-- Remover funções de dados fictícios se existirem
DROP FUNCTION IF EXISTS inserir_dados_ficticios();
DROP FUNCTION IF EXISTS reset_user_data(uuid);

-- Resetar sequências se necessário
-- (As sequências continuarão do último valor, o que é normal)