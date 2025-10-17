// Script para executar no console do navegador para investigar o problema das categorias

console.log('🔍 INVESTIGAÇÃO PROFUNDA - Problema das Categorias');
console.log('================================================');

// 1. Verificar dados no localStorage
console.log('\n📦 1. DADOS NO LOCALSTORAGE:');
const transacoes = localStorage.getItem('zetafin_transactions');
const categorias = localStorage.getItem('zetafin_categories');

console.log('Transações raw:', transacoes);
console.log('Categorias raw:', categorias);

if (transacoes) {
  const transacoesParsed = JSON.parse(transacoes);
  console.log('\n💰 TRANSAÇÕES DETALHADAS:');
  transacoesParsed.forEach((t, index) => {
    console.log(`Transação ${index + 1}:`, {
      id: t.id,
      descricao: t.descricao,
      valor: t.valor,
      tipo: t.tipo,
      categoria_id: t.categoria_id,
      categoria_id_type: typeof t.categoria_id,
      data: t.data
    });
  });
}

if (categorias) {
  const categoriasParsed = JSON.parse(categorias);
  console.log('\n🏷️ CATEGORIAS DETALHADAS:');
  categoriasParsed.forEach((c, index) => {
    console.log(`Categoria ${index + 1}:`, {
      id: c.id,
      id_type: typeof c.id,
      nome: c.nome,
      tipo_padrao: c.tipo_padrao,
      icone: c.icone,
      ativa: c.ativa
    });
  });
}

// 2. Testar função obterCategoria
console.log('\n🔧 2. TESTE DA FUNÇÃO obterCategoria:');
if (window.React && categorias) {
  const categoriasParsed = JSON.parse(categorias);
  
  // Simular a função obterCategoria
  const obterCategoria = (id) => {
    console.log(`Buscando categoria com ID: "${id}" (tipo: ${typeof id})`);
    const categoria = categoriasParsed.find(cat => cat.id === id);
    console.log('Categoria encontrada:', categoria);
    return categoria;
  };
  
  // Testar com diferentes tipos de ID
  if (transacoes) {
    const transacoesParsed = JSON.parse(transacoes);
    transacoesParsed.forEach((t, index) => {
      console.log(`\nTeste ${index + 1} - Transação: ${t.descricao}`);
      console.log(`categoria_id: "${t.categoria_id}" (${typeof t.categoria_id})`);
      
      // Teste direto
      const resultado1 = obterCategoria(t.categoria_id);
      
      // Teste convertendo para string
      const resultado2 = obterCategoria(String(t.categoria_id));
      
      // Teste convertendo para number
      const resultado3 = obterCategoria(Number(t.categoria_id));
      
      console.log('Resultados:', {
        direto: resultado1?.nome || 'NÃO ENCONTRADO',
        string: resultado2?.nome || 'NÃO ENCONTRADO', 
        number: resultado3?.nome || 'NÃO ENCONTRADO'
      });
    });
  }
}

// 3. Verificar mapeamento atual
console.log('\n🗺️ 3. MAPEAMENTO CATEGORIA_ID → CATEGORIA:');
if (transacoes && categorias) {
  const transacoesParsed = JSON.parse(transacoes);
  const categoriasParsed = JSON.parse(categorias);
  
  console.log('IDs das categorias disponíveis:', categoriasParsed.map(c => `"${c.id}" (${typeof c.id})`));
  console.log('IDs usados nas transações:', transacoesParsed.map(t => `"${t.categoria_id}" (${typeof t.categoria_id})`));
  
  // Verificar correspondências
  transacoesParsed.forEach(transacao => {
    const categoriaEncontrada = categoriasParsed.find(cat => cat.id === transacao.categoria_id);
    console.log(`Transação "${transacao.descricao}":`, {
      categoria_id_usado: transacao.categoria_id,
      categoria_encontrada: categoriaEncontrada ? categoriaEncontrada.nome : '❌ NÃO ENCONTRADA',
      problema: !categoriaEncontrada ? 'CATEGORIA NÃO EXISTE OU ID INCOMPATÍVEL' : '✅ OK'
    });
  });
}

console.log('\n🎯 4. DIAGNÓSTICO FINAL:');
console.log('Execute este script e analise os resultados para identificar o problema exato.');