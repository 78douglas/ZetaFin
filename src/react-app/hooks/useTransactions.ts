import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { Transaction } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  category_id?: string
  type?: 'RECEITA' | 'DESPESA'
  description?: string
}

export const useTransactions = (filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Memoizar os filtros para evitar re-renderizações desnecessárias
  const memoizedFilters = useMemo(() => filters, [
    filters?.startDate,
    filters?.endDate,
    filters?.categoria_id,
    filters?.tipo,
    filters?.descricao
  ])

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*),
          tags
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(100) // Limitar a 100 transações para evitar sobrecarga

      // Aplicar filtros
      if (memoizedFilters?.startDate) {
        query = query.gte('transaction_date', memoizedFilters.startDate)
      }
      if (memoizedFilters?.endDate) {
        query = query.lte('transaction_date', memoizedFilters.endDate)
      }
      if (memoizedFilters?.category_id) {
        query = query.eq('category_id', memoizedFilters.category_id)
      }
      if (memoizedFilters?.type) {
        query = query.eq('type', memoizedFilters.type)
      }
      if (memoizedFilters?.description) {
        query = query.ilike('description', `%${memoizedFilters.description}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setTransactions(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transações'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Erro ao buscar transações:', err)
    } finally {
      setLoading(false)
    }
  }, [user, memoizedFilters])

  const createTransaction = async (transacao: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return { data: null, error: 'Usuário não autenticado' }
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transacao,
          user_id: user.id
        }])
        .select(`
          *,
          category:categories(*),
          tags
        `)
        .single()

      if (error) {
        throw error
      }

      setTransactions(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar transação'
      toast.error(errorMessage)
      console.error('Erro ao criar transação:', err)
      return { data: null, error: errorMessage }
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          category:categories(*),
          tags
        `)
        .single()

      if (error) {
        throw error
      }

      setTransactions(prev => 
        prev.map(trans => trans.id === id ? data : trans)
      )
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar transação'
      toast.error(errorMessage)
      console.error('Erro ao atualizar transação:', err)
      return { data: null, error: errorMessage }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) {
        throw error
      }

      setTransactions(prev => prev.filter(trans => trans.id !== id))
      toast.success('Transação removida com sucesso!')
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover transação'
      toast.error(errorMessage)
      console.error('Erro ao remover transação:', err)
      return { error: errorMessage }
    }
  }

  const getTransactionById = (id: string) => {
    return transactions.find(trans => trans.id === id)
  }

  const getTransactionsByType = (tipo: 'RECEITA' | 'DESPESA') => {
    return transactions.filter(trans => trans.tipo === tipo)
  }

  const getTotalByType = (tipo: 'RECEITA' | 'DESPESA') => {
    return transactions
      .filter(trans => trans.tipo === tipo)
      .reduce((total, trans) => total + trans.valor, 0)
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

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

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
    refetch: fetchTransactions
  }
}