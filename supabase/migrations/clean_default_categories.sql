-- Limpeza completa das categorias padrão do banco de dados
-- As categorias padrão agora são gerenciadas pelo código frontend

-- 1. Primeiro, verificar se existem transações usando categorias padrão
-- e atualizar suas referências para NULL (serão tratadas pelo sistema)
UPDATE transactions 
SET category_id = NULL, 
    notes = CASE 
        WHEN notes IS NULL OR notes = '' THEN '[CATEGORIA_PADRAO:' || category_id || ']'
        ELSE '[CATEGORIA_PADRAO:' || category_id || '] ' || notes
    END
WHERE category_id IN (
    SELECT id FROM categories WHERE is_default = true
);

-- 2. Remover todas as categorias padrão do banco
DELETE FROM categories WHERE is_default = true;

-- 3. Remover categorias antigas que podem ter IDs conflitantes (convertendo UUID para texto)
DELETE FROM categories WHERE id::text LIKE 'default-%';

-- 4. Limpar categorias órfãs (sem user_id válido)
DELETE FROM categories WHERE user_id::text = 'system' OR user_id IS NULL;

-- Comentário: As novas categorias padrão são:
-- RECEITAS: Salário, Freelance, Empréstimo, Vendas (Itens Pessoais), Presentes, Outros Recebimentos
-- DESPESAS: Moradia e Contas Fixas, Alimentação, Transporte, Saúde e Bem-Estar, Educação, Lazer e Entretenimento, Dívidas e Empréstimos, Outras Despesas