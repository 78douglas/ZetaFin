import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Goal, GoalInsert, GoalUpdate, GoalWithCategory } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export const useGoalsSupabase = () => {
  const { user } = useAuth()
  const [goals, setGoals] = useState<GoalWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar metas do usuário
  const loadGoals = async (filters?: {
    status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
    categoryId?: string
  }) => {
    if (!user) {
      setGoals([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('goals')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao carregar metas:', error)
        setError('Erro ao carregar metas')
        toast.error('Erro ao carregar metas')
        return
      }

      setGoals(data || [])
    } catch (error) {
      console.error('Erro inesperado ao carregar metas:', error)
      setError('Erro inesperado ao carregar metas')
      toast.error('Erro inesperado ao carregar metas')
    } finally {
      setLoading(false)
    }
  }

  // Adicionar nova meta
  const addGoal = async (goalData: Omit<GoalInsert, 'user_id'>) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user.id,
          current_amount: 0,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          category:categories(*)
        `)
        .single()

      if (error) {
        console.error('Erro ao adicionar meta:', error)
        toast.error('Erro ao adicionar meta')
        return null
      }

      setGoals(prev => [data, ...prev])
      toast.success('Meta adicionada com sucesso!')
      return data
    } catch (error) {
      console.error('Erro inesperado ao adicionar meta:', error)
      toast.error('Erro inesperado ao adicionar meta')
      return null
    }
  }

  // Atualizar meta
  const updateGoal = async (id: string, updates: GoalUpdate) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          category:categories(*)
        `)
        .single()

      if (error) {
        console.error('Erro ao atualizar meta:', error)
        toast.error('Erro ao atualizar meta')
        return null
      }

      setGoals(prev => 
        prev.map(goal => goal.id === id ? data : goal)
      )
      toast.success('Meta atualizada com sucesso!')
      return data
    } catch (error) {
      console.error('Erro inesperado ao atualizar meta:', error)
      toast.error('Erro inesperado ao atualizar meta')
      return null
    }
  }

  // Excluir meta
  const deleteGoal = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return false
    }

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao excluir meta:', error)
        toast.error('Erro ao excluir meta')
        return false
      }

      setGoals(prev => prev.filter(goal => goal.id !== id))
      toast.success('Meta excluída com sucesso!')
      return true
    } catch (error) {
      console.error('Erro inesperado ao excluir meta:', error)
      toast.error('Erro inesperado ao excluir meta')
      return false
    }
  }

  // Atualizar progresso da meta
  const updateGoalProgress = async (goalId: string, amount: number) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return false
    }

    try {
      // Buscar meta atual
      const { data: currentGoal, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !currentGoal) {
        console.error('Erro ao buscar meta:', fetchError)
        toast.error('Meta não encontrada')
        return false
      }

      const newCurrentAmount = currentGoal.current_amount + amount
      const isCompleted = newCurrentAmount >= currentGoal.target_amount

      // Atualizar meta
      const { data, error } = await supabase
        .from('goals')
        .update({
          current_amount: newCurrentAmount,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select(`
          *,
          category:categories(*)
        `)
        .single()

      if (error) {
        console.error('Erro ao atualizar progresso da meta:', error)
        toast.error('Erro ao atualizar progresso da meta')
        return false
      }

      setGoals(prev => 
        prev.map(goal => goal.id === goalId ? data : goal)
      )

      if (isCompleted) {
        toast.success('🎉 Parabéns! Meta concluída!')
      } else {
        toast.success('Progresso da meta atualizado!')
      }

      return true
    } catch (error) {
      console.error('Erro inesperado ao atualizar progresso da meta:', error)
      toast.error('Erro inesperado ao atualizar progresso da meta')
      return false
    }
  }

  // Obter meta por ID
  const getGoalById = async (id: string) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Erro ao buscar meta:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro inesperado ao buscar meta:', error)
      return null
    }
  }

  // Obter metas ativas
  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'ACTIVE')
  }

  // Obter metas concluídas
  const getCompletedGoals = () => {
    return goals.filter(goal => goal.status === 'COMPLETED')
  }

  // Obter metas por categoria
  const getGoalsByCategory = (categoryId: string) => {
    return goals.filter(goal => goal.category_id === categoryId)
  }

  // Calcular progresso total das metas
  const getTotalProgress = () => {
    const activeGoals = getActiveGoals()
    if (activeGoals.length === 0) return 0

    const totalProgress = activeGoals.reduce((sum, goal) => {
      const progress = (goal.current_amount / goal.target_amount) * 100
      return sum + Math.min(progress, 100)
    }, 0)

    return totalProgress / activeGoals.length
  }

  // Obter estatísticas das metas
  const getGoalsStats = () => {
    const activeGoals = getActiveGoals()
    const completedGoals = getCompletedGoals()
    
    const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
    const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.current_amount, 0)
    
    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress: totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
    }
  }

  useEffect(() => {
    loadGoals()
  }, [user])

  // Escutar mudanças em tempo real
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadGoals()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    getGoalById,
    getActiveGoals,
    getCompletedGoals,
    getGoalsByCategory,
    getTotalProgress,
    getGoalsStats,
    refreshGoals: loadGoals,
    loadGoals
  }
}