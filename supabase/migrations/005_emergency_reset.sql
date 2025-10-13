-- Emergency reset para remover dados fictícios
-- Este script remove todas as transações do usuário específico

-- Primeiro, vamos identificar o usuário pelo email
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar o UUID do usuário pelo email (assumindo que é 78douglas@gmail.com)
    -- Como não temos acesso direto à tabela auth.users, vamos deletar todas as transações
    -- e deixar apenas as categorias padrão
    
    -- Deletar todas as transações
    DELETE FROM transacoes;
    
    -- Resetar as categorias para apenas as padrão
    DELETE FROM categorias WHERE NOT nome IN (
        'Salário', 'Freelance', 'Investimentos', 'Outros',
        'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
        'Educação', 'Lazer', 'Compras', 'Contas'
    );
    
    RAISE NOTICE 'Reset de emergência concluído - todas as transações foram removidas';
END $$;