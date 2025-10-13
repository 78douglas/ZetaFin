import { useState, useEffect, useCallback } from 'react'
import { APP_CONFIG } from '../lib/config'
import { toast } from 'sonner'

export interface Categoria {
  id: string
  nome: string
  tipo_padrao: 'RECEITA' | 'DESPESA' | 'AMBOS'
  cor: string
  icone?: string
  ativa: boolean
  created_at?: string
  updated_at?: string
}

export const useCategoriesLocal = () => {
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initializeCategories = useCallback(() => {
    console.log('🏷️ DEBUG: Inicializando categorias')
    const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
    console.log('🏷️ DEBUG: Categorias no localStorage:', stored ? 'encontradas' : 'não encontradas')
    if (!stored) {
      // Inicializar com categorias padrão
      console.log('🏷️ DEBUG: Criando categorias padrão:', APP_CONFIG.DEFAULT_CATEGORIES.length)
      const defaultCategories = APP_CONFIG.DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories))
      console.log('🏷️ DEBUG: Categorias padrão salvas no localStorage')
      return defaultCategories
    }
    const parsed = JSON.parse(stored)
    console.log('🏷️ DEBUG: Categorias carregadas do localStorage:', parsed.length)
    return parsed
  }, [])

  const loadCategories = useCallback(() => {
    try {
      console.log('🏷️ DEBUG: Carregando categorias')
      setLoading(true)
      setError(null)

      const categories = initializeCategories()
      console.log('🏷️ DEBUG: Categorias inicializadas:', categories.length)
      const activeCategories = categories
        .filter((cat: Categoria) => cat.ativa)
        .sort((a: Categoria, b: Categoria) => a.nome.localeCompare(b.nome))

      console.log('🏷️ DEBUG: Categorias ativas:', activeCategories.length)
      setCategories(activeCategories)
      console.log('🏷️ DEBUG: Estado de categorias atualizado')
    } catch (err) {
      const errorMessage = 'Erro ao carregar categorias do localStorage'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Erro ao carregar categorias:', err)
    } finally {
      setLoading(false)
    }
  }, [initializeCategories])

  const saveCategories = useCallback((newCategories: Categoria[]) => {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories))
    } catch (err) {
      console.error('Erro ao salvar categorias:', err)
      toast.error('Erro ao salvar categorias')
    }
  }, [])

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
      const newCategory: Categoria = {
        ...categoria,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      const allCategories: Categoria[] = stored ? JSON.parse(stored) : []
      
      allCategories.push(newCategory)
      saveCategories(allCategories)
      
      // Atualizar estado local se a categoria está ativa
      if (newCategory.ativa) {
        setCategories(prev => [...prev, newCategory].sort((a, b) => a.nome.localeCompare(b.nome)))
      }
      
      toast.success('Categoria criada com sucesso!')
      return { data: newCategory, error: null }
    } catch (err) {
      const errorMessage = 'Erro ao criar categoria'
      toast.error(errorMessage)
      console.error('Erro ao criar categoria:', err)
      return { data: null, error: errorMessage }
    }
  }

  const updateCategory = async (id: string, updates: Partial<Categoria>) => {
    try {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      const allCategories: Categoria[] = stored ? JSON.parse(stored) : []
      
      const categoryIndex = allCategories.findIndex(cat => cat.id === id)
      if (categoryIndex === -1) {
        throw new Error('Categoria não encontrada')
      }

      const updatedCategory = {
        ...allCategories[categoryIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      allCategories[categoryIndex] = updatedCategory
      saveCategories(allCategories)
      
      // Atualizar estado local
      if (updatedCategory.ativa) {
        setCategories(prev => {
          const filtered = prev.filter(c => c.id !== id)
          return [...filtered, updatedCategory].sort((a, b) => a.nome.localeCompare(b.nome))
        })
      } else {
        setCategories(prev => prev.filter(c => c.id !== id))
      }
      
      toast.success('Categoria atualizada com sucesso!')
      return { data: updatedCategory, error: null }
    } catch (err) {
      const errorMessage = 'Erro ao atualizar categoria'
      toast.error(errorMessage)
      console.error('Erro ao atualizar categoria:', err)
      return { data: null, error: errorMessage }
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      const allCategories: Categoria[] = stored ? JSON.parse(stored) : []
      
      const filteredCategories = allCategories.filter(cat => cat.id !== id)
      saveCategories(filteredCategories)
      
      // Atualizar estado local
      setCategories(prev => prev.filter(c => c.id !== id))
      
      toast.success('Categoria removida com sucesso!')
      return { error: null }
    } catch (err) {
      const errorMessage = 'Erro ao remover categoria'
      toast.error(errorMessage)
      console.error('Erro ao remover categoria:', err)
      return { error: errorMessage }
    }
  }

  // Carregar categorias apenas uma vez na inicialização
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      let categories: Categoria[]
      
      if (!stored) {
        // Inicializar com categorias padrão
        const defaultCategories = APP_CONFIG.DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories))
        categories = defaultCategories
      } else {
        categories = JSON.parse(stored)
      }

      const activeCategories = categories
        .filter((cat: Categoria) => cat.ativa)
        .sort((a: Categoria, b: Categoria) => a.nome.localeCompare(b.nome))

      setCategories(activeCategories)
    } catch (err) {
      const errorMessage = 'Erro ao carregar categorias do localStorage'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Erro ao carregar categorias:', err)
    } finally {
      setLoading(false)
    }
  }, []) // Array vazio para executar apenas uma vez

  return {
    categories,
    loading,
    error,
    getCategoriesByType,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: loadCategories
  }
}