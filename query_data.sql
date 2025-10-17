-- Consultar user_id do usuário 78douglas@gmail.com
SELECT id as user_id, email, name FROM users WHERE email = '78douglas@gmail.com';

-- Consultar todas as categorias existentes
SELECT id as category_id, name, icon, color FROM categories ORDER BY name;