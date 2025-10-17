import { useState, useEffect, useMemo } from 'react'
import { supabase, Category, NewCategory, UpdateCategory } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { DEFAULT_CATEGORIES, getDefaultCategories, isDefaultCategory } from '../data/defaultCategories'
import { throttledErrorToast } from '../lib/notificationThrottle'
import { USE_SUPABASE } from '../lib/config'

export const useCategoriesSupabase = () => {
  const { user } = useAuth()
  const [customCategories, setCustomCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)



  // Combinar categorias padrão com personalizadas
  const allCategories = useMemo(() => {
    const defaultCategories = getDefaultCategories()
    const combined = [...defaultCategories, ...customCategories]
    return combined
  }, [customCategories])

  const categories = allCategories

  // Carregar apenas categorias personalizadas do usuário
  const loadCategories = async () => {
    if (!USE_SUPABASE) {
      console.log('🔍 DEBUG useCategoriesSupabase: Supabase desabilitado')
      setCustomCategories([])
      setLoading(false)
      return
    }
    
    if (!user) {
      console.log('🔍 DEBUG useCategoriesSupabase: Usuário não logado')
      setCustomCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 DEBUG useCategoriesSupabase: Carregando categorias personalizadas para usuário:', user.id)

      // Buscar apenas categorias personalizadas (não padrão)
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .neq('is_default', true) // Excluir categorias padrão que possam estar no banco
        .order('name')

      console.log('🔍 DEBUG useCategoriesSupabase: Resposta do Supabase:', { data, error: fetchError })

      if (fetchError) {
        throw fetchError
      }

      setCustomCategories(data || [])
      console.log('🔍 DEBUG useCategoriesSupabase: Categorias personalizadas carregadas:', data?.length || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias'
      setError(errorMessage)
      console.error('Erro ao carregar categorias:', err)
      
      // Usar throttle para evitar spam de notificações
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('ERR_INSUFFICIENT_RESOURCES')) {
        throttledErrorToast(errorMessage, 'categorias-load-error')
      } else {
        console.log('⚠️ Problema de conectividade detectado, usando apenas categorias padrão')
      }
      
      // Garantir que pelo menos as categorias padrão estejam disponíveis
      setCustomCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Criar categoria personalizada
  const createCategory = async (categoryData: Omit<NewCategory, 'user_id'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          user_id: user.id,
          is_default: false // Garantir que categorias criadas pelo usuário não são padrão
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setCustomCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Categoria criada com sucesso!')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria'
      console.error('Erro ao criar categoria:', err)
      toast.error(errorMessage)
      throw err
    }
  }

  // Atualizar categoria (padrão e personalizadas)
  const updateCategory = async (id: string, categoryData: UpdateCategory) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Permitir editar categorias padrão também
    // if (isDefaultCategory(id)) {
    //   throw new Error('Categorias padrão não podem ser editadas')
    // }

    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setCustomCategories(prev => 
        prev.map(category => 
          category.id === id ? data : category
        ).sort((a, b) => a.name.localeCompare(b.name))
      )
      toast.success('Categoria atualizada com sucesso!')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria'
      console.error('Erro ao atualizar categoria:', err)
      toast.error(errorMessage)
      throw err
    }
  }

  // Deletar categoria (apenas personalizadas)
  const deleteCategory = async (id: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Permitir deletar categorias padrão também
    // if (isDefaultCategory(id)) {
    //   throw new Error('Categorias padrão não podem ser deletadas')
    // }

    try {
      // Verificar se há transações usando esta categoria
      const { data: transactions, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .eq('user_id', user.id)
        .limit(1)

      if (checkError) {
        throw checkError
      }

      if (transactions && transactions.length > 0) {
        throw new Error('Não é possível deletar uma categoria que possui transações associadas')
      }

      // Para categorias padrão, não filtrar por user_id
      const deleteQuery = supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      // Só adicionar filtro de user_id se não for categoria padrão
      const { data: categoryToDelete } = await supabase
        .from('categories')
        .select('user_id, is_default')
        .eq('id', id)
        .single()
      
      if (categoryToDelete && !categoryToDelete.is_default) {
        deleteQuery.eq('user_id', user.id)
      }
      
      const { error } = await deleteQuery

      if (error) {
        throw error
      }

      setCustomCategories(prev => prev.filter(category => category.id !== id))
      toast.success('Categoria deletada com sucesso!')
    } catch (err) {
      let errorMessage = 'Erro ao deletar categoria'
      
      if (err instanceof Error) {
        if (err.message.includes('transações associadas')) {
          errorMessage = 'Não é possível excluir esta categoria pois ela possui transações associadas. Exclua as transações primeiro.'
        } else if (err.message.includes('foreign key')) {
          errorMessage = 'Esta categoria está sendo usada em outras partes do sistema e não pode ser excluída.'
        } else if (err.message.includes('permission')) {
          errorMessage = 'Você não tem permissão para excluir esta categoria.'
        } else {
          errorMessage = err.message
        }
      }
      
      console.error('Erro ao deletar categoria:', err)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Obter categoria por ID (padrão ou personalizada)
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(category => category.id === id)
  }

  // Obter apenas categorias padrão
  const getDefaultCategoriesOnly = (): Category[] => {
    return getDefaultCategories()
  }

  // Obter apenas categorias personalizadas
  const getCustomCategories = (): Category[] => {
    return customCategories
  }

  // Carregar categorias quando o usuário mudar
  useEffect(() => {
    loadCategories()
  }, [user])

  // Configurar real-time subscription apenas para categorias personalizadas
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Recarregar categorias quando houver mudanças
          loadCategories()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    categories, // Combinação de padrão + personalizadas
    customCategories, // Apenas personalizadas
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getDefaultCategories: getDefaultCategoriesOnly,
    getCustomCategories,
    loadCategories
  }
}