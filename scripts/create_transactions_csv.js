import fs from 'fs';

console.log('Criando arquivo transacoes.csv...');

async function createTransactionsCSV() {
  const supabaseUrl = 'https://auzxgatnowthemvddgpg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1enhnYXRub3d0aGVtdmRkZ3BnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxMDgzOSwiZXhwIjoyMDc1NTg2ODM5fQ.pbfILDyA2DiBiA2-18pZpQLXJVZZFHVVieAseX3bbNA';
  const userId = 'f929c7f7-af6a-4b3c-99f0-80cbdc6e0766';

  try {
    // Buscar todas as categorias
    console.log('Buscando categorias...');
    const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/categories`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!categoriesResponse.ok) {
      console.error('Erro ao buscar categorias:', categoriesResponse.status);
      return;
    }

    const categories = await categoriesResponse.json();
    console.log('Categorias encontradas:', categories.length);

    // Criar mapeamento de nome para ID
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('Mapeamento de categorias:', categoryMap);

    // Dados das transações (baseado no exemplo.csv)
    const transactions = [
      { date: '2025-08-01', description: 'Salário', category: 'Salário', type: 'RECEITA', amount: 5000.00, notes: 'Salário mensal' },
      { date: '2025-08-02', description: 'Supermercado', category: 'Alimentação', type: 'DESPESA', amount: 350.00, notes: 'Compras da semana' },
      { date: '2025-08-03', description: 'Gasolina', category: 'Transporte', type: 'DESPESA', amount: 200.00, notes: 'Abastecimento' },
      { date: '2025-08-05', description: 'Freelance', category: 'Outros', type: 'RECEITA', amount: 800.00, notes: 'Projeto web' },
      { date: '2025-08-07', description: 'Restaurante', category: 'Alimentação', type: 'DESPESA', amount: 120.00, notes: 'Jantar em família' },
      { date: '2025-08-10', description: 'Conta de Luz', category: 'Moradia', type: 'DESPESA', amount: 180.00, notes: 'Energia elétrica' },
      { date: '2025-08-12', description: 'Academia', category: 'Saúde', type: 'DESPESA', amount: 89.90, notes: 'Mensalidade' },
      { date: '2025-08-15', description: 'Supermercado', category: 'Alimentação', type: 'DESPESA', amount: 280.00, notes: 'Compras quinzenais' },
      { date: '2025-08-18', description: 'Cinema', category: 'Lazer', type: 'DESPESA', amount: 45.00, notes: 'Filme em família' },
      { date: '2025-08-20', description: 'Farmácia', category: 'Saúde', type: 'DESPESA', amount: 67.50, notes: 'Medicamentos' },
      { date: '2025-08-22', description: 'Uber', category: 'Transporte', type: 'DESPESA', amount: 35.00, notes: 'Corrida para o trabalho' },
      { date: '2025-08-25', description: 'Conta de Água', category: 'Moradia', type: 'DESPESA', amount: 95.00, notes: 'Água e esgoto' },
      { date: '2025-08-28', description: 'Supermercado', category: 'Alimentação', type: 'DESPESA', amount: 320.00, notes: 'Compras do mês' },
      { date: '2025-08-30', description: 'Venda Online', category: 'Outros', type: 'RECEITA', amount: 450.00, notes: 'Venda de produtos' },
      { date: '2025-09-01', description: 'Salário', category: 'Salário', type: 'RECEITA', amount: 5000.00, notes: 'Salário mensal' },
      { date: '2025-09-03', description: 'Supermercado', category: 'Alimentação', type: 'DESPESA', amount: 375.00, notes: 'Compras da semana' },
      { date: '2025-09-05', description: 'Gasolina', category: 'Transporte', type: 'DESPESA', amount: 220.00, notes: 'Abastecimento' },
      { date: '2025-09-08', description: 'Conta de Internet', category: 'Moradia', type: 'DESPESA', amount: 99.90, notes: 'Internet fibra' },
      { date: '2025-09-10', description: 'Conta de Luz', category: 'Moradia', type: 'DESPESA', amount: 195.00, notes: 'Energia elétrica' }
    ];

    // Criar CSV
    let csvContent = 'user_id,category_id,description,amount,type,transaction_date,notes\n';

    transactions.forEach(transaction => {
      const categoryId = categoryMap[transaction.category] || '';
      if (!categoryId) {
        console.warn(`Categoria não encontrada: ${transaction.category}`);
      }
      
      csvContent += `${userId},${categoryId},"${transaction.description}",${transaction.amount},${transaction.type},${transaction.date},"${transaction.notes}"\n`;
    });

    // Salvar arquivo
    fs.writeFileSync('transacoes.csv', csvContent);
    console.log('Arquivo transacoes.csv criado com sucesso!');
    console.log('Total de transações:', transactions.length);

  } catch (err) {
    console.error('Erro:', err);
  }
}

createTransactionsCSV().then(() => {
  console.log('Script finalizado.');
}).catch(err => {
  console.error('Erro no script:', err);
});