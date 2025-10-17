-- Buscar dados do usuário 78douglas@gmail.com para gerar CSVs
SELECT 
  u.id as user_id,
  u.email
FROM auth.users u 
WHERE u.email = '78douglas@gmail.com';

-- Buscar categorias do usuário
SELECT 
  c.id,
  c.user_id,
  c.name,
  c.icon,
  c.color,
  c.is_default,
  c.created_at
FROM categories c
JOIN auth.users u ON c.user_id = u.id
WHERE u.email = '78douglas@gmail.com'
ORDER BY c.name;