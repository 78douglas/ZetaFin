import { useTransactionsSupabase } from './useTransactionsSupabase'
import { useCategoriesSupabase } from './useCategoriesSupabase'
import { useCallback, useMemo } from 'react'

export const useFinanceDataSupabase = () => {
  const { transactions, loading: transactionsLoading, error: transactionsError, addTransaction, updateTransaction, deleteTransaction, getTransactionById } = useTransactionsSupabase()
  const { categories, getCategoryById, updateCategory, deleteCategory } = useCategoriesSupabase()

  // Mapear transações do Supabase para o formato esperado
  const transacoesMapeadas = useMemo(() => {
    if (!transactions) return []

    return transactions.map(transaction => {
      // Processar notas para extrair categoria padrão
      let cleanNotes = transaction.notes;
      let defaultCategoryId = null;
      let registradoPor = 'Você';

      // Verificar se há categoria padrão nas notas
      if (transaction.notes && transaction.notes.includes('[CATEGORIA_PADRAO:')) {
        const match = transaction.notes.match(/\[CATEGORIA_PADRAO:([^\]]+)\]/);
        if (match) {
          defaultCategoryId = match[1];
          cleanNotes = transaction.notes.replace(/\[CATEGORIA_PADRAO:[^\]]+\]\s*/, '').trim() || null;
        }
      }

      // Se há categoria padrão, buscar nos dados padrão
      let categoria = undefined;
      let categoria_id = transaction.category_id;
      
      if (defaultCategoryId) {
        // Buscar categoria padrão
        const defaultCategory = getCategoryById(defaultCategoryId);
        if (defaultCategory) {
          categoria = {
            id: defaultCategory.id,
            nome: defaultCategory.name,
            icone: defaultCategory.icon,
            cor: defaultCategory.color,
            is_default: true
          };
          categoria_id = defaultCategoryId; // Usar o ID da categoria padrão
        }
      } else if (transaction.category) {
        // Categoria personalizada normal
        categoria = {
          id: transaction.category.id,
          nome: transaction.category.name,
          icone: transaction.category.icon,
          cor: transaction.category.color,
          is_default: transaction.category.is_default
        };
      }

      return {
        id: transaction.id,
        descricao: transaction.description,
        descricaoAdicional: cleanNotes || '',
        valor: transaction.amount,
        data: transaction.transaction_date,
        tipo: transaction.type,
        categoria_id: categoria_id,
        categoria: categoria,
        registradoPor: registradoPor,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        tags: transaction.tags || []
      }
    })
  }, [transactions, getCategoryById])

  // Função para filtrar transações (compatibilidade com Transactions.tsx)
  const filtrarTransacoes = useCallback((filtros: any) => {
    return transacoesMapeadas.filter(transacao => {
      // Filtro por categoria
      if (filtros.categoria && transacao.categoria_id !== filtros.categoria) {
        return false
      }

      // Filtro por tipo
      if (filtros.tipo && transacao.tipo !== filtros.tipo) {
        return false
      }

      // Filtro por período
      if (filtros.dataInicio && transacao.data < filtros.dataInicio) {
        return false
      }

      if (filtros.dataFim && transacao.data > filtros.dataFim) {
        return false
      }

      // Filtro por busca
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase()
        const descricao = transacao.descricao.toLowerCase()
        const categoria = transacao.categoria?.nome?.toLowerCase() || ''
        
        if (!descricao.includes(busca) && !categoria.includes(busca)) {
          return false
        }
      }

      return true
    })
  }, [transacoesMapeadas])

  // Função para obter transações por período
  const obterTransacoesPorPeriodo = useCallback((dataInicio: string, dataFim: string) => {
    return transacoesMapeadas.filter(transacao => {
      return transacao.data >= dataInicio && transacao.data <= dataFim
    })
  }, [transacoesMapeadas])

  // Função para obter transações por categoria
  const obterTransacoesPorCategoria = useCallback((categoriaId: string) => {
    return transacoesMapeadas.filter(transacao => {
      return transacao.categoria_id === categoriaId
    })
  }, [transacoesMapeadas])

  // Função para obter resumo financeiro
  const obterResumoFinanceiro = useCallback((periodo?: { inicio: string; fim: string }) => {
    let transacoesParaAnalise = transacoesMapeadas

    if (periodo) {
      transacoesParaAnalise = obterTransacoesPorPeriodo(periodo.inicio, periodo.fim)
    }

    const receitas = transacoesParaAnalise
      .filter(t => t.tipo === 'RECEITA')
      .reduce((total, t) => total + t.valor, 0)

    const despesas = transacoesParaAnalise
      .filter(t => t.tipo === 'DESPESA')
      .reduce((total, t) => total + t.valor, 0)

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      totalTransacoes: transacoesParaAnalise.length
    }
  }, [transacoesMapeadas, obterTransacoesPorPeriodo])

  // Função para obter gastos por categoria
  const obterGastosPorCategoria = useCallback((periodo?: { inicio: string; fim: string }) => {
    let transacoesParaAnalise = transacoesMapeadas

    if (periodo) {
      transacoesParaAnalise = obterTransacoesPorPeriodo(periodo.inicio, periodo.fim)
    }

    const gastosPorCategoria = transacoesParaAnalise
      .filter(t => t.tipo === 'DESPESA')
      .reduce((acc, transacao) => {
        const categoriaId = transacao.categoria_id || 'sem-categoria'
        const categoriaNome = transacao.categoria?.nome || 'Sem categoria'
        
        if (!acc[categoriaId]) {
          acc[categoriaId] = {
            categoria: categoriaNome,
            total: 0,
            transacoes: 0
          }
        }
        
        acc[categoriaId].total += transacao.valor
        acc[categoriaId].transacoes += 1
        
        return acc
      }, {} as Record<string, { categoria: string; total: number; transacoes: number }>)

    return Object.entries(gastosPorCategoria)
      .map(([id, dados]) => ({
        categoriaId: id,
        ...dados
      }))
      .sort((a, b) => b.total - a.total)
  }, [transacoesMapeadas, obterTransacoesPorPeriodo])

  // Função para obter transação por ID (compatibilidade com TransactionForm)
  const obterTransacao = useCallback((id: string) => {
    const transaction = getTransactionById(id);
    if (!transaction) return undefined;

    // Mapear para o formato esperado pelo TransactionForm
    const categoria_id = transaction.category?.id || transaction.categoria_id;
    let categoria = null;

    if (transaction.category) {
      categoria = {
        id: transaction.category.id,
        nome: transaction.category.name,
        icone: transaction.category.icon,
        cor: transaction.category.color,
        is_default: transaction.category.is_default
      };
    }

    return {
      id: transaction.id,
      descricao: transaction.description,
      descricaoAdicional: transaction.notes || '',
      valor: transaction.amount,
      data: transaction.transaction_date,
      tipo: transaction.type,
      categoria_id: categoria_id,
      categoria: categoria,
      registradoPor: transaction.user_id,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
      tags: transaction.tags || []
    };
  }, [getTransactionById]);

  return {
    transacoes: transacoesMapeadas.slice().sort((a, b) => {
      const dateA = a.data ? new Date(a.data).getTime() : 0;
      const dateB = b.data ? new Date(b.data).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return createdB - createdA;
    }),
    categories,
    loading: transactionsLoading,
    error: transactionsError,
    filtrarTransacoes,
    obterTransacoesPorPeriodo,
    obterTransacoesPorCategoria,
    obterResumoFinanceiro,
    obterGastosPorCategoria,
    getCategoryById,
    updateCategory,
    deleteCategory,
    obterTransacao,
    adicionarTransacao: async (localData: any) => {
      const payload = {
        description: localData?.descricao || '',
        amount: localData?.valor,
        type: localData?.tipo,
        transaction_date: localData?.data,
        category_id: localData?.categoria_id || null,
        notes: localData?.descricaoAdicional || null
      }
      const result = await addTransaction(payload as any)
      return (result && typeof result === 'object' && 'data' in result)
        ? result
        : { data: result, error: null }
    },
    editarTransacao: async (id: string, localUpdates: any) => {
      const updates = {
        description: localUpdates?.descricao,
        amount: localUpdates?.valor,
        type: localUpdates?.tipo,
        transaction_date: localUpdates?.data,
        category_id: localUpdates?.categoria_id,
        notes: localUpdates?.descricaoAdicional
      }
      const result = await updateTransaction(id, updates as any)
      return (result && typeof result === 'object' && 'data' in result)
        ? result
        : { data: result, error: null }
    },
    excluirTransacao: deleteTransaction
  }
}