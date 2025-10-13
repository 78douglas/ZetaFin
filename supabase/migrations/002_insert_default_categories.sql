-- Inserir categorias padrão
INSERT INTO categorias (nome, tipo_padrao, icone, ativa) VALUES
-- Categorias de Receita
('Salário', 'RECEITA', '💰', true),
('Freelance', 'RECEITA', '💻', true),
('Investimentos', 'RECEITA', '📈', true),
('Vendas', 'RECEITA', '🛒', true),
('Outros Ganhos', 'RECEITA', '💵', true),

-- Categorias de Despesa
('Alimentação', 'DESPESA', '🍽️', true),
('Transporte', 'DESPESA', '🚗', true),
('Moradia', 'DESPESA', '🏠', true),
('Saúde', 'DESPESA', '🏥', true),
('Educação', 'DESPESA', '📚', true),
('Lazer', 'DESPESA', '🎮', true),
('Roupas', 'DESPESA', '👕', true),
('Tecnologia', 'DESPESA', '📱', true),
('Serviços', 'DESPESA', '🔧', true),
('Impostos', 'DESPESA', '📋', true),
('Outros Gastos', 'DESPESA', '💸', true),

-- Categorias Ambas
('Transferência', 'AMBOS', '🔄', true),
('Ajuste', 'AMBOS', '⚖️', true);