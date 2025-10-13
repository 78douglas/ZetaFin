/**
 * SCRIPT DE LIMPEZA COMPLETA DO SISTEMA ZETAFIN
 * Remove TODOS os vestígios de dados fictícios e transações
 */

export interface CleanupResult {
  success: boolean
  itemsRemoved: string[]
  errors: string[]
  summary: string
}

// Lista completa de todas as chaves possíveis do localStorage
const ALL_STORAGE_KEYS = [
  // Chaves padronizadas atuais
  'zetafin_transactions',
  'zetafin_categories',
  'zetafin_user',
  'zetafin_auth_token',
  'zetafin_theme',
  'zetafin_couple_data',
  
  // Chaves antigas que podem existir
  'transactions',
  'categories',
  'user',
  'auth_token',
  'theme',
  
  // Chaves de dados fictícios
  'dados_ficticios_inseridos',
  'auto_insert_executed',
  'mock_data_inserted',
  'ficticios_inseridos',
  
  // Outras chaves possíveis (hífen em vez de underscore)
  'zetafin-transactions',
  'zetafin-categories',
  'zetafin-user',
  'zetafin-theme',
  'zetafin-couple-data',
  'couple_data',
  'coupleData'
]

/**
 * Executa uma limpeza completa e definitiva do sistema
 * Remove TODOS os dados do localStorage relacionados ao ZetaFin
 */
export function executeCompleteSystemCleanup(): CleanupResult {
  console.log('🧹 INICIANDO LIMPEZA COMPLETA E TOTAL DO SISTEMA...')
  
  const result: CleanupResult = {
    success: false,
    itemsRemoved: [],
    errors: [],
    summary: ''
  }

  try {
    // 1. Primeira varredura - identificar TODAS as chaves existentes
    const allExistingKeys: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        allExistingKeys.push(key)
      }
    }

    console.log(`📋 Total de chaves no localStorage: ${allExistingKeys.length}`)
    console.log('🔍 Todas as chaves:', allExistingKeys)

    // 2. Identificar chaves ZetaFin para remoção
    const zetafinKeys = allExistingKeys.filter(key => 
      key.startsWith('zetafin') || 
      key.includes('zetafin') ||
      ALL_STORAGE_KEYS.includes(key)
    )

    console.log(`🎯 Chaves ZetaFin encontradas: ${zetafinKeys.length}`)
    console.log('🔍 Chaves ZetaFin:', zetafinKeys)

    // 3. Remover cada chave ZetaFin encontrada
    zetafinKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key)
        if (value !== null) {
          localStorage.removeItem(key)
          result.itemsRemoved.push(`${key}: ${value.length > 100 ? value.substring(0, 100) + '...' : value}`)
          console.log(`✅ Removido: ${key}`)
        }
      } catch (error) {
        const errorMsg = `Erro ao remover ${key}: ${error}`
        result.errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    })

    // 4. Limpeza de segurança TOTAL - forçar remoção de TODAS as chaves conhecidas
    console.log('🔒 Executando limpeza de segurança TOTAL...')
    ALL_STORAGE_KEYS.forEach(key => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          console.log(`🔒 Limpeza de segurança: ${key}`)
          if (!result.itemsRemoved.some(item => item.startsWith(key))) {
            result.itemsRemoved.push(`${key}: (limpeza de segurança)`)
          }
        }
      } catch (error) {
        console.warn(`⚠️ Aviso na limpeza de segurança para ${key}:`, error)
      }
    })

    // 5. Limpeza adicional de chaves que podem ter escapado
    console.log('🔍 Limpeza adicional de chaves relacionadas...')
    const additionalKeys = [
      'transacoes', 'categorias', 'dados_ficticios', 'fictitious_data',
      'finance_data', 'financial_data', 'app_data', 'user_preferences'
    ]
    
    additionalKeys.forEach(key => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          console.log(`🧹 Limpeza adicional: ${key}`)
          result.itemsRemoved.push(`${key}: (limpeza adicional)`)
        }
      } catch (error) {
        console.warn(`⚠️ Aviso na limpeza adicional para ${key}:`, error)
      }
    })

    // 6. Verificação final RIGOROSA
    console.log('🔍 Verificação final RIGOROSA...')
    const remainingKeys: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('zetafin') || 
        key.includes('zetafin') ||
        ALL_STORAGE_KEYS.includes(key) ||
        key.includes('transaction') ||
        key.includes('categor') ||
        key.includes('dados') ||
        key.includes('ficticio')
      )) {
        remainingKeys.push(key)
      }
    }

    if (remainingKeys.length > 0) {
      console.warn('⚠️ ATENÇÃO: Chaves ainda presentes após limpeza:', remainingKeys)
      result.errors.push(`Chaves não removidas: ${remainingKeys.join(', ')}`)
      
      // Tentar forçar remoção das chaves restantes
      remainingKeys.forEach(key => {
        try {
          localStorage.removeItem(key)
          console.log(`🔨 Remoção forçada: ${key}`)
        } catch (error) {
          console.error(`❌ Falha na remoção forçada de ${key}:`, error)
        }
      })
    }

    // 7. Gerar resumo detalhado
    result.success = result.errors.length === 0 && remainingKeys.length === 0
    result.summary = `
🧹 LIMPEZA COMPLETA E TOTAL EXECUTADA
✅ Chaves removidas: ${result.itemsRemoved.length}
${result.errors.length > 0 ? `❌ Erros: ${result.errors.length}` : '✅ Nenhum erro'}
${remainingKeys.length > 0 ? `⚠️ Chaves restantes: ${remainingKeys.length}` : '✅ Sistema 100% LIMPO'}
🎯 Status: ${result.success ? 'SUCESSO TOTAL' : 'ATENÇÃO NECESSÁRIA'}
    `.trim()

    console.log(result.summary)
    return result

  } catch (error) {
    const errorMsg = `Erro crítico na limpeza: ${error}`
    result.errors.push(errorMsg)
    result.summary = `❌ FALHA CRÍTICA NA LIMPEZA: ${errorMsg}`
    console.error('❌ ERRO CRÍTICO:', error)
    return result
  }
}

