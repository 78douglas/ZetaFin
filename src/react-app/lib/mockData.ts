import { Transacao } from '../hooks/useTransactionsLocal'
import { APP_CONFIG } from './config'

// Função para gerar UUID simples
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Dados fictícios para gerar transações realistas dos últimos 3 meses
const RECEITAS_FICTICIAS = [
  // Receitas fixas mensais
  { descricao: 'Salário - Empresa XYZ', valor: 4800, categoria: 'Salário', frequencia: 'mensal', dia: 5 },
  { descricao: 'Freelance - Projeto Web', valor: 1200, categoria: 'Freelance', frequencia: 'esporadica' },
  { descricao: 'Freelance - Consultoria', valor: 800, categoria: 'Freelance', frequencia: 'esporadica' },
  { descricao: 'Venda - Marketplace', valor: 350, categoria: 'Outros', frequencia: 'esporadica' },
  { descricao: 'Dividendos - Ações', valor: 180, categoria: 'Investimentos', frequencia: 'mensal' },
  { descricao: 'Rendimento - Poupança', valor: 45, categoria: 'Investimentos', frequencia: 'mensal' },
  { descricao: 'Cashback - Cartão', valor: 85, categoria: 'Outros', frequencia: 'mensal' },
  { descricao: 'Reembolso - Despesas', valor: 120, categoria: 'Outros', frequencia: 'esporadica' },
  { descricao: 'Venda - Produto Usado', valor: 200, categoria: 'Outros', frequencia: 'esporadica' },
  { descricao: 'Prêmio - Performance', valor: 500, categoria: 'Outros', frequencia: 'esporadica' }
]

