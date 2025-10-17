import { useState, useEffect, useCallback } from 'react'
import { APP_CONFIG } from '../lib/config'
import { throttledErrorToast, throttledSuccessToast } from '../lib/notificationThrottle'
import { getDefaultCategories, isDefaultCategory } from '../data/defaultCategories'
import { Category } from '../lib/supabase'
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

// Interface flexível para criação de categoria
interface CreateCategoryInput {
  name?: string;
  nome?: string;
  type?: 'RECEITA' | 'DESPESA' | 'AMBOS';
  tipo_padrao?: 'RECEITA' | 'DESPESA' | 'AMBOS';
  color?: string;
  cor?: string;
  icon?: string;
  icone?: string;
  ativa?: boolean;
}

export const useCategoriesLocal = () => {
  const [customCategories, setCustomCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Converter categorias padrão para o formato local
  const convertDefaultCategories = (): Categoria[] => {
    return getDefaultCategories().map(cat => ({
      id: cat.id,
      nome: cat.name,
      tipo_padrao: (cat.type as 'RECEITA' | 'DESPESA'),
      cor: cat.color,
      icone: cat.icon,
      ativa: true,
      created_at: cat.created_at,
      updated_at: cat.created_at
    }))
  }

  // Combinar categorias padrão com personalizadas
  const categories = [...convertDefaultCategories(), ...customCategories]

  const initializeCategories = useCallback(() => {
    const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
    
    if (!stored) {
      // Não criar categorias padrão no localStorage, apenas retornar array vazio
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify([]))
      return []
    }
    
    const parsed = JSON.parse(stored)
    // Filtrar apenas categorias personalizadas (não padrão)
    const customOnly = parsed.filter((cat: Categoria) => !isDefaultCategory(cat.id))
    
    // Salvar apenas as personalizadas de volta
    if (customOnly.length !== parsed.length) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(customOnly))
    }
    
    return customOnly
  }, [])

  const loadCategories = useCallback(() => {
    try {
      setLoading(true)
      setError(null)

      const customCats = initializeCategories()
      
      const activeCustomCategories = customCats
        .filter((cat: Categoria) => cat.ativa)
        .sort((a: Categoria, b: Categoria) => a.nome.localeCompare(b.nome))

      setCustomCategories(activeCustomCategories)
    } catch (err) {
      const errorMessage = 'Erro ao carregar categorias do localStorage'
      setError(errorMessage)
      throttledErrorToast(errorMessage, 'categories-load-error')
      console.error('Erro ao carregar categorias:', err)
    } finally {
      setLoading(false)
    }
  }, [initializeCategories])

  const saveCategories = useCallback((newCategories: Categoria[]) => {
    try {
      // Salvar apenas categorias personalizadas
      const customOnly = newCategories.filter(cat => !isDefaultCategory(cat.id))
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(customOnly))
    } catch (err) {
      console.error('Erro ao salvar categorias:', err)
      throttledErrorToast('Erro ao salvar categorias', 'categories-save-error')
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

  const createCategory = useCallback(async (categoryData: CreateCategoryInput): Promise<boolean> => {
    console.log('🔍 [createCategory] Iniciando criação de categoria:', categoryData);
    
    try {
      // Mapear campos flexivelmente
      const mappedCategory: Omit<Categoria, 'id' | 'created_at' | 'updated_at'> = {
        nome: categoryData.nome || categoryData.name || '',
        tipo_padrao: categoryData.tipo_padrao || categoryData.type || 'DESPESA',
        cor: categoryData.cor || categoryData.color || '#3B82F6',
        icone: categoryData.icone || categoryData.icon || '💰',
        ativa: categoryData.ativa !== undefined ? categoryData.ativa : true
      };

      console.log('🔍 [createCategory] Categoria mapeada:', mappedCategory);

      // Validar dados obrigatórios
      if (!mappedCategory.nome || mappedCategory.nome.trim() === '') {
        console.error('❌ [createCategory] Nome da categoria é obrigatório');
        throttledErrorToast('Nome da categoria é obrigatório');
        return false;
      }

      console.log('🔍 [createCategory] Validação passou, gerando ID...');

      // Gerar ID único
      const newId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔍 [createCategory] ID gerado:', newId);

      const newCategory: Categoria = {
        ...mappedCategory,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🔍 [createCategory] Categoria completa criada:', newCategory);

      // Obter categorias existentes do localStorage
      console.log('🔍 [createCategory] Obtendo categorias existentes...');
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES);
      const existingCategories: Categoria[] = stored ? JSON.parse(stored) : [];
      console.log('🔍 [createCategory] Categorias existentes:', existingCategories.length);

      // Verificar se já existe categoria com o mesmo nome
      const duplicateCategory = existingCategories.find(cat => 
        cat.nome.toLowerCase() === newCategory.nome.toLowerCase()
      );
      
      if (duplicateCategory) {
        console.error('❌ [createCategory] Categoria já existe:', duplicateCategory.nome);
        throttledErrorToast('Já existe uma categoria com este nome');
        return false;
      }

      console.log('🔍 [createCategory] Não há duplicatas, adicionando categoria...');

      // Adicionar nova categoria
      const updatedCategories = [...existingCategories, newCategory];
      console.log('🔍 [createCategory] Total de categorias após adição:', updatedCategories.length);

      // Salvar no localStorage
      console.log('🔍 [createCategory] Salvando no localStorage...');
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories));
      console.log('🔍 [createCategory] Salvo no localStorage com sucesso');

      // Atualizar estado local
      console.log('🔍 [createCategory] Atualizando estado local...');
      setCustomCategories(prev => [...prev, newCategory].sort((a, b) => a.nome.localeCompare(b.nome)));
      console.log('🔍 [createCategory] Estado local atualizado');

      // Mostrar toast de sucesso
      console.log('🔍 [createCategory] Mostrando toast de sucesso...');
      throttledSuccessToast(`Categoria "${newCategory.nome}" criada com sucesso!`);
      console.log('✅ [createCategory] Categoria criada com sucesso!');

      return true;
    } catch (error) {
      console.error('❌ [createCategory] Erro detalhado:', error);
      console.error('❌ [createCategory] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('❌ [createCategory] Dados recebidos:', categoryData);
      
      throttledErrorToast('Erro desconhecido ao criar categoria');
      return false;
    }
  }, [throttledErrorToast, throttledSuccessToast]);

  const updateCategory = async (id: string, updates: Partial<Categoria>) => {
    try {
      // Permitir editar categorias padrão também
      // if (isDefaultCategory(id)) {
      //   throw new Error('Categorias padrão não podem ser editadas')
      // }

      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      const allCustomCategories: Categoria[] = stored ? JSON.parse(stored) : []
      
      const categoryIndex = allCustomCategories.findIndex(cat => cat.id === id)
      if (categoryIndex === -1) {
        throw new Error('Categoria não encontrada')
      }

      const updatedCategory = {
        ...allCustomCategories[categoryIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      allCustomCategories[categoryIndex] = updatedCategory
      saveCategories(allCustomCategories)
      
      // Atualizar estado local
      if (updatedCategory.ativa) {
        setCustomCategories(prev => {
          const filtered = prev.filter(c => c.id !== id)
          return [...filtered, updatedCategory].sort((a, b) => a.nome.localeCompare(b.nome))
        })
      } else {
        setCustomCategories(prev => prev.filter(c => c.id !== id))
      }
      
      throttledSuccessToast('Categoria atualizada com sucesso!', 'category-update-success')
      return { data: updatedCategory, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria'
      throttledErrorToast(errorMessage, 'category-update-error')
      console.error('Erro ao atualizar categoria:', err)
      return { data: null, error: errorMessage }
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      // Permitir deletar categorias padrão também
      // if (isDefaultCategory(id)) {
      //   throw new Error('Categorias padrão não podem ser deletadas')
      // }

      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      const allCustomCategories: Categoria[] = stored ? JSON.parse(stored) : []
      
      const filteredCategories = allCustomCategories.filter(cat => cat.id !== id)
      saveCategories(filteredCategories)
      
      // Atualizar estado local
      setCustomCategories(prev => prev.filter(c => c.id !== id))
      
      throttledSuccessToast('Categoria removida com sucesso!', 'category-delete-success')
      return { error: null }
    } catch (err) {
      let errorMessage = 'Erro ao remover categoria'
      
      if (err instanceof Error) {
        if (err.message.includes('transações associadas')) {
          errorMessage = 'Não é possível excluir esta categoria pois ela possui transações associadas. Exclua as transações primeiro.'
        } else {
          errorMessage = err.message
        }
      }
      
      throttledErrorToast(errorMessage, 'category-delete-error')
      console.error('Erro ao remover categoria:', err)
      return { error: errorMessage }
    }
  }

  // Obter apenas categorias padrão
  const getDefaultCategoriesOnly = (): Categoria[] => {
    return convertDefaultCategories()
  }

  // Obter apenas categorias personalizadas
  const getCustomCategoriesOnly = (): Categoria[] => {
    return customCategories
  }

  // Carregar categorias apenas uma vez na inicialização
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)
      let customCats: Categoria[]
      
      if (!stored) {
        // Não inicializar com categorias padrão, apenas array vazio
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify([]))
        customCats = []
      } else {
        const parsed = JSON.parse(stored)
        // Filtrar apenas categorias personalizadas
        customCats = parsed.filter((cat: Categoria) => !isDefaultCategory(cat.id))
        
        // Salvar apenas as personalizadas de volta se houve mudança
        if (customCats.length !== parsed.length) {
          localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(customCats))
        }
      }

      const activeCustomCategories = customCats
        .filter((cat: Categoria) => cat.ativa)
        .sort((a: Categoria, b: Categoria) => a.nome.localeCompare(b.nome))

      setCustomCategories(activeCustomCategories)
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
    refetch: loadCategories
  }
}