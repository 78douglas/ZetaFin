import { USE_SUPABASE } from '../lib/config'
import { useFinanceDataSupabase } from './useFinanceDataSupabase'
import { useFinanceDataLocal } from './useFinanceDataLocal'
import { useCategories } from './useCategories'
import { useCategoriesLocal } from './useCategoriesLocal'
import { useTransactions } from './useTransactions'
import { useTransactionsLocal } from './useTransactionsLocal'

interface FinanceDataOptions {
  limit?: number
  filters?: any
}

export const useFinanceDataHybrid = (options: FinanceDataOptions = {}) => {
  if (USE_SUPABASE) {
    return useFinanceDataSupabase(options)
  } else {
    return useFinanceDataLocal(options)
  }
}

// Exportar também hooks individuais híbridos
export const useTransactionsHybrid = (filters?: any) => {
  if (USE_SUPABASE) {
    return useTransactions(filters)
  } else {
    return useTransactionsLocal(filters)
  }
}

export const useCategoriesHybrid = () => {
  if (USE_SUPABASE) {
    return useCategories()
  } else {
    return useCategoriesLocal()
  }
}