const DESPESAS_FICTICIAS = [
  // Alimentação - Frequentes
  { descricao: 'Supermercado - Compras da semana', valor: 280, categoria: 'Alimentação', frequencia: 'semanal' },
  { descricao: 'Padaria - Pães e café', valor: 18, categoria: 'Alimentação', frequencia: 'frequente' },
  { descricao: 'Restaurante - Almoço', valor: 45, categoria: 'Alimentação', frequencia: 'frequente' },
  { descricao: 'Lanchonete - Lanche da tarde', valor: 22, categoria: 'Alimentação', frequencia: 'frequente' },
  { descricao: 'Delivery - Jantar', valor: 38, categoria: 'Alimentação', frequencia: 'frequente' },
  { descricao: 'Café - Cafeteria', valor: 12, categoria: 'Alimentação', frequencia: 'frequente' },
  { descricao: 'Açougue - Carnes', valor: 85, categoria: 'Alimentação', frequencia: 'quinzenal' },
  { descricao: 'Feira - Frutas e verduras', valor: 45, categoria: 'Alimentação', frequencia: 'semanal' },
  
  // Transporte - Regulares
  { descricao: 'Gasolina - Posto Shell', valor: 220, categoria: 'Transporte', frequencia: 'quinzenal' },
  { descricao: 'Uber - Corrida', valor: 28, categoria: 'Transporte', frequencia: 'frequente' },
  { descricao: 'Estacionamento - Shopping', valor: 8, categoria: 'Transporte', frequencia: 'frequente' },
  { descricao: 'Pedágio - Viagem', valor: 15, categoria: 'Transporte', frequencia: 'esporadica' },
  { descricao: 'Manutenção - Carro', valor: 180, categoria: 'Transporte', frequencia: 'esporadica' },
  { descricao: 'IPVA - Veículo', valor: 450, categoria: 'Transporte', frequencia: 'anual' },
  
  // Moradia - Fixas mensais
  { descricao: 'Aluguel - Apartamento', valor: 1350, categoria: 'Moradia', frequencia: 'mensal', dia: 10 },
  { descricao: 'Condomínio - Taxa', valor: 280, categoria: 'Moradia', frequencia: 'mensal', dia: 15 },
  { descricao: 'Energia Elétrica - CEMIG', valor: 165, categoria: 'Moradia', frequencia: 'mensal' },
  { descricao: 'Água - COPASA', valor: 78, categoria: 'Moradia', frequencia: 'mensal' },
  { descricao: 'Internet - Vivo Fibra', valor: 99, categoria: 'Moradia', frequencia: 'mensal' },
  { descricao: 'Gás - Botijão', valor: 85, categoria: 'Moradia', frequencia: 'bimestral' },
  
  // Saúde - Variadas
  { descricao: 'Plano de Saúde - Unimed', valor: 320, categoria: 'Saúde', frequencia: 'mensal' },
  { descricao: 'Academia - Mensalidade', valor: 89, categoria: 'Saúde', frequencia: 'mensal' },
  { descricao: 'Farmácia - Medicamentos', valor: 45, categoria: 'Saúde', frequencia: 'frequente' },
  { descricao: 'Dentista - Consulta', valor: 180, categoria: 'Saúde', frequencia: 'esporadica' },
  { descricao: 'Médico - Consulta particular', valor: 220, categoria: 'Saúde', frequencia: 'esporadica' },
  { descricao: 'Exames - Laboratório', valor: 150, categoria: 'Saúde', frequencia: 'esporadica' },
  
  // Lazer - Diversas
  { descricao: 'Netflix - Assinatura', valor: 32.90, categoria: 'Lazer', frequencia: 'mensal' },
  { descricao: 'Spotify - Premium', valor: 21.90, categoria: 'Lazer', frequencia: 'mensal' },
  { descricao: 'Cinema - Ingresso', valor: 28, categoria: 'Lazer', frequencia: 'frequente' },
  { descricao: 'Bar - Happy hour', valor: 65, categoria: 'Lazer', frequencia: 'frequente' },
  { descricao: 'Show - Ingresso', valor: 120, categoria: 'Lazer', frequencia: 'esporadica' },
  { descricao: 'Viagem - Final de semana', valor: 380, categoria: 'Lazer', frequencia: 'esporadica' },
  { descricao: 'Jogo - Steam', valor: 45, categoria: 'Lazer', frequencia: 'esporadica' },
  
  // Educação
  { descricao: 'Curso - Udemy', valor: 89, categoria: 'Educação', frequencia: 'esporadica' },
  { descricao: 'Livro - Amazon', valor: 35, categoria: 'Educação', frequencia: 'frequente' },
  { descricao: 'Inglês - Mensalidade', valor: 180, categoria: 'Educação', frequencia: 'mensal' },
  { descricao: 'Certificação - Prova', valor: 250, categoria: 'Educação', frequencia: 'esporadica' },
  
  // Compras - Variadas
  { descricao: 'Roupa - Loja', valor: 150, categoria: 'Outros', frequencia: 'frequente' },
  { descricao: 'Sapato - Calçados', valor: 180, categoria: 'Outros', frequencia: 'esporadica' },
  { descricao: 'Eletrônicos - Acessório', valor: 85, categoria: 'Outros', frequencia: 'frequente' },
  { descricao: 'Casa - Utensílios', valor: 65, categoria: 'Moradia', frequencia: 'frequente' },
  { descricao: 'Presente - Aniversário', valor: 120, categoria: 'Outros', frequencia: 'esporadica' },
  
  // Serviços
  { descricao: 'Barbeiro - Corte de cabelo', valor: 35, categoria: 'Outros', frequencia: 'mensal' },
  { descricao: 'Lavanderia - Roupas', valor: 25, categoria: 'Outros', frequencia: 'frequente' },
  { descricao: 'Seguro - Carro', valor: 180, categoria: 'Transporte', frequencia: 'mensal' },
  { descricao: 'Celular - Conta', valor: 65, categoria: 'Outros', frequencia: 'mensal' },
  
  // Impostos e Taxas
  { descricao: 'Imposto de Renda - Carnê', valor: 280, categoria: 'Outros', frequencia: 'esporadica' },
  { descricao: 'Taxa - Cartão de crédito', valor: 15, categoria: 'Outros', frequencia: 'mensal' },
  { descricao: 'IPTU - Parcela', valor: 120, categoria: 'Moradia', frequencia: 'esporadica' }
]

