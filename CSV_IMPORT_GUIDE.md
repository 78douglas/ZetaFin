# Guia de Importação CSV - ZetaFin

## Formato do Arquivo CSV

O ZetaFin agora suporta importação universal de transações via CSV. O arquivo deve seguir o formato abaixo:

### Estrutura do Arquivo

```csv
description,amount,type,transaction_date,notes,category_name
"Descrição da transação",valor,TIPO,YYYY-MM-DD,"Observações","Nome da Categoria"
```

### Campos Obrigatórios

1. **description** - Descrição da transação (texto)
2. **amount** - Valor da transação (número decimal, use ponto como separador)
3. **type** - Tipo da transação: `RECEITA` ou `DESPESA`
4. **transaction_date** - Data da transação no formato `YYYY-MM-DD`
5. **notes** - Observações (pode estar vazio, mas a coluna deve existir)
6. **category_name** - Nome da categoria (texto)

### Exemplo de Arquivo CSV

```csv
description,amount,type,transaction_date,notes,category_name
"Salário",5000.00,RECEITA,2025-08-01,"Salário mensal","Salário"
"Supermercado",350.00,DESPESA,2025-08-02,"Compras da semana","Alimentação"
"Gasolina",200.00,DESPESA,2025-08-03,"Abastecimento","Transporte"
"Freelance",800.00,RECEITA,2025-08-05,"Projeto web","Freelance"
```

## Funcionalidades Inteligentes

### Mapeamento Automático de Categorias

- O sistema busca automaticamente por categorias existentes com o mesmo nome
- Se uma categoria não existir, ela será criada automaticamente
- A busca é case-insensitive (não diferencia maiúsculas de minúsculas)

### Categorias Padrão

O sistema inclui as seguintes categorias padrão:
- Alimentação
- Transporte
- Moradia
- Saúde
- Lazer
- Educação
- Salário
- Freelance
- Outros

### Validações

- Valores devem ser números válidos
- Datas devem estar no formato YYYY-MM-DD
- Tipo deve ser exatamente `RECEITA` ou `DESPESA`
- Todas as colunas devem estar presentes

## Como Importar

1. Acesse **Configurações** no menu principal
2. Clique em **"Importar CSV"**
3. Selecione seu arquivo CSV
4. Clique em **"Importar Transações"**
5. Aguarde a confirmação de sucesso

## Vantagens do Novo Formato

- ✅ **Universal**: Funciona para qualquer usuário
- ✅ **Inteligente**: Cria categorias automaticamente
- ✅ **Flexível**: Aceita nomes de categorias personalizados
- ✅ **Seguro**: Não há mais erros de foreign key
- ✅ **Simples**: Formato fácil de entender e criar

## Solução de Problemas

### Erro: "Por favor, selecione um arquivo CSV válido"
- Verifique se o arquivo tem extensão `.csv`
- Certifique-se de que o arquivo não está corrompido

### Erro durante importação
- Verifique se todas as colunas estão presentes
- Confirme se os tipos de dados estão corretos
- Verifique se as datas estão no formato YYYY-MM-DD

### Categorias não aparecem
- As categorias são criadas automaticamente durante a importação
- Recarregue a página após a importação para ver as novas categorias