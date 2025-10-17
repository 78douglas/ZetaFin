# 📋 Instruções para Importação dos CSVs no Supabase

## 🚨 Problema Identificado
Ao tentar importar o `transacoes.csv` diretamente no Supabase, você recebeu o erro:
```
ERROR: 23503: insert or update on table "transactions" violates foreign key constraint "transactions_user_id_fkey"
DETAIL: Key (user_id)=(550e8400-e29b-41d4-a716-446655440000) is not present in table "users".
```

**Causa:** O CSV das transações referencia um `user_id` que não existe na tabela `users`.

## ✅ Solução: Importação em Ordem Correta

### Passo 1: Criar Usuário de Teste
**PRIMEIRO**, execute o script SQL para criar o usuário de teste:

1. No Supabase Dashboard, vá para **SQL Editor**
2. Execute o arquivo: `supabase/migrations/insert_usuario_teste.sql`
3. Ou copie e cole este código:

```sql
-- Inserir usuário de teste com UUID específico usado nos CSVs
INSERT INTO users (
  id,
  email,
  name,
  avatar_url,
  couple_data,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'teste@zetafin.com',
  'Usuário Teste ZetaFin',
  NULL,
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = NOW();
```

### Passo 2: Importar Categorias
**SEGUNDO**, importe o arquivo `categorias.csv`:

1. No Supabase Dashboard, vá para **Table Editor**
2. Selecione a tabela `categories`
3. Clique em **Insert** → **Import data from CSV**
4. Faça upload do arquivo `categorias.csv`
5. Confirme a importação

### Passo 3: Importar Transações
**TERCEIRO**, importe o arquivo `transacoes.csv`:

1. No Supabase Dashboard, vá para **Table Editor**
2. Selecione a tabela `transactions`
3. Clique em **Insert** → **Import data from CSV**
4. Faça upload do arquivo `transacoes.csv`
5. Confirme a importação

## 📊 Dados de Teste Incluídos

### Usuário de Teste
- **ID:** `550e8400-e29b-41d4-a716-446655440000`
- **Email:** `teste@zetafin.com`
- **Nome:** `Usuário Teste ZetaFin`

### Categorias (18 categorias)
- 5 categorias de receita (Salário, Freelance, Investimentos, etc.)
- 13 categorias de despesa (Alimentação, Transporte, Moradia, etc.)

### Transações (42 transações)
- Dados fictícios para **Agosto, Setembro e Outubro de 2025**
- Mix realista de receitas e despesas
- Valores em reais (BRL)

## ⚠️ Importante
- **SEMPRE** execute os passos na ordem indicada
- O usuário de teste é necessário para satisfazer as foreign key constraints
- Os dados são fictícios e seguros para teste

## 🔧 Troubleshooting

### Se ainda der erro de foreign key:
1. Verifique se o usuário foi criado: `SELECT * FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000'`
2. Confirme que as categorias foram importadas antes das transações
3. Verifique se os UUIDs no CSV estão corretos

### Para limpar os dados de teste:
```sql
-- Remover transações de teste
DELETE FROM transactions WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Remover categorias de teste
DELETE FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Remover usuário de teste
DELETE FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---
**✨ Após seguir estes passos, você terá dados de teste completos no seu Supabase para testar o