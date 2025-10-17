import { useState, useEffect, useCallback, useMemo } from 'react'
import { APP_CONFIG } from '../lib/config'
import { throttledErrorToast, throttledSuccessToast } from '../lib/notificationThrottle'

export interface Transacao {
  id: string
  descricao: string
  descricaoAdicional?: string
  valor: number
  data: string
  tipo: 'RECEITA' | 'DESPESA'
  categoria_id: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  categoria_id?: string
  tipo?: 'RECEITA' | 'DESPESA'
  descricao?: string
}

export const useTransactionsLocal = (filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS);
      console.log('🔍 DEBUG loadTransactions: stored data from localStorage:', stored);
      
      if (!stored) {
        setTransactions([]);
        return;
      }

      const parsed = JSON.parse(stored);
      console.log('🔍 DEBUG loadTransactions: parsed data:', parsed);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Dados de transações inválidos');
      }

      // Validar e filtrar transações válidas
      const validTransactions = parsed.filter((t: any) => {
        const isValid = t && 
          typeof t.id === 'string' && 
          typeof t.valor === 'number' && 
          typeof t.categoria_id === 'string' && 
          typeof t.tipo === 'string' && 
          ['RECEITA', 'DESPESA'].includes(t.tipo);
        
        if (!isValid) {
          console.warn('Transação inválida encontrada:', t);
        }
        
        return isValid;
      });

      console.log('🔍 DEBUG loadTransactions: valid transactions count:', validTransactions.length);
      console.log('🔍 DEBUG loadTransactions: valid transactions:', validTransactions);

      // Aplicar filtros se existirem
      let filteredTransactions = validTransactions;
      
      if (filters) {
        filteredTransactions = validTransactions.filter(transaction => {
          // Filtro por tipo
          if (filters.tipo && transaction.tipo !== filters.tipo) {
            return false;
          }
          
          // Filtro por categoria
          if (filters.categoria_id && transaction.categoria_id !== filters.categoria_id) {
            return false;
          }
          
          // Filtro por data
          if (filters.startDate || filters.endDate) {
            const transactionDate = new Date(transaction.data);
            
            if (filters.startDate && transactionDate < new Date(filters.startDate)) {
              return false;
            }
            
            if (filters.endDate && transactionDate > new Date(filters.endDate)) {
              return false;
            }
          }
          
          // Filtro por busca de texto
          if (filters.descricao) {
            const searchTerm = filters.descricao.toLowerCase();
            const matchesDescription = transaction.descricao?.toLowerCase().includes(searchTerm);
            const matchesTags = transaction.tags?.some((tag: string) => 
              tag.toLowerCase().includes(searchTerm)
            );
            
            if (!matchesDescription && !matchesTags) {
              return false;
            }
          }
          
          return true;
        });
      }

      // Ordenar: mais recentes primeiro (por data desc; se igual, por created_at desc)
      setTransactions(filteredTransactions.sort((a, b) => {
        const dateA = a.data ? new Date(a.data).getTime() : 0;
        const dateB = b.data ? new Date(b.data).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return createdB - createdA;
      }));
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);
  const saveTransactions = useCallback((newTransactions: Transacao[]) => {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions))
    } catch (err) {
      console.error('Erro ao salvar transações:', err)
      throttledErrorToast('Erro ao salvar transações', 'transaction-save-error')
    }
  }, [])

  const createTransaction = async (transacao: Omit<Transacao, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🆕 createTransaction chamado com:', transacao)
    try {
      const newTransaction: Transacao = {
        ...transacao,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('🆕 Nova transação criada:', newTransaction)

      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)
      const allTransactions: Transacao[] = stored ? JSON.parse(stored) : []
      
      console.log('🆕 Transações existentes:', allTransactions.length)
      
      allTransactions.push(newTransaction)
      saveTransactions(allTransactions)
      
      console.log('🆕 Transação salva no localStorage')
      
      // Recarregar transações para aplicar filtros
      loadTransactions()
      
      console.log('🆕 Transações recarregadas')
      
      return { data: newTransaction, error: null }
    } catch (err) {
      const errorMessage = 'Erro ao criar transação'
      console.error('❌ Erro ao criar transação:', err)
      throttledErrorToast(errorMessage, 'transaction-create-error')
      return { data: null, error: errorMessage }
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transacao>) => {
    try {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)
      const allTransactions: Transacao[] = stored ? JSON.parse(stored) : []
      
      const transactionIndex = allTransactions.findIndex(t => t.id === id)
      if (transactionIndex === -1) {
        throw new Error('Transação não encontrada')
      }

      const updatedTransaction = {
        ...allTransactions[transactionIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      allTransactions[transactionIndex] = updatedTransaction
      saveTransactions(allTransactions)
      
      // Recarregar transações para aplicar filtros
      loadTransactions()
      
      return { data: updatedTransaction, error: null }
    } catch (err) {
      const errorMessage = 'Erro ao atualizar transação'
      throttledErrorToast(errorMessage, 'transaction-update-error')
      console.error('Erro ao atualizar transação:', err)
      return { data: null, error: errorMessage }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)
      const allTransactions: Transacao[] = stored ? JSON.parse(stored) : []
      
      const filteredTransactions = allTransactions.filter(t => t.id !== id)
      saveTransactions(filteredTransactions)
      
      // Recarregar transações para aplicar filtros
      loadTransactions()
      
      throttledSuccessToast('Transação removida com sucesso!', 'transaction-delete-success')
      return { error: null }
    } catch (err) {
      const errorMessage = 'Erro ao remover transação'
      throttledErrorToast(errorMessage, 'transaction-delete-error')
      console.error('Erro ao remover transação:', err)
      return { error: errorMessage }
    }
  }

  const getTransactionById = (id: string) => {
    return transactions.find(t => t.id === id)
  }

  const getTransactionsByType = (tipo: 'RECEITA' | 'DESPESA') => {
    return transactions.filter(t => t.tipo === tipo)
  }

  const getTotalByType = (tipo: 'RECEITA' | 'DESPESA') => {
    return transactions
      .filter(t => t.tipo === tipo)
      .reduce((total, t) => total + (t.valor || 0), 0)
  }

  const getBalance = () => {
    const receitas = getTotalByType('RECEITA')
    const despesas = getTotalByType('DESPESA')
    return receitas - despesas
  }

  const getTransactionsByCategory = (categoria_id: string) => {
    return transactions.filter(trans => trans.categoria_id === categoria_id)
  }

  const getTransactionsByDateRange = (startDate: string, endDate: string) => {
    return transactions.filter(trans => 
      trans.data >= startDate && trans.data <= endDate
    )
  }



  // Carregar transações na inicialização
  useEffect(() => {
    loadTransactions()
  }, [])

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getTransactionsByType,
    getTotalByType,
    getBalance,
    getTransactionsByCategory,
    getTransactionsByDateRange,
    refetch: loadTransactions
  }
}