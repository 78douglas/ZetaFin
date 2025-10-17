import { useFinanceDataSupabase } from './useFinanceDataSupabase'
import { useFinanceDataLocal } from './useFinanceDataLocal'
import { useAuth } from '../contexts/AuthContext'
import { useCategories } from './useCategories'
import { useCategoriesLocal } from './useCategoriesLocal'
import { useCategoriesSupabase } from './useCategoriesSupabase'
import { useTransactions } from './useTransactions'
import { useTransactionsLocal } from './useTransactionsLocal'

import { USE_SUPABASE } from '../lib/config'
import { useMemo, useCallback, useRef, useEffect } from 'react'
import { getDefaultCategories } from '../data/defaultCategories'

export const useFinanceDataHybrid = (options?: any) => {
  const { user } = useAuth()

  // Flags de controle anti-loop
  const executingRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastResultRef = useRef<any>(null)

  // Estabilizar a verificação do usuário para evitar re-renders
  const userId = useMemo(() => user?.id, [user?.id])
  const isUserLoggedIn = useMemo(() => !!user, [user])
  
  // Determinar qual fonte de dados usar - memoizar para estabilidade
  // IMPORTANTE: Só usar Supabase se USE_SUPABASE estiver habilitado E o usuário estiver logado
  const useSupabase = useMemo(() => USE_SUPABASE && isUserLoggedIn, [isUserLoggedIn])
  
  console.log('🔄 useFinanceDataHybrid: USE_SUPABASE =', USE_SUPABASE, 'isUserLoggedIn =', isUserLoggedIn, 'useSupabase =', useSupabase)

  // Condicionalmente chamar hooks baseado na configuração
  const supabaseData = useFinanceDataSupabase()
  const localData = useFinanceDataLocal(options)
  
  // Escolher qual dados usar baseado na configuração
  const activeData = useSupabase ? supabaseData : localData

  // Memoizar arrays para evitar re-criações desnecessárias
  const activeTransactions = useMemo(() => activeData.transacoes || [], [activeData.transacoes])

  // Simplificar para evitar loops infinitos
  const combinedData = {
    ...activeData,
    transacoes: activeTransactions,
    // CORREÇÃO: Sempre usar categorias padrão quando não logado
    categorias: useSupabase ? activeData.categorias : getDefaultCategories(),
    loading: activeData.loading,
    error: activeData.error,
    // Garantir que as funções essenciais estejam disponíveis
    obterTransacao: activeData.obterTransacao,
    obterCategoria: activeData.obterCategoria,
    // Funções de criação e edição
    criarTransacao: activeData.adicionarTransacao || activeData.createTransaction,
    atualizarTransacao: activeData.editarTransacao || activeData.updateTransaction,
    // Aliases para compatibilidade
    adicionarTransacao: activeData.adicionarTransacao || activeData.createTransaction,
    editarTransacao: activeData.editarTransacao || activeData.updateTransaction
  }

  console.log('🔧 useFinanceDataHybrid - Funções mapeadas:', {
    hasAdicionarTransacao: !!(activeData.adicionarTransacao || activeData.createTransaction),
    hasEditarTransacao: !!(activeData.editarTransacao || activeData.updateTransaction),
    activeDataKeys: Object.keys(activeData),
    useSupabase: USE_SUPABASE,
    isLoggedIn: !!user
  });

  // Cleanup do debounce
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return combinedData
}

// Exportar também hooks individuais híbridos
export const useTransactionsHybrid = (filters?: any) => {
  const { user } = useAuth()
  
  // Flags de controle anti-loop
  const executingRef = useRef(false)
  
  // Estabilizar a verificação do usuário
  const isUserLoggedIn = useMemo(() => !!user, [user])
  const useSupabase = useMemo(() => USE_SUPABASE && isUserLoggedIn, [isUserLoggedIn])
  
  // Evitar execuções múltiplas
  if (executingRef.current) {
    return { transacoes: [], loading: true, error: null, addTransaction: () => {}, updateTransaction: () => {}, deleteTransaction: () => {} }
  }
  
  // executingRef.current = true
  
  // Usar Supabase se o usuário estiver logado e USE_SUPABASE estiver ativo
  const result = useSupabase ? useTransactions(filters) : useTransactionsLocal(filters)
  
  // executingRef.current = false
  
  return result
}

export const useCategoriesHybrid = () => {
  const { user } = useAuth()
  
  // Flags de controle anti-loop
  const executingRef = useRef(false)
  
  // Estabilizar a verificação do usuário
  const isUserLoggedIn = useMemo(() => !!user, [user])
  const useSupabase = useMemo(() => USE_SUPABASE && isUserLoggedIn, [isUserLoggedIn])
  
  // Evitar execuções múltiplas
  if (executingRef.current) {
    return { categorias: [], loading: true, error: null, addCategory: () => {}, updateCategory: () => {}, deleteCategory: () => {} }
  }
  
  // executingRef.current = true
  
  // CORREÇÃO: Sempre usar categorias padrão quando não logado
  if (!useSupabase) {
    return {
      categorias: getDefaultCategories(),
      loading: false,
      error: null,
      addCategory: () => {},
      updateCategory: () => {},
      deleteCategory: () => {}
    }
  }
  
  // Usar Supabase se o usuário estiver logado e USE_SUPABASE estiver ativo
  const result = useCategories()
  
  // executingRef.current = false
  
  return result
}
