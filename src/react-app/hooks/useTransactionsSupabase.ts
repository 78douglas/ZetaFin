import { useState, useEffect } from 'react'
import { supabase, Transaction, NewTransaction, UpdateTransaction, TransactionWithCategory } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { throttledErrorToast } from '../lib/notificationThrottle'
import { USE_SUPABASE } from '../lib/config'

export const useTransactionsSupabase = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)



  // Carregar transações
  const loadTransactions = async () => {
    if (!USE_SUPABASE) {
      console.log('🔍 DEBUG useTransactionsSupabase: Supabase desabilitado')
      setTransactions([])
      setLoading(false)
      return
    }
    
    if (!user) {
      console.log('🔍 DEBUG useTransactionsSupabase: Usuário não logado')
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 DEBUG useTransactionsSupabase: Carregando transações para usuário:', user.id)
      console.log('🔍 DEBUG useTransactionsSupabase: Supabase URL:', supabase.supabaseUrl)

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*),
          tags
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })

      console.log('🔍 DEBUG useTransactionsSupabase: Resposta do Supabase:', { data, error: fetchError })

      if (fetchError) {
        throw fetchError
      }

      setTransactions(data || [])
      console.log('🔍 DEBUG useTransactionsSupabase: Transações carregadas:', data?.length || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transações'
      setError(errorMessage)
      console.error('Erro ao carregar transações:', err)
      throttledErrorToast(errorMessage, 'transacoes-load-error')
    } finally {
      setLoading(false)
    }
  }

  // Adicionar transação
  const addTransaction = async (transactionData: Omit<NewTransaction, 'user_id'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id
        }])
        .select(`
          *,
          category:categories(*),
          tags
        `)

      if (error) {
        throw error
      }

      const row = Array.isArray(data) ? data[0] : (data as any)
      setTransactions(prev => [row, ...prev])
      return { data: row, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar transação'
      console.error('Erro ao adicionar transação:', err)
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Atualizar transação
  const updateTransaction = async (id: string, transactionData: UpdateTransaction) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', id)
        .eq('user_id', user.id)
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
        prev.map(transaction => 
          transaction.id === id ? data : transaction
        )
      )
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar transação'
      console.error('Erro ao atualizar transação:', err)
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Deletar transação
  const deleteTransaction = async (id: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setTransactions(prev => prev.filter(transaction => transaction.id !== id))
      toast.success('Transação deletada com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar transação'
      console.error('Erro ao deletar transação:', err)
      toast.error(errorMessage)
      throw err
    }
  }

  // Obter transação por ID
  const getTransactionById = (id: string): TransactionWithCategory | undefined => {
    return transactions.find(transaction => transaction.id === id)
  }

  // Filtrar transações por período
  const getTransactionsByPeriod = (startDate: string, endDate: string): TransactionWithCategory[] => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return transactionDate >= start && transactionDate <= end
    })
  }

  // Filtrar transações por categoria
  const getTransactionsByCategory = (categoryId: string): TransactionWithCategory[] => {
    return transactions.filter(transaction => transaction.category_id === categoryId)
  }

  // Calcular total por tipo
  const getTotalByType = (type: 'RECEITA' | 'DESPESA', startDate?: string, endDate?: string): number => {
    let filteredTransactions = transactions.filter(transaction => transaction.type === type)
    
    if (startDate && endDate) {
      filteredTransactions = getTransactionsByPeriod(startDate, endDate).filter(transaction => transaction.type === type)
    }
    
    return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0)
  }

  // Carregar transações quando o usuário mudar
  useEffect(() => {
    loadTransactions()
  }, [user])

  // Configurar real-time subscription
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Recarregar transações quando houver mudanças
          loadTransactions()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getTransactionsByPeriod,
    getTransactionsByCategory,
    getTotalByType,
    loadTransactions
  }
}