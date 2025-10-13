// Script para debugar localStorage
console.log('=== DEBUG LOCALSTORAGE ===');

// Verificar todas as chaves do localStorage
console.log('Todas as chaves no localStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${i}: ${key}`);
}

// Verificar dados específicos
const transactionsKey = 'zetafin_transactions';
const categoriesKey = 'zetafin_categories';

console.log('\n=== TRANSAÇÕES ===');
const transactionsData = localStorage.getItem(transactionsKey);
if (transactionsData) {
  try {
    const transactions = JSON.parse(transactionsData);
    console.log(`Número de transações: ${transactions.length}`);
    console.log('Primeiras 3 transações:', transactions.slice(0, 3));
  } catch (e) {
    console.error('Erro ao parsear transações:', e);
    console.log('Dados brutos:', transactionsData);
  }
} else {
  console.log('Nenhuma transação encontrada no localStorage');
}

console.log('\n=== CATEGORIAS ===');
const categoriesData = localStorage.getItem(categoriesKey);
if (categoriesData) {
  try {
    const categories = JSON.parse(categoriesData);
    console.log(`Número de categorias: ${categories.length}`);
    console.log('Categorias:', categories.map(c => ({ id: c.id, nome: c.nome })));
  } catch (e) {
    console.error('Erro ao parsear categorias:', e);
    console.log('Dados brutos:', categoriesData);
  }
} else {
  console.log('Nenhuma categoria encontrada no localStorage');
}

console.log('\n=== VERIFICAÇÃO COMPLETA ===');
console.log('localStorage.length:', localStorage.length);