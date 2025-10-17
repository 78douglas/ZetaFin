// Script para criar dados de teste no localStorage
console.log('📊 Criando dados de teste...');

// Criar categorias de teste
const testCategories = [
  {
    id: 'custom-1',
    nome: 'Alimentação',
    tipo_padrao: 'DESPESA',
    cor: '#FF6B6B',
    icone: '🍽️',
    ativa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'custom-2',
    nome: 'Salário',
    tipo_padrao: 'RECEITA',
    cor: '#4ECDC4',
    icone: '💰',
    ativa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

localStorage.setItem('zetafin_categories', JSON.stringify(testCategories));

// Criar transações de teste
const testTransactions = [
  {
    id: 'trans-1',
    descricao: 'Salário Mensal',
    valor: 5000.00,
    tipo: 'RECEITA',
    categoria_id: 'custom-2',
    data: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'trans-2',
    descricao: 'Supermercado',
    valor: 350.75,
    tipo: 'DESPESA',
    categoria_id: 'custom-1',
    data: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'trans-3',
    descricao: 'Restaurante',
    valor: 89.50,
    tipo: 'DESPESA',
    categoria_id: 'custom-1',
    data: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

localStorage.setItem('zetafin_transactions', JSON.stringify(testTransactions));

console.log('✅ Dados de teste criados com sucesso!');
console.log('📊 Categorias:', testCategories.length);
console.log('💰 Transações:', testTransactions.length);

// Recarregar a página para aplicar os dados
window.location.reload();