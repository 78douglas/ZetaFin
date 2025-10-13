-- Função para inserir dados fictícios dos últimos 3 meses
CREATE OR REPLACE FUNCTION inserir_dados_ficticios(p_usuario_id UUID)
RETURNS VOID AS $$
DECLARE
    categoria_record RECORD;
    categoria_id UUID;
    data_atual DATE := CURRENT_DATE;
    data_inicio DATE := data_atual - INTERVAL '3 months';
    contador INTEGER := 0;
    valor_aleatorio DECIMAL(12,2);
    descricoes_receita TEXT[] := ARRAY[
        'Salário mensal',
        'Freelance projeto web',
        'Dividendos investimentos',
        'Venda produto usado',
        'Bonificação trabalho',
        'Rendimento poupança',
        'Consultoria técnica',
        'Aula particular'
    ];
    descricoes_despesa TEXT[] := ARRAY[
        'Supermercado',
        'Combustível',
        'Aluguel',
        'Conta de luz',
        'Internet',
        'Restaurante',
        'Farmácia',
        'Cinema',
        'Uber',
        'Academia',
        'Streaming',
        'Roupas',
        'Livros',
        'Café',
        'Lanche'
    ];
BEGIN
    -- Loop para criar transações nos últimos 3 meses
    WHILE contador < 150 LOOP
        -- Selecionar categoria aleatória
        SELECT id INTO categoria_id 
        FROM categorias 
        WHERE ativa = true 
        ORDER BY RANDOM() 
        LIMIT 1;
        
        -- Obter informações da categoria selecionada
        SELECT * INTO categoria_record 
        FROM categorias 
        WHERE id = categoria_id;
        
        -- Definir valor baseado no tipo
        IF categoria_record.tipo_padrao = 'RECEITA' OR 
           (categoria_record.tipo_padrao = 'AMBOS' AND RANDOM() > 0.5) THEN
            -- Receitas: valores entre R$ 500 e R$ 8000
            valor_aleatorio := (RANDOM() * 7500 + 500)::DECIMAL(12,2);
            
            INSERT INTO transacoes (
                descricao,
                descricao_adicional,
                valor,
                tipo,
                categoria_id,
                usuario_id,
                data,
                registrado_por
            ) VALUES (
                descricoes_receita[1 + (RANDOM() * (array_length(descricoes_receita, 1) - 1))::INTEGER],
                CASE 
                    WHEN RANDOM() > 0.7 THEN 'Observação adicional sobre a receita'
                    ELSE NULL
                END,
                valor_aleatorio,
                'RECEITA',
                categoria_id,
                p_usuario_id,
                data_inicio + (RANDOM() * (data_atual - data_inicio))::INTEGER,
                'Sistema'
            );
        ELSE
            -- Despesas: valores entre R$ 10 e R$ 2000
            valor_aleatorio := (RANDOM() * 1990 + 10)::DECIMAL(12,2);
            
            INSERT INTO transacoes (
                descricao,
                descricao_adicional,
                valor,
                tipo,
                categoria_id,
                usuario_id,
                data,
                registrado_por
            ) VALUES (
                descricoes_despesa[1 + (RANDOM() * (array_length(descricoes_despesa, 1) - 1))::INTEGER],
                CASE 
                    WHEN RANDOM() > 0.8 THEN 'Observação adicional sobre a despesa'
                    ELSE NULL
                END,
                valor_aleatorio,
                'DESPESA',
                categoria_id,
                p_usuario_id,
                data_inicio + (RANDOM() * (data_atual - data_inicio))::INTEGER,
                'Sistema'
            );
        END IF;
        
        contador := contador + 1;
    END LOOP;
    
    -- Inserir algumas transações específicas para garantir dados consistentes
    -- Salário mensal para os últimos 3 meses
    FOR i IN 0..2 LOOP
        SELECT id INTO categoria_id FROM categorias WHERE nome = 'Salário' LIMIT 1;
        
        INSERT INTO transacoes (
            descricao,
            valor,
            tipo,
            categoria_id,
            usuario_id,
            data,
            registrado_por
        ) VALUES (
            'Salário mensal',
            5500.00,
            'RECEITA',
            categoria_id,
            p_usuario_id,
            date_trunc('month', data_atual - (i || ' months')::INTERVAL)::DATE + 4,
            'Sistema'
        );
    END LOOP;
    
    -- Algumas despesas fixas mensais
    FOR i IN 0..2 LOOP
        -- Aluguel
        SELECT id INTO categoria_id FROM categorias WHERE nome = 'Moradia' LIMIT 1;
        INSERT INTO transacoes (
            descricao,
            valor,
            tipo,
            categoria_id,
            usuario_id,
            data,
            registrado_por
        ) VALUES (
            'Aluguel',
            1200.00,
            'DESPESA',
            categoria_id,
            p_usuario_id,
            date_trunc('month', data_atual - (i || ' months')::INTERVAL)::DATE + 1,
            'Sistema'
        );
        
        -- Internet
        SELECT id INTO categoria_id FROM categorias WHERE nome = 'Serviços' LIMIT 1;
        INSERT INTO transacoes (
            descricao,
            valor,
            tipo,
            categoria_id,
            usuario_id,
            data,
            registrado_por
        ) VALUES (
            'Internet',
            89.90,
            'DESPESA',
            categoria_id,
            p_usuario_id,
            date_trunc('month', data_atual - (i || ' months')::INTERVAL)::DATE + 5,
            'Sistema'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para resetar dados do usuário
CREATE OR REPLACE FUNCTION reset_user_data(p_usuario_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Deletar todas as transações do usuário
    DELETE FROM transacoes WHERE usuario_id = p_usuario_id;
    
    -- Deletar dados do usuário (mantém o registro de auth)
    -- Não deletamos o usuário da tabela usuarios para manter a referência
    
    -- Log da operação
    RAISE NOTICE 'Dados do usuário % foram resetados com sucesso', p_usuario_id;
END;
$$ LANGUAGE plpgsql;