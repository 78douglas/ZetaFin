// Script para adicionar dados de teste no localStorage
console.log('🧪 Adicionando dados de teste...');

// Limpar dados existentes
localStorage.removeItem('zetafin_transactions');
localStorage.removeItem('zetafin_categories');

// Adicionar categorias padrão
const categoriasPadrao = [
  { 
    id: '1', 
    nome: 'Alimentação', 
    tipo_padrao: 'DESPESA', 
    cor: '#ef4444', 
    icone: '🍽️', 
    ativa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '2', 
    nome: 'Transporte', 
    tipo_padrao: 'DESPESA', 
    cor: '#f97316', 
    icone: '🚗', 
    ativa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '3', 
    nome: 'Moradia', 
    tipo_padrao: 'DESPESA', 
    cor: '#eab308', 
    icone: '🏠', 
    ativa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '4', 
    nome: 'Lazer', 
    tipo_padrao: 'DESPESA', 
    cor: '#8b5cf6', 
    icone: '🎬', 
    ativa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '7', 
    nome: 'Salário', 
    tipo_padrao: 'RECEITA', 
    cor: '#10b981', 
    icone: '💰', 
    ativa: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

localStorage.setItem('zetafin_categories', JSON.stringify(categoriasPadrao));
console.log('✅ Categorias adicionadas:', categoriasPadrao.length);

// Adicionar transações de teste com despesas
const hoje = new Date();
const transacoesTeste = [
  {
    id: 'test-1',
    descricao: 'Supermercado',
    valor: 250.50,
    data: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 dias atrás
    tipo: 'DESPESA',
    categoria_id: '1',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-2',
    descricao: 'Restaurante',
    valor: 85.50,
    data: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias atrás
    tipo: 'DESPESA',
    categoria_id: '1',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-3',
    descricao: 'Combustível',
    valor: 120.00,
    data: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias atrás
    tipo: 'DESPESA',
    categoria_id: '2',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-4',
    descricao: 'Uber',
    valor: 35.00,
    data: new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias atrás
    tipo: 'DESPESA',
    categoria_id: '2',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-5',
    descricao: 'Conta de luz',
    valor: 180.00,
    data: new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 dias atrás
    tipo: 'DESPESA',
    categoria_id: '3',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-6',
    descricao: 'Internet',
    valor: 99.90,
    data: new Date(hoje.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 dias atrás
    tipo: 'DESPESA',
    categoria_id: '3',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-7',
    descricao: 'Cinema',
    valor: 45.00,
    data: new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 dias atrás
    tipo: 'DESPESA',
    categoria_id: '4',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-8',
    descricao: 'Netflix',
    valor: 29.90,
    data: new Date(hoje.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 dia atrás
    tipo: 'DESPESA',
    categoria_id: '4',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-9',
    descricao: 'Salário',
    valor: 5000.00,
    data: new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 dias atrás
    tipo: 'RECEITA',
    categoria_id: '7',
    registradoPor: 'Usuário',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

localStorage.setItem('zetafin_transactions', JSON.stringify(transacoesTeste));
console.log('✅ Transações adicionadas:', transacoesTeste.length);

// Verificar se foram salvos
const categoriasVerificacao = localStorage.getItem('zetafin_categories');
const transacoesVerificacao = localStorage.getItem('zetafin_transactions');

console.log('✅ Categorias salvas:', categoriasVerificacao ? JSON.parse(categoriasVerificacao).length : 0);
console.log('✅ Transações salvas:', transacoesVerificacao ? JSON.parse(transacoesVerificacao).length : 0);

console.log('🎉 Dados de teste adicionados com sucesso! Recarregue a página para ver os dados.');