// Função para gerar uma data específica baseada no mês e dia
function gerarDataEspecifica(mesAtras: number, dia?: number): string {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mesAtual = hoje.getMonth()
  
  // Calcular o mês alvo
  let mesAlvo = mesAtual - mesAtras
  let anoAlvo = ano
  
  if (mesAlvo < 0) {
    mesAlvo += 12
    anoAlvo -= 1
  }
  
  // Se não especificou dia, gerar aleatório
  const diaAlvo = dia || Math.floor(Math.random() * 28) + 1
  
  const data = new Date(anoAlvo, mesAlvo, diaAlvo)
  return data.toISOString().split('T')[0]
}

// Função para gerar data aleatória em um período
function gerarDataAleatoria(diasAtras: number): string {
  const hoje = new Date()
  const dataAleatoria = new Date(hoje.getTime() - Math.random() * diasAtras * 24 * 60 * 60 * 1000)
  return dataAleatoria.toISOString().split('T')[0]
}

// Função para obter uma categoria padrão baseada no nome
function obterCategoriaId(nomeCategoria: string, categorias: any[]): string {
  const categoria = categorias.find(cat => 
    cat.nome.toLowerCase().includes(nomeCategoria.toLowerCase()) ||
    nomeCategoria.toLowerCase().includes(cat.nome.toLowerCase())
  )
  
  if (categoria) {
    return categoria.id
  }
  
  // Mapeamento de fallback para categorias comuns
  const mapeamento: { [key: string]: string } = {
    'Salário': 'Salário',
    'Freelance': 'Freelance', 
    'Vendas': 'Outros',
    'Bônus': 'Outros',
    'Investimentos': 'Investimentos',
    'Outros': 'Outros',
    'Alimentação': 'Alimentação',
    'Transporte': 'Transporte',
    'Casa': 'Moradia',
    'Moradia': 'Moradia',
    'Saúde': 'Saúde',
    'Lazer': 'Lazer',
    'Educação': 'Educação',
    'Compras': 'Outros',
    'Serviços': 'Outros',
    'Impostos': 'Outros'
  }
  
  const nomeAlternativo = mapeamento[nomeCategoria]
  if (nomeAlternativo) {
    const categoriaAlternativa = categorias.find(cat => 
      cat.nome.toLowerCase().includes(nomeAlternativo.toLowerCase())
    )
    if (categoriaAlternativa) return categoriaAlternativa.id
  }
  
  // Se não encontrar, usar a primeira categoria disponível
  return categorias[0]?.id || '1'
}

