-- Verificar dados do usuário cc116640-a6ca-4dde-ab87-cd3d9a02085f

-- Verificar se o usuário existe na tabela users
SELECT 'Usuário na tabela users:' as info;
SELECT * FROM users WHERE id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f';

-- Verificar categorias do usuário
SELECT 'Categorias do usuário:' as info;
SELECT * FROM categories WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f';

-- Verificar transações do usuário
SELECT 'Transações do usuário:' as info;
SELECT * FROM transactions WHERE user_id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f';

-- Verificar se o usuário existe na tabela auth.users
SELECT 'Usuário na tabela auth.users:' as info;
SELECT id, email FROM auth.users WHERE id = 'cc116640-a6ca-4dde-ab87-cd3d9a02085f';

-- Contar total de registros em cada tabela
SELECT 'Total de usuários:' as info, COUNT(*) as total FROM users;
SELECT 'Total de categorias:' as info, COUNT(*) as total FROM categories;
SELECT 'Total de transações:' as info, COUNT(*) as total FROM transactions;