/**
 * Função para verificar se o sistema está limpo
 */
export function verifySystemIsClean(): boolean {
  console.log('🔍 Verificando se o sistema está limpo...')
  
  const problematicKeys: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.toLowerCase().includes('zetafin') || 
      key.toLowerCase().includes('transac') ||
      key.toLowerCase().includes('categor') ||
      key.toLowerCase().includes('ficticio')
    )) {
      const value = localStorage.getItem(key)
      if (value && value !== '[]' && value !== '{}') {
        problematicKeys.push(key)
      }
    }
  }

  const isClean = problematicKeys.length === 0
  
  if (isClean) {
    console.log('✅ Sistema está limpo!')
  } else {
    console.warn('⚠️ Sistema ainda tem dados:', problematicKeys)
  }
  
  return isClean
}

/**
 * Função para resetar apenas as categorias para as padrão
 */
export function resetCategoriesToDefault(): void {
  console.log('🏷️ Resetando categorias para padrão...')
  
  const defaultCategories = [
    { id: '1', nome: 'Alimentação', tipo_padrao: 'DESPESA', cor: '#ef4444', icone: '🍽️', ativa: true },
    { id: '2', nome: 'Transporte', tipo_padrao: 'DESPESA', cor: '#f97316', icone: '🚗', ativa: true },
    { id: '3', nome: 'Moradia', tipo_padrao: 'DESPESA', cor: '#eab308', icone: '🏠', ativa: true },
    { id: '4', nome: 'Saúde', tipo_padrao: 'DESPESA', cor: '#22c55e', icone: '🏥', ativa: true },
    { id: '5', nome: 'Educação', tipo_padrao: 'DESPESA', cor: '#3b82f6', icone: '📚', ativa: true },
    { id: '6', nome: 'Lazer', tipo_padrao: 'DESPESA', cor: '#8b5cf6', icone: '🎬', ativa: true },
    { id: '7', nome: 'Salário', tipo_padrao: 'RECEITA', cor: '#10b981', icone: '💰', ativa: true },
    { id: '8', nome: 'Freelance', tipo_padrao: 'RECEITA', cor: '#06b6d4', icone: '💻', ativa: true },
    { id: '9', nome: 'Investimentos', tipo_padrao: 'AMBOS', cor: '#6366f1', icone: '📈', ativa: true },
    { id: '10', nome: 'Outros', tipo_padrao: 'AMBOS', cor: '#6b7280', icone: '📝', ativa: true }
  ].map(cat => ({
    ...cat,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  localStorage.setItem('zetafin_categories', JSON.stringify(defaultCategories))
  console.log('✅ Categorias padrão restauradas')
}