-- Correção das políticas RLS para permitir acesso de parceiros às transações
-- Problema: Parceiros não conseguem ver transações uns dos outros

-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "transactions_authenticated_policy" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Criar função para verificar se um usuário é parceiro de outro
CREATE OR REPLACE FUNCTION is_partner_of(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_couple_data jsonb;
    target_user_couple_data jsonb;
BEGIN
    -- Obter dados do casal do usuário atual
    SELECT couple_data INTO current_user_couple_data
    FROM users
    WHERE id = auth.uid();
    
    -- Obter dados do casal do usuário alvo
    SELECT couple_data INTO target_user_couple_data
    FROM users
    WHERE id = target_user_id;
    
    -- Verificar se ambos têm dados de casal e estão conectados
    IF current_user_couple_data IS NULL OR target_user_couple_data IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificar se estão conectados e são parceiros
    RETURN (
        (current_user_couple_data->>'isConnected')::boolean = true AND
        (target_user_couple_data->>'isConnected')::boolean = true AND
        (current_user_couple_data->>'partnerId') = target_user_id::text AND
        (target_user_couple_data->>'partnerId') = auth.uid()::text
    );
END;
$$;

-- Políticas para transações: usuário pode ver suas próprias transações E transações do parceiro
CREATE POLICY "Users can view own and partner transactions" ON transactions
    FOR SELECT USING (
        auth.uid() = user_id::uuid OR 
        is_partner_of(user_id::uuid)
    );

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id::uuid);

-- Políticas para categorias: usuário pode ver suas próprias categorias E categorias do parceiro
DROP POLICY IF EXISTS "categories_authenticated_policy" ON categories;
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

CREATE POLICY "Users can view own and partner categories" ON categories
    FOR SELECT USING (
        auth.uid() = user_id::uuid OR 
        is_partner_of(user_id::uuid)
    );

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id::uuid);

-- Políticas para usuários: permitir visualização de dados básicos de parceiros
DROP POLICY IF EXISTS "users_authenticated_policy" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own and partner profiles" ON users
    FOR SELECT USING (
        auth.uid() = id::uuid OR 
        is_partner_of(id::uuid)
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id::uuid);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id::uuid);

-- Garantir que RLS está habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON FUNCTION is_partner_of(uuid) IS 'Verifica se o usuário atual é parceiro do usuário especificado';
COMMENT ON POLICY "Users can view own and partner transactions" ON transactions IS 'Permite ver transações próprias e do parceiro conectado';
COMMENT ON POLICY "Users can view own and partner categories" ON categories IS 'Permite ver categorias próprias e do parceiro conectado';
COMMENT ON POLICY "Users can view own and partner profiles" ON users IS 'Permite ver perfil próprio e do parceiro conectado';