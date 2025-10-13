import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { Transacao } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  categoria_id?: string
  tipo?: 'RECEITA' | 'DESPESA'
  descricao?: string
}

export const useTransactions = (filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transacao[]>([])
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
        .from('transacoes')
        .select(`
          *,
          categoria:categorias(*)
        `)
        .eq('usuario_id', user.id)
        .order('data', { ascending: false })
        .limit(100) // Limitar a 100 transações para evitar sobrecarga

      // Aplicar filtros
      if (memoizedFilters?.startDate) {
        query = query.gte('data', memoizedFilters.startDate)
      }
      if (memoizedFilters?.endDate) {
        query = query.lte('data', memoizedFilters.endDate)
      }
      if (memoizedFilters?.categoria_id) {
        query = query.eq('categoria_id', memoizedFilters.categoria_id)
      }
      if (memoizedFilters?.tipo) {
        query = query.eq('tipo', memoizedFilters.tipo)
      }
      if (memoizedFilters?.descricao) {
        query = query.ilike('descricao', `%${memoizedFilters.descricao}%`)
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

  const createTransaction = async (transacao: Omit<Transacao, 'id' | 'created_at' | 'updated_at' | 'usuario_id'>) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return { data: null, error: 'Usuário não autenticado' }
    }

    try {
      const { data, error } = await supabase
        .from('transacoes')
        .insert([{
          ...transacao,
          usuario_id: user.id
        }])
        .select(`
          *,
          categoria:categorias(*)
        `)
        .single()

      if (error) {
        throw error
      }

      setTransactions(prev => [data, ...prev])
      toast.success('Transação criada com sucesso!')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar transação'
      toast.error(errorMessage)
      console.error('Erro ao criar transação:', err)
      return { data: null, error: errorMessage }
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Omit<Transacao, 'id' | 'created_at' | 'updated_at' | 'usuario_id'>>) => {
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .update(updates)
        .eq('id', id)
        .eq('usuario_id', user?.id)
        .select(`
          *,
          categoria:categorias(*)
        `)
        .single()

      if (error) {
        throw error
      }

      setTransactions(prev => 
        prev.map(trans => trans.id === id ? data : trans)
      )
      toast.success('Transação atualizada com sucesso!')
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
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user?.id)

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