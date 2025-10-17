# 🚨 PASSO A PASSO PARA IMPORTAR CSVs NO SUPABASE

## ⚠️ ATENÇÃO: ORDEM OBRIGATÓRIA!

**SEM SEGUIR ESTA ORDEM, A IMPORTAÇÃO SEMPRE FALHARÁ!**

---

## 🔴 PASSO 1: CRIAR USUÁRIO DE TESTE (OBRIGATÓRIO!)

**VOCÊ DEVE FAZER ISSO PRIMEIRO, SENÃO DARÁ ERRO!**

### 1.1 Abra o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto ZetaFin

### 1.2 Execute o SQL
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. **COPIE E COLE EXATAMENTE ESTE CÓDIGO:**

```sql
-- CRIAR USUÁRIO DE TESTE (OBRIGATÓRIO PARA IMPORTAÇÃO)
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

-- VERIFICAR SE FOI CRIADO
SELECT id, email, name FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

4. Clique em **"Run"** (botão azul)
5. **CONFIRME** que apareceu uma linha com o usuário criado

---

## 🟡 PASSO 2: IMPORTAR CATEGORIAS

**SÓ FAÇA DEPOIS DO PASSO 1!**

### 2.1 Ir para Table Editor
1. No menu lateral, clique em **"Table Editor"**
2. Selecione a tabela **"categories"**

### 2.2 Importar CSV
1. Clique em **"Insert"** → **"Import data from CSV"**
2. Faça upload do arquivo **`categorias.csv`**
3. Confirme a importação
4. **VERIFIQUE** que 16 categorias foram importadas

---

## 🟢 PASSO 3: IMPORTAR TRANSAÇÕES

**SÓ FAÇA DEPOIS DOS PASSOS 1 E 2!**

### 3.1 Ir para Table Editor
1. No menu lateral, clique em **"Table Editor"**
2. Selecione a tabela **"transactions"**

### 3.2 Importar CSV
1. Clique em **"Insert"** → **"Import data from CSV"**
2. Faça upload do arquivo **`transacoes.csv`**
3. Confirme a importação
4. **VERIFIQUE** que 42 transações foram importadas

---

## ✅ VERIFICAÇÃO FINAL

Execute este SQL para confirmar que tudo foi importado:

```sql
-- Verificar usuário
SELECT COUNT(*) as usuarios FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Verificar categorias
SELECT COUNT(*) as categorias FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Verificar transações
SELECT COUNT(*) as transacoes FROM transactions WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
```

**Resultado esperado:**
- usuarios: 1
- categorias: 16
- transacoes: 42

---

## 🚨 SE AINDA DER ERRO

### Erro: "user_id not present in table users"
**CAUSA:** Você não executou o PASSO 1
**SOLUÇÃO:** Volte ao PASSO 1 e execute o SQL

### Erro: "category_id not present in table categories"
**CAUSA:** Você não executou o PASSO 2
**SOLUÇÃO:** Importe as categorias primeiro (PASSO 2)

### Para limpar e recomeçar:
```sql
-- Limpar dados de teste
DELETE FROM transactions WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## 🎯 RESUMO

1. **🔴 PRIMEIRO:** Execute o SQL para criar o usuário
2. **🟡 SEGUNDO:** Importe `categorias.csv`
3. **🟢 TERCEIRO:** Importe `transacoes.csv`

**SEM O USUÁRIO DE TESTE, NADA FUNCIONARÁ!**