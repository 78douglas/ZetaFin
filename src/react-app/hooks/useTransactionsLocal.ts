import { useState, useEffect, useCallback, useMemo } from 'react'
import { APP_CONFIG } from '../lib/config'
import { toast } from 'sonner'

export interface Transacao {
  id: string
  descricao: string
  valor: number
  data: string
  tipo: 'RECEITA' | 'DESPESA'
  categoria_id: string
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
  console.log('🚀 DEBUG: useTransactionsLocal iniciado com filtros:', filters)
  const [transactions, setTransactions] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoizar os filtros para evitar re-renderizações desnecessárias
  const memoizedFilters = useMemo(() => filters, [
    filters?.startDate,
    filters?.endDate,
    filters?.categoria_id,
    filters?.tipo,
    filters?.descricao
  ])

  const loadTransactions = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      
      const storageKey = APP_CONFIG.STORAGE_KEYS.TRANSACTIONS
      const stored = localStorage.getItem(storageKey)
      
      let allTransactions: Transacao[] = []
      
      if (stored) {
        try {
          allTransactions = JSON.parse(stored)
          // Garantir que é um array válido
          if (!Array.isArray(allTransactions)) {
            allTransactions = []
          }
          
          // Validar e corrigir dados das transações
          allTransactions = allTransactions.map(transaction => ({
            ...transaction,
            valor: Number(transaction.valor) || 0 // Garantir que valor seja um número
          })).filter(transaction => 
            transaction.id && 
            transaction.descricao && 
            transaction.data && 
            transaction.tipo && 
            transaction.categoria_id
          )
        } catch (parseError) {
          console.error('Erro ao parsear transações do localStorage:', parseError)
          allTransactions = []
        }
      }
      
      // Aplicar filtros se fornecidos
      let filteredTransactions = allTransactions
      
      if (memoizedFilters) {
        filteredTransactions = allTransactions.filter(transaction => {
          // Filtro por data de início
          if (memoizedFilters.startDate && transaction.data < memoizedFilters.startDate) {
            return false
          }
          
          // Filtro por data de fim
          if (memoizedFilters.endDate && transaction.data > memoizedFilters.endDate) {
            return false
          }
          
          // Filtro por categoria
          if (memoizedFilters.categoria_id && transaction.categoria_id !== memoizedFilters.categoria_id) {
            return false
          }
          
          // Filtro por tipo
          if (memoizedFilters.tipo && transaction.tipo !== memoizedFilters.tipo) {
            return false
          }
          
          // Filtro por descrição
          if (memoizedFilters.descricao && !transaction.descricao.toLowerCase().includes(memoizedFilters.descricao.toLowerCase())) {
            return false
          }
          
          return true
        })
      }
      
      setTransactions(filteredTransactions)
      setLoading(false)
      
      console.log(`✅ Carregadas ${filteredTransactions.length} transações (${allTransactions.length} total)`)
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      setError('Erro ao carregar transações')
      setLoading(false)
    }
  }, [memoizedFilters])

  const saveTransactions = useCallback((newTransactions: Transacao[]) => {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions))
    } catch (err) {
      console.error('Erro ao salvar transações:', err)
      toast.error('Erro ao salvar transações')
    }
  }, [])

  const createTransaction = async (transacao: Omit<Transacao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTransaction: Transacao = {
        ...transacao,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TRANSACTIONS)
      const allTransactions: Transacao[] = stored ? JSON.parse(stored) : []
      
      allTransactions.push(newTransaction)
      saveTransactions(allTransactions)
      
      // Recarregar transações para aplicar filtros
      loadTransactions()
      
      toast.success('Transação criada com sucesso!')
      return { data: newTransaction, error: null }
    } catch (err) {
      const errorMessage = 'Erro ao criar transação'
      toast.error(errorMessage)
      console.error('Erro ao criar transação:', err)
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
      
      toast.success('Transação atualizada com sucesso!')
      return { data: updatedTransaction, error: null }
    } catch (err) {
      const errorMessage = 'Erro ao atualizar transação'
      toast.error(errorMessage)
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
      
      toast.success('Transação removida com sucesso!')
      return { error: null }
    } catch (err) {
      const errorMessage = 'Erro ao remover transação'
      toast.error(errorMessage)
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
  }, [loadTransactions])

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