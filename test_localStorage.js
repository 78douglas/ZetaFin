// Script para testar localStorage diretamente
console.log('🧪 TESTE: Iniciando teste do localStorage');

// Limpar localStorage
localStorage.clear();
console.log('🧪 TESTE: localStorage limpo');

// Verificar se está vazio
console.log('🧪 TESTE: Categorias no localStorage:', localStorage.getItem('zetafin_categories'));
console.log('🧪 TESTE: Transações no localStorage:', localStorage.getItem('zetafin_transactions'));

// Adicionar categorias padrão
const categoriasPadrao = [
  { id: '1', nome: 'Alimentação', tipo_padrao: 'DESPESA', cor: '#ef4444', icone: '🍽️', ativa: true },
  { id: '2', nome: 'Transporte', tipo_padrao: 'DESPESA', cor: '#f97316', icone: '🚗', ativa: true },
  { id: '7', nome: 'Salário', tipo_padrao: 'RECEITA', cor: '#10b981', icone: '💰', ativa: true }
];

localStorage.setItem('zetafin_categories', JSON.stringify(categoriasPadrao));
console.log('🧪 TESTE: Categorias adicionadas:', categoriasPadrao.length);

// Adicionar transações de teste
const transacoesTeste = [
  {
    id: 'test-1',
    descricao: 'Supermercado',
    valor: 150.50,
    data: '2024-12-15',
    tipo: 'DESPESA',
    categoria_id: '1'
  },
  {
    id: 'test-2',
    descricao: 'Salário',
    valor: 3000.00,
    data: '2024-12-01',
    tipo: 'RECEITA',
    categoria_id: '7'
  }
];

localStorage.setItem('zetafin_transactions', JSON.stringify(transacoesTeste));
console.log('🧪 TESTE: Transações adicionadas:', transacoesTeste.length);

// Verificar se foram salvos
const categoriasVerificacao = localStorage.getItem('zetafin_categories');
const transacoesVerificacao = localStorage.getItem('zetafin_transactions');

console.log('🧪 TESTE: Categorias salvas:', categoriasVerificacao ? JSON.parse(categoriasVerificacao).length : 0);
console.log('🧪 TESTE: Transações salvas:', transacoesVerificacao ? JSON.parse(transacoesVerificacao).length : 0);

console.log('🧪 TESTE: Dados completos das categorias:', JSON.parse(categoriasVerificacao || '[]'));
console.log('🧪 TESTE: Dados completos das transações:', JSON.parse(transacoesVerificacao || '[]'));

console.log('🧪 TESTE: Teste concluído! Agora recarregue a página para ver os dados.');