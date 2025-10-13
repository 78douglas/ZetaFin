import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useCategories } from './useCategories'
import { useAuth } from '../contexts/AuthContext'

export interface EstatisticasFinanceiras {
  saldoTotal: number
  totalReceitas: number
  totalDespesas: number
  transacoesCount: number
}

export interface FiltroTransacao {
  categoria?: string
  tipo?: 'RECEITA' | 'DESPESA'
  busca?: string
  dataInicio?: string
  dataFim?: string
  limit?: number
}

export function useFinanceDataSupabase(filtros: FiltroTransacao = {}) {
  const { user } = useAuth()
  
  // Aplicar limite padrão para evitar sobrecarga
  const filtrosComLimite = {
    ...filtros,
    limit: filtros.limit || 100 // Limite padrão de 100 transações
  }
  
  const { 
    transactions: transacoes, 
    loading: loadingTransactions, 
    error: errorTransactions,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions(filtrosComLimite)
  
  const { 
    categories: categorias, 
    loading: loadingCategories,
    getCategoryById: obterCategoria
  } = useCategories()

  const loading = loadingTransactions || loadingCategories

  // Calcular estatísticas apenas com as transações carregadas
  const estatisticas = useMemo<EstatisticasFinanceiras>(() => {
    if (!transacoes || transacoes.length === 0) {
      return {
        saldoTotal: 0,
        totalReceitas: 0,
        totalDespesas: 0,
        transacoesCount: 0
      }
    }

    const receitas = transacoes
      .filter(t => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + t.valor, 0)

    const despesas = transacoes
      .filter(t => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + t.valor, 0)

    return {
      saldoTotal: receitas - despesas,
      totalReceitas: receitas,
      totalDespesas: despesas,
      transacoesCount: transacoes.length
    }
  }, [transacoes])

  // Função para carregar mais transações se necessário
  const carregarMaisTransacoes = useCallback(async (novoLimite: number) => {
    if (user) {
      const novosFiltros = {
        ...filtrosComLimite,
        limit: novoLimite
      }
      await fetchTransactions()
    }
  }, [user, filtrosComLimite, fetchTransactions])

  // Função para recarregar dados com limite padrão
  const recarregarDados = useCallback(async () => {
    if (user) {
      await fetchTransactions()
    }
  }, [user, fetchTransactions])

  return {
    // Dados
    transacoes: transacoes || [],
    categorias: categorias || [],
    estatisticas,
    
    // Estados
    loading,
    error: errorTransactions,
    
    // Funções
    obterCategoria,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    carregarMaisTransacoes,
    recarregarDados,
    
    // Informações sobre paginação
    temMaisTransacoes: transacoes?.length === filtrosComLimite.limit,
    limitAtual: filtrosComLimite.limit
  }
}