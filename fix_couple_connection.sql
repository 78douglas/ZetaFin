-- Corrigir a conexão do casal
-- Primeiro, vamos atualizar o usuário atual para ter uma conexão válida
UPDATE users 
SET couple_data = jsonb_build_object(
    'isConnected', true,
    'myCode', 'QCRURN',
    'partnerCode', 'MARIA1',
    'partnerId', '11111111-1111-1111-1111-111111111111',
    'partnerName', 'Maria Silva',
    'connectionDate', now()::text
)
WHERE email = '78douglas@gmail.com';

-- Agora vamos atualizar o usuário parceiro para ter a conexão recíproca
UPDATE users 
SET couple_data = jsonb_build_object(
    'isConnected', true,
    'myCode', 'MARIA1',
    'partnerCode', 'QCRURN',
    'partnerId', (SELECT id FROM users WHERE email = '78douglas@gmail.com'),
    'partnerName', 'Douglas',
    'connectionDate', now()::text
)
WHERE id = '11111111-1111-1111-1111-111111111111';