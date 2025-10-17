import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Category } from '../lib/supabase'
import { toast } from 'sonner'
import { getDefaultCategories, isDefaultCategory } from '../data/defaultCategories'

export const useCategories = () => {
  const [customCategories, setCustomCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Combinar categorias padrão com personalizadas
  const categories = [...getDefaultCategories(), ...customCategories]

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setCustomCategories([])
        return
      }

      // Buscar apenas categorias personalizadas (não padrão)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .neq('is_default', true) // Excluir categorias padrão que possam estar no banco
        .order('name')

      if (error) {
        throw error
      }

      setCustomCategories(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Erro ao buscar categorias:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoriesByType = (tipo: 'RECEITA' | 'DESPESA') => {
    // Na nova estrutura, todas as categorias podem ser usadas para ambos os tipos
    return categories
  }

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id)
  }

  const createCategory = async (categoria: Omit<Category, 'id' | 'created_at' | 'user_id'>) => {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoria,
          user_id: user.id,
          is_default: false // Garantir que categorias criadas pelo usuário não são padrão
        }])
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
      toast.error(errorMessage)
      console.error('Erro ao criar categoria:', err)
      throw err
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      // Verificar se é uma categoria padrão (não pode ser editada)
      if (isDefaultCategory(id)) {
        throw new Error('Categorias padrão não podem ser editadas')
      }

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setCustomCategories(prev => 
        prev.map(cat => cat.id === id ? data : cat).sort((a, b) => a.name.localeCompare(b.name))
      )
      toast.success('Categoria atualizada com sucesso!')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria'
      toast.error(errorMessage)
      console.error('Erro ao atualizar categoria:', err)
      return { data: null, error: errorMessage }
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      // Verificar se é uma categoria padrão (não pode ser deletada)
      if (isDefaultCategory(id)) {
        throw new Error('Categorias padrão não podem ser deletadas')
      }

      // Verificar se há transações usando esta categoria
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Usuário não autenticado')
      }

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

      // Hard delete - remove completamente
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setCustomCategories(prev => prev.filter(cat => cat.id !== id))
      toast.success('Categoria removida com sucesso!')
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover categoria'
      toast.error(errorMessage)
      console.error('Erro ao remover categoria:', err)
      return { error: errorMessage }
    }
  }

  // Obter apenas categorias padrão
  const getDefaultCategoriesOnly = (): Category[] => {
    return getDefaultCategories()
  }

  // Obter apenas categorias personalizadas
  const getCustomCategoriesOnly = (): Category[] => {
    return customCategories
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories, // Combinação de padrão + personalizadas
    customCategories, // Apenas personalizadas
    loading,
    error,
    getCategoriesByType,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getDefaultCategories: getDefaultCategoriesOnly,
    getCustomCategories: getCustomCategoriesOnly,
    refetch: fetchCategories
  }
}