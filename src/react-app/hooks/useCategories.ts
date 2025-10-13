import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Categoria } from '../lib/supabase'
import { toast } from 'sonner'

export const useCategories = () => {
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativa', true)
        .order('nome')

      if (error) {
        throw error
      }

      setCategories(data || [])
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
    return categories.filter(cat => 
      cat.tipo_padrao === tipo || cat.tipo_padrao === 'AMBOS'
    )
  }

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id)
  }

  const createCategory = async (categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoria])
        .select()
        .single()

      if (error) {
        throw error
      }

      setCategories(prev => [...prev, data])
      toast.success('Categoria criada com sucesso!')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria'
      toast.error(errorMessage)
      console.error('Erro ao criar categoria:', err)
      return { data: null, error: errorMessage }
    }
  }

  const updateCategory = async (id: string, updates: Partial<Categoria>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setCategories(prev => 
        prev.map(cat => cat.id === id ? data : cat)
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
      // Soft delete - apenas marca como inativa
      const { error } = await supabase
        .from('categorias')
        .update({ ativa: false })
        .eq('id', id)

      if (error) {
        throw error
      }

      setCategories(prev => prev.filter(cat => cat.id !== id))
      toast.success('Categoria removida com sucesso!')
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover categoria'
      toast.error(errorMessage)
      console.error('Erro ao remover categoria:', err)
      return { error: errorMessage }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    getCategoriesByType,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  }
}