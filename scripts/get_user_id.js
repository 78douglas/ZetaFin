console.log('Script iniciado...');

async function getUserId() {
  console.log('Função getUserId iniciada...');
  
  const supabaseUrl = 'https://auzxgatnowthemvddgpg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1enhnYXRub3d0aGVtdmRkZ3BnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxMDgzOSwiZXhwIjoyMDc1NTg2ODM5fQ.pbfILDyA2DiBiA2-18pZpQLXJVZZFHVVieAseX3bbNA';

  try {
    console.log('Fazendo requisição para Supabase...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.78douglas@gmail.com`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta recebida, status:', response.status);

    if (!response.ok) {
      console.error('Erro na resposta:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('Dados recebidos:', data);

    if (data && data.length > 0) {
      const user = data[0];
      console.log('Usuário encontrado:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Nome:', user.name);
    } else {
      console.log('Usuário não encontrado');
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

getUserId().then(() => {
  console.log('Script finalizado.');
}).catch(err => {
  console.error('Erro no script:', err);
});