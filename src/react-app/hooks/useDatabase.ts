import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { APP_CONFIG } from '../lib/config'

export const useDatabase = () => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para resetar estado de loading com timeout de segurança
  const resetLoadingState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setLoading(false)
  }, [])

  // Função para definir timeout de segurança
  const setLoadingWithTimeout = useCallback((timeoutMs: number = 30000) => {
    setLoading(true)
    
    // Cancelar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Definir novo timeout
    timeoutRef.current = setTimeout(() => {
      console.warn('Operação do banco de dados excedeu o timeout')
      resetLoadingState()
      toast.error('Operação demorou muito para responder. Tente novamente.')
    }, timeoutMs)
  }, [resetLoadingState])

  const insertFictitiousData = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Evitar múltiplas chamadas simultâneas
    if (loading) {
      toast.warning('Operação já em andamento. Aguarde...')
      return { success: false, error: 'Operação já em andamento' }
    }

    try {
      setLoadingWithTimeout(20000) // 20 segundos de timeout
      
      // Cancelar operação anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      
      const { data, error } = await supabase.rpc('inserir_dados_ficticios', {
        p_usuario_id: user.id
      })

      if (error) {
        throw error
      }

      toast.success('Dados fictícios inseridos com sucesso!')
      return { success: true, error: null, data }
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.info('Operação cancelada')
        return { success: false, error: 'Operação cancelada' }
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inserir dados fictícios'
      toast.error(errorMessage)
      console.error('Erro ao inserir dados fictícios:', err)
      return { success: false, error: errorMessage }
    } finally {
      resetLoadingState()
    }
  }, [user, loading, setLoadingWithTimeout, resetLoadingState])

  const resetUserData = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Evitar múltiplas chamadas simultâneas
    if (loading) {
      toast.warning('Operação já em andamento. Aguarde...')
      return { success: false, error: 'Operação já em andamento' }
    }

    try {
      setLoadingWithTimeout(15000) // 15 segundos de timeout
      
      // Cancelar operação anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      
      const { data, error } = await supabase.rpc('reset_user_data', {
        p_usuario_id: user.id
      })

      if (error) {
        throw error
      }

      toast.success('Dados do usuário resetados com sucesso!')
      return { success: true, error: null, data }
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.info('Operação cancelada')
        return { success: false, error: 'Operação cancelada' }
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resetar dados do usuário'
      toast.error(errorMessage)
      console.error('Erro ao resetar dados do usuário:', err)
      return { success: false, error: errorMessage }
    } finally {
      resetLoadingState()
    }
  }, [user, loading, setLoadingWithTimeout, resetLoadingState])

  const migrateLocalStorageData = async () => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      setLoading(true)
      
      // Buscar dados do localStorage
      const localTransactions = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)
    const localCategories = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      
      if (!localTransactions && !localCategories) {
        toast.info('Nenhum dado local encontrado para migrar')
        return { success: true, error: null }
      }

      let migratedCount = 0

      // Migrar categorias personalizadas (se houver)
      if (localCategories) {
        try {
          const categories = JSON.parse(localCategories)
          const customCategories = categories.filter((cat: any) => 
            !['Salário', 'Freelance', 'Investimentos', 'Outros', 'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Contas'].includes(cat.name)
          )

          for (const category of customCategories) {
            const { error } = await supabase
              .from('categorias')
              .insert([{
                nome: category.name,
                cor: category.color,
                icone: category.icon || 'tag',
                tipo_padrao: category.type === 'income' ? 'RECEITA' : 'DESPESA',
                ativa: true
              }])

            if (!error) {
              migratedCount++
            }
          }
        } catch (err) {
          console.error('Erro ao migrar categorias:', err)
        }
      }

      // Migrar transações
      if (localTransactions) {
        try {
          const transactions = JSON.parse(localTransactions)
          
          // Buscar categorias existentes para mapear
          const { data: existingCategories } = await supabase
            .from('categorias')
            .select('*')

          const categoryMap = new Map()
          existingCategories?.forEach(cat => {
            categoryMap.set(cat.nome.toLowerCase(), cat.id)
          })

          for (const transaction of transactions) {
            // Mapear categoria
            let categoria_id = null
            if (transaction.category) {
              categoria_id = categoryMap.get(transaction.category.toLowerCase())
            }

            // Se não encontrou a categoria, usar uma padrão
            if (!categoria_id && existingCategories && existingCategories.length > 0) {
              categoria_id = existingCategories[0].id
            }

            const { error } = await supabase
              .from('transacoes')
              .insert([{
                usuario_id: user.id,
                descricao: transaction.description || transaction.title || 'Transação migrada',
                valor: Math.abs(transaction.amount || transaction.value || 0),
                tipo: transaction.type === 'income' || transaction.amount > 0 ? 'RECEITA' : 'DESPESA',
                data: transaction.date || new Date().toISOString().split('T')[0],
                categoria_id: categoria_id,
                observacoes: transaction.notes || null
              }])

            if (!error) {
              migratedCount++
            }
          }
        } catch (err) {
          console.error('Erro ao migrar transações:', err)
        }
      }

      if (migratedCount > 0) {
        toast.success(`${migratedCount} itens migrados com sucesso!`)
        
        // Limpar localStorage após migração bem-sucedida
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      } else {
        toast.info('Nenhum dado foi migrado')
      }

      return { success: true, error: null, migratedCount }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao migrar dados locais'
      toast.error(errorMessage)
      console.error('Erro ao migrar dados locais:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const checkLocalStorageData = () => {
    const localTransactions = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)
    const localCategories = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
    
    let transactionCount = 0
    let categoryCount = 0

    if (localTransactions) {
      try {
        const transactions = JSON.parse(localTransactions)
        transactionCount = Array.isArray(transactions) ? transactions.length : 0
      } catch (err) {
        console.error('Erro ao analisar transações locais:', err)
      }
    }

    if (localCategories) {
      try {
        const categories = JSON.parse(localCategories)
        categoryCount = Array.isArray(categories) ? categories.length : 0
      } catch (err) {
        console.error('Erro ao analisar categorias locais:', err)
      }
    }

    return {
      hasLocalData: transactionCount > 0 || categoryCount > 0,
      transactionCount,
      categoryCount
    }
  }

  // Função para forçar reset do estado (útil em caso de travamento)
  const forceReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    resetLoadingState()
    toast.info('Estado resetado manualmente')
  }, [resetLoadingState])

  return {
    loading,
    insertFictitiousData,
    resetUserData,
    migrateLocalStorageData,
    checkLocalStorageData,
    forceReset
  }
}