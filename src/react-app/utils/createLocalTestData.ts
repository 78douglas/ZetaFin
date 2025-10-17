import { APP_CONFIG } from '../config/app'

export interface LocalTestDataResult {
  success: boolean
  message: string
  categoriesCreated: number
  transactionsCreated: number
}

export function createLocalTestData(): LocalTestDataResult {
  try {
    console.log('🔧 Criando dados de teste locais...')

    // Criar categorias de teste (apenas personalizadas)
    const testCategories = [
      {
        id: 'custom-1',
        nome: 'Categoria Teste',
        tipo_padrao: 'DESPESA' as const,
        cor: '#FF6B6B',
        icone: '🧪',
        ativa: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(testCategories))

    // Criar transações de teste
    const testTransactions = [
      {
        id: 'trans-1',
        descricao: 'Transação de Teste - Receita',
        valor: 1000.00,
        tipo: 'RECEITA' as const,
        categoria_id: 'default-salary',
        data: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'trans-2',
        descricao: 'Transação de Teste - Despesa',
        valor: 250.50,
        tipo: 'DESPESA' as const,
        categoria_id: 'default-food',
        data: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(testTransactions))

    console.log('✅ Dados de teste locais criados com sucesso!')

    return {
      success: true,
      message: 'Dados de teste criados com sucesso!',
      categoriesCreated: testCategories.length,
      transactionsCreated: testTransactions.length
    }

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste locais:', error)
    return {
      success: false,
      message: `Erro ao criar dados de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      categoriesCreated: 0,
      transactionsCreated: 0
    }
  }
}

export function hasLocalData(): { hasCategories: boolean, hasTransactions: boolean } {
  const categories = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
  const transactions = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)

  return {
    hasCategories: !!(categories && JSON.parse(categories).length > 0),
    hasTransactions: !!(transactions && JSON.parse(transactions).length > 0)
  }
}

export function clearLocalData(): void {
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)
  console.log('🧹 Dados locais limpos')
}