import { useState, useEffect, useCallback } from 'react';
import { Transacao, Categoria, TipoTransacao, FiltroTransacao, EstatisticasFinanceiras } from '@/shared/types';

// Arrays vazios - dados serão carregados do Supabase
const categoriasIniciais: Categoria[] = [];
const transacoesIniciais: Transacao[] = [];

const STORAGE_KEY = 'zetafin_data';

interface StorageData {
  transacoes: Transacao[];
  categorias: Categoria[];
}

export function useFinanceData() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const { transacoes: savedTransacoes, categorias: savedCategorias }: StorageData = JSON.parse(savedData);
        setTransacoes(savedTransacoes || transacoesIniciais);
        setCategorias(savedCategorias || categoriasIniciais);
      } else {
        // Primeira vez - usar dados iniciais vazios
        setTransacoes(transacoesIniciais);
        setCategorias(categoriasIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setTransacoes(transacoesIniciais);
      setCategorias(categoriasIniciais);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar dados no localStorage sempre que mudarem
  const salvarDados = useCallback((novasTransacoes: Transacao[], novasCategorias: Categoria[]) => {
    const data: StorageData = {
      transacoes: novasTransacoes,
      categorias: novasCategorias
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Calcular estatísticas
  const calcularEstatisticas = useCallback((): EstatisticasFinanceiras => {
    const totalReceitas = transacoes
      .filter(t => t.tipo === TipoTransacao.RECEITA)
      .reduce((sum, t) => sum + t.valor, 0);
    
    const totalDespesas = transacoes
      .filter(t => t.tipo === TipoTransacao.DESPESA)
      .reduce((sum, t) => sum + t.valor, 0);

    return {
      saldoTotal: totalReceitas - totalDespesas,
      totalReceitas,
      totalDespesas,
      transacoesCount: transacoes.length
    };
  }, [transacoes]);

  // Filtrar transações
  const filtrarTransacoes = useCallback((filtros: FiltroTransacao): Transacao[] => {
    return transacoes.filter(transacao => {
      // Filtro por categoria
      if (filtros.categoria && transacao.categoria_id !== filtros.categoria) {
        return false;
      }

      // Filtro por tipo
      if (filtros.tipo && transacao.tipo !== filtros.tipo) {
        return false;
      }

      // Filtro por busca (descrição)
      if (filtros.busca && !transacao.descricao.toLowerCase().includes(filtros.busca.toLowerCase())) {
        return false;
      }

      // Filtro por data
      if (filtros.dataInicio && transacao.data < filtros.dataInicio) {
        return false;
      }

      if (filtros.dataFim && transacao.data > filtros.dataFim) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [transacoes]);

  // Adicionar transação
  const adicionarTransacao = useCallback((novaTransacao: Omit<Transacao, 'id' | 'createdAt'>) => {
    const transacao: Transacao = {
      ...novaTransacao,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      registradoPor: 'Usuário'
    };

    const novasTransacoes = [...transacoes, transacao];
    setTransacoes(novasTransacoes);
    salvarDados(novasTransacoes, categorias);
    return transacao;
  }, [transacoes, categorias, salvarDados]);

  // Editar transação
  const editarTransacao = useCallback((id: string, dadosAtualizados: Partial<Omit<Transacao, 'id' | 'createdAt'>>) => {
    const novasTransacoes = transacoes.map(transacao =>
      transacao.id === id
        ? { ...transacao, ...dadosAtualizados }
        : transacao
    );
    setTransacoes(novasTransacoes);
    salvarDados(novasTransacoes, categorias);
  }, [transacoes, categorias, salvarDados]);

  // Excluir transação
  const excluirTransacao = useCallback((id: string) => {
    const novasTransacoes = transacoes.filter(transacao => transacao.id !== id);
    setTransacoes(novasTransacoes);
    salvarDados(novasTransacoes, categorias);
  }, [transacoes, categorias, salvarDados]);

  // Obter transação por ID
  const obterTransacao = useCallback((id: string): Transacao | undefined => {
    return transacoes.find(transacao => transacao.id === id);
  }, [transacoes]);

  // Adicionar categoria
  const adicionarCategoria = useCallback((novaCategoria: Omit<Categoria, 'id'>) => {
    const categoria: Categoria = {
      ...novaCategoria,
      id: Date.now().toString()
    };

    const novasCategorias = [...categorias, categoria];
    setCategorias(novasCategorias);
    salvarDados(transacoes, novasCategorias);
    return categoria;
  }, [categorias, transacoes, salvarDados]);

  // Obter categoria por ID
  const obterCategoria = useCallback((id: string): Categoria | undefined => {
    return categorias.find(categoria => categoria.id === id);
  }, [categorias]);

  return {
    transacoes,
    categorias,
    loading,
    estatisticas: calcularEstatisticas(),
    adicionarTransacao,
    editarTransacao,
    excluirTransacao,
    filtrarTransacoes,
    obterTransacao,
    obterCategoria,
    adicionarCategoria
  };
}