// Função principal para gerar dados fictícios dos últimos 3 meses
export function gerarDadosFicticios(categorias: any[]): Transacao[] {
  console.log('🔍 DEBUG: Iniciando geração de dados fictícios')
  console.log('🔍 DEBUG: Categorias recebidas para geração:', categorias)
  
  if (!categorias || categorias.length === 0) {
    console.error('❌ Erro: Nenhuma categoria disponível para gerar dados fictícios')
    throw new Error('Nenhuma categoria disponível para gerar dados fictícios')
  }

  const transacoes: Transacao[] = []
  
  // Gerar transações para cada um dos últimos 3 meses
  for (let mes = 0; mes < 3; mes++) {
    
    // === RECEITAS MENSAIS ===
    // Salário (sempre no dia 5)
    const salario = RECEITAS_FICTICIAS.find(r => r.categoria === 'Salário')
    if (salario) {
      const variacao = 0.95 + Math.random() * 0.1 // Variação mínima no salário
      transacoes.push({
        id: generateUUID(),
        descricao: salario.descricao,
        valor: Math.round(salario.valor * variacao * 100) / 100,
        data: gerarDataEspecifica(mes, salario.dia),
        tipo: 'RECEITA',
        categoria_id: obterCategoriaId(salario.categoria, categorias),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // Outras receitas mensais (dividendos, cashback)
    const receitasMensais = RECEITAS_FICTICIAS.filter(r => r.frequencia === 'mensal' && r.categoria !== 'Salário')
    receitasMensais.forEach(receita => {
      const variacao = 0.8 + Math.random() * 0.4
      transacoes.push({
        id: generateUUID(),
        descricao: receita.descricao,
        valor: Math.round(receita.valor * variacao * 100) / 100,
        data: gerarDataEspecifica(mes),
        tipo: 'RECEITA',
        categoria_id: obterCategoriaId(receita.categoria, categorias),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })
    
    // Receitas esporádicas (1-2 por mês)
    const receitasEsporadicas = RECEITAS_FICTICIAS.filter(r => r.frequencia === 'esporadica')
    const quantidadeEsporadicas = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < quantidadeEsporadicas; i++) {
      const receita = receitasEsporadicas[Math.floor(Math.random() * receitasEsporadicas.length)]
      const variacao = 0.6 + Math.random() * 0.8
      transacoes.push({
          id: generateUUID(),
        descricao: receita.descricao,
        valor: Math.round(receita.valor * variacao * 100) / 100,
        data: gerarDataEspecifica(mes),
        tipo: 'RECEITA',
        categoria_id: obterCategoriaId(receita.categoria, categorias),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // === DESPESAS FIXAS MENSAIS ===
    const despesasMensais = DESPESAS_FICTICIAS.filter(d => d.frequencia === 'mensal')
    despesasMensais.forEach(despesa => {
      const variacao = 0.95 + Math.random() * 0.1 // Despesas fixas variam pouco
      transacoes.push({
        id: generateUUID(),
        descricao: despesa.descricao,
        valor: Math.round(despesa.valor * variacao * 100) / 100,
        data: gerarDataEspecifica(mes, despesa.dia),
        tipo: 'DESPESA',
        categoria_id: obterCategoriaId(despesa.categoria, categorias),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })
    
    // === DESPESAS SEMANAIS ===
    const despesasSemanais = DESPESAS_FICTICIAS.filter(d => d.frequencia === 'semanal')
    despesasSemanais.forEach(despesa => {
      // 4 vezes por mês (semanalmente)
      for (let semana = 0; semana < 4; semana++) {
        const variacao = 0.7 + Math.random() * 0.6
        const diaBase = semana * 7 + Math.floor(Math.random() * 7) + 1
        transacoes.push({
          id: generateUUID(),
          descricao: despesa.descricao,
          valor: Math.round(despesa.valor * variacao * 100) / 100,
          data: gerarDataEspecifica(mes, Math.min(diaBase, 28)),
          tipo: 'DESPESA',
          categoria_id: obterCategoriaId(despesa.categoria, categorias),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    })
    
    // === DESPESAS QUINZENAIS ===
    const despesasQuinzenais = DESPESAS_FICTICIAS.filter(d => d.frequencia === 'quinzenal')
    despesasQuinzenais.forEach(despesa => {
      // 2 vezes por mês
      for (let quinzena = 0; quinzena < 2; quinzena++) {
        const variacao = 0.8 + Math.random() * 0.4
        const dia = quinzena === 0 ? Math.floor(Math.random() * 15) + 1 : Math.floor(Math.random() * 13) + 16
        transacoes.push({
            id: generateUUID(),
          descricao: despesa.descricao,
          valor: Math.round(despesa.valor * variacao * 100) / 100,
          data: gerarDataEspecifica(mes, dia),
          tipo: 'DESPESA',
          categoria_id: obterCategoriaId(despesa.categoria, categorias),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    })
    
    // === DESPESAS FREQUENTES ===
    const despesasFrequentes = DESPESAS_FICTICIAS.filter(d => d.frequencia === 'frequente')
    despesasFrequentes.forEach(despesa => {
      // 8-15 vezes por mês (bem frequentes)
      const quantidade = Math.floor(Math.random() * 8) + 8
      for (let i = 0; i < quantidade; i++) {
        const variacao = 0.5 + Math.random() * 1.0 // Maior variação
          transacoes.push({
            id: generateUUID(),
          descricao: despesa.descricao,
          valor: Math.round(despesa.valor * variacao * 100) / 100,
          data: gerarDataEspecifica(mes),
          tipo: 'DESPESA',
          categoria_id: obterCategoriaId(despesa.categoria, categorias),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    })
    
    // === DESPESAS ESPORÁDICAS ===
    const despesasEsporadicas = DESPESAS_FICTICIAS.filter(d => d.frequencia === 'esporadica')
    // 3-8 despesas esporádicas por mês
    const quantidadeEsporadicasDespesas = Math.floor(Math.random() * 6) + 3
    for (let i = 0; i < quantidadeEsporadicasDespesas; i++) {
      const despesa = despesasEsporadicas[Math.floor(Math.random() * despesasEsporadicas.length)]
      const variacao = 0.6 + Math.random() * 0.8
        transacoes.push({
          id: generateUUID(),
        descricao: despesa.descricao,
        valor: Math.round(despesa.valor * variacao * 100) / 100,
        data: gerarDataEspecifica(mes),
        tipo: 'DESPESA',
        categoria_id: obterCategoriaId(despesa.categoria, categorias),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // === DESPESAS BIMESTRAIS (apenas nos meses pares) ===
    if (mes % 2 === 0) {
      const despesasBimestrais = DESPESAS_FICTICIAS.filter(d => d.frequencia === 'bimestral')
      despesasBimestrais.forEach(despesa => {
        const variacao = 0.9 + Math.random() * 0.2
        transacoes.push({
          id: generateUUID(),
          descricao: despesa.descricao,
          valor: Math.round(despesa.valor * variacao * 100) / 100,
          data: gerarDataEspecifica(mes),
          tipo: 'DESPESA',
          categoria_id: obterCategoriaId(despesa.categoria, categorias),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })
    }
  }
  
  console.log(`✅ Geradas ${transacoes.length} transações fictícias com sucesso`)
  
  // Ordenar por data (mais recente primeiro)
  return transacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
}

// Função ULTRA-SIMPLIFICADA para inserir dados fictícios no localStorage
export function inserirDadosFicticios(): void {
  console.log('🚀 ULTRA-SIMPLES: Inserindo dados fictícios...')
  
  try {
    // Criar apenas 3 transações básicas com dados fixos
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)
    const anteontem = new Date(hoje)
    anteontem.setDate(hoje.getDate() - 2)
    
    const transacoesTeste = [
      {
        id: 'test-receita-1',
        descricao: 'Salário - Teste',
        valor: 3000,
        data: hoje.toISOString().split('T')[0],
        tipo: 'RECEITA',
        categoria_id: '7', // Salário (da config)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'test-despesa-1',
        descricao: 'Supermercado - Teste',
        valor: 250,
        data: ontem.toISOString().split('T')[0],
        tipo: 'DESPESA',
        categoria_id: '1', // Alimentação (da config)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'test-despesa-2',
        descricao: 'Gasolina - Teste',
        valor: 180,
        data: anteontem.toISOString().split('T')[0],
        tipo: 'DESPESA',
        categoria_id: '2', // Transporte (da config)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    console.log('✅ Criadas 3 transações de teste:', transacoesTeste)
    
    // Salvar diretamente no localStorage (substituindo dados existentes para teste)
    localStorage.setItem('zetafin_transactions', JSON.stringify(transacoesTeste))
    console.log('✅ Dados salvos no localStorage')
    
    // Verificar se foi salvo
    const verificacao = localStorage.getItem('zetafin_transactions')
    if (verificacao) {
      const dadosVerificados = JSON.parse(verificacao)
      console.log('✅ Verificação OK:', dadosVerificados.length, 'transações salvas')
    }
    
    console.log('🎉 SUCESSO: Dados fictícios inseridos!')
    
  } catch (error) {
    console.error('❌ ERRO:', error)
    throw error
  }
}