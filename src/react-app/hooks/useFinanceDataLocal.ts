import { useMemo, useCallback } from 'react'
import { useTransactionsLocal, TransactionFilters } from './useTransactionsLocal'
import { useCategoriesLocal } from './useCategoriesLocal'

interface FinanceDataOptions {
  limit?: number
  filters?: TransactionFilters
}

export const useFinanceDataLocal = (options?: any) => {
  console.log('🔧 useFinanceDataLocal - INICIANDO');
  
  // Garantir que options tenha valores padrão e memoizar para evitar re-renders
  const safeOptions = useMemo(() => options || {}, [options]);
  
  const transactionMethods = useTransactionsLocal(safeOptions);
  
  console.log('🔧 useFinanceDataLocal - transactionMethods recebidos:', {
    hasCreateTransaction: !!transactionMethods.createTransaction,
    hasUpdateTransaction: !!transactionMethods.updateTransaction,
    keys: Object.keys(transactionMethods)
  });
  
  const { limit = 100, filters } = safeOptions;
  
  const { 
    transactions, 
    loading: transactionsLoading, 
    error: transactionsError,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    refetch
  } = useTransactionsLocal(filters)
  
  console.log('🏠 DEBUG: useTransactionsLocal retornou:', {
    transactionsCount: transactions.length,
    loading: transactionsLoading,
    error: transactionsError
  })
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    getCategoryById,
    updateCategory,
    deleteCategory
  } = useCategoriesLocal()

  const loading = transactionsLoading || categoriesLoading
  const error = transactionsError || categoriesError

  // Função para obter categoria por ID
  const obterCategoria = useCallback((categoriaId: string) => {
    return getCategoryById(categoriaId)
  }, [getCategoryById])

  // Função para filtrar transações (compatibilidade com Transactions.tsx)
  const filtrarTransacoes = useCallback((filtros: any) => {
    return transactions.filter(transacao => {
      // Filtro por categoria
      if (filtros.categoria && transacao.categoria_id !== filtros.categoria) {
        return false
      }

      // Filtro por tipo
      if (filtros.tipo && transacao.tipo !== filtros.tipo) {
        return false
      }

      // Filtro por busca (descrição)
      if (filtros.busca && !transacao.descricao.toLowerCase().includes(filtros.busca.toLowerCase())) {
        return false
      }

      // Filtro por data
      if (filtros.dataInicio && transacao.data < filtros.dataInicio) {
        return false
      }

      if (filtros.dataFim && transacao.data > filtros.dataFim) {
        return false
      }

      return true
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  }, [transactions])

  // Função para excluir transação (compatibilidade)
  const excluirTransacao = useCallback(async (id: string) => {
    return await deleteTransaction(id)
  }, [deleteTransaction])

  // Função para obter transação por ID (compatibilidade com TransactionForm)
  const obterTransacao = useCallback((id: string) => {
    console.log('🔍 obterTransacao chamado com ID:', id);
    console.log('🔍 Transações disponíveis:', transactions.map(t => ({ id: t.id, descricao: t.descricao })));
    
    const transaction = getTransactionById(id);
    console.log('🔍 Transação encontrada:', transaction);
    
    if (!transaction) {
      console.log('❌ Transação não encontrada para ID:', id);
      return undefined;
    }

    // Mapear para o formato esperado pelo TransactionForm
    const categoria = obterCategoria(transaction.categoria_id);

    const result = {
      id: transaction.id,
      descricao: transaction.descricao,
      descricaoAdicional: transaction.descricaoAdicional || '',
      valor: transaction.valor,
      data: transaction.data,
      tipo: transaction.tipo,
      categoria_id: transaction.categoria_id,
      categoria: categoria,
      registradoPor: 'local',
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
      tags: transaction.tags || []
    };
    
    console.log('✅ Retornando transação formatada:', result);
    return result;
  }, [getTransactionById, obterCategoria, transactions])

  // Calcular estatísticas financeiras
  const estatisticas = useMemo(() => {
    console.log('🔄 DEBUG: Calculando estatísticas financeiras')
    console.log('📊 DEBUG: Total de transações:', transactions.length)
    console.log('📊 DEBUG: Transações:', transactions)
    
    // Garantir que os valores sejam números válidos
    const receitas = transactions
      .filter(t => t.tipo === 'RECEITA')
      .reduce((total, t) => {
        const valor = Number(t.valor) || 0
        return total + valor
      }, 0)

    const despesas = transactions
      .filter(t => t.tipo === 'DESPESA')
      .reduce((total, t) => {
        const valor = Number(t.valor) || 0
        return total + valor
      }, 0)

    const saldo = receitas - despesas

    console.log('💰 DEBUG: Total receitas:', receitas)
    console.log('💸 DEBUG: Total despesas:', despesas)
    console.log('💵 DEBUG: Saldo calculado:', saldo)

    // Estatísticas por categoria
    const estatisticasPorCategoria = categories.map(categoria => {
      const transacoesCategoria = transactions.filter(t => t.categoria_id === categoria.id)
      const total = transacoesCategoria.reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        return sum + valor
      }, 0)
      const quantidade = transacoesCategoria.length

      return {
        categoria,
        total,
        quantidade,
        percentual: despesas > 0 ? (total / despesas) * 100 : 0
      }
    }).filter(stat => stat.total > 0)
    .sort((a, b) => b.total - a.total)

    // Evolução do saldo (últimos 30 dias)
    const hoje = new Date()
    const evolucaoSaldo = []
    
    for (let i = 29; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]
      
      const transacoesDia = transactions.filter(t => t.data <= dataStr)
      const receitasAteData = transacoesDia
        .filter(t => t.tipo === 'RECEITA')
        .reduce((total, t) => {
          const valor = Number(t.valor) || 0
          return total + valor
        }, 0)
      const despesasAteData = transacoesDia
        .filter(t => t.tipo === 'DESPESA')
        .reduce((total, t) => {
          const valor = Number(t.valor) || 0
          return total + valor
        }, 0)
      
      evolucaoSaldo.push({
        data: dataStr,
        saldo: receitasAteData - despesasAteData,
        receitas: receitasAteData,
        despesas: despesasAteData
      })
    }

    const estatisticasFinais = {
      saldoTotal: saldo,
      totalReceitas: receitas,
      totalDespesas: despesas,
      transacoesCount: transactions.length,
      estatisticasPorCategoria,
      evolucaoSaldo
    }

    console.log('📈 DEBUG: Estatísticas finais:', estatisticasFinais)
    
    return estatisticasFinais
  }, [transactions, categories])

  // Função para carregar mais transações (simulação de paginação)
  const carregarMaisTransacoes = useCallback(() => {
    // No localStorage, todas as transações já estão carregadas
    // Esta função existe para compatibilidade com a interface
    return Promise.resolve()
  }, [])

  // Função para recarregar dados
  const recarregarDados = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    // Dados
    transacoes: transactions.slice(0, limit),
    categorias: categories,
    estatisticas,
    
    // Estados
    loading,
    error,
    
    // Funções de transações
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    refetch,
    adicionarTransacao: createTransaction, // Alias para compatibilidade
    editarTransacao: updateTransaction, // Alias para compatibilidade
    filtrarTransacoes,
    excluirTransacao,
    obterTransacao,
    
    // Funções de categorias
    obterCategoria,
    updateCategory,
    deleteCategory,
    
    // Funções de controle
    carregarMaisTransacoes,
    recarregarDados,
    
    // Informações de paginação (simuladas)
    temMaisTransacoes: false,
    totalTransacoes: transactions.length
  }
}