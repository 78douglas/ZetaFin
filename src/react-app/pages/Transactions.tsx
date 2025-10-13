import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { useEditMode } from '@/react-app/contexts/EditModeContext';
import { useExport } from '@/react-app/contexts/ExportContext';
import { FiltroTransacao, TipoTransacao } from '@/shared/types';
import { Search, Filter, Edit, Trash2, Plus, Eye, Download, FileText, Database } from 'lucide-react';

export default function Transactions() {
  const { loading, transacoes, categorias, filtrarTransacoes, excluirTransacao, obterCategoria } = useFinanceDataHybrid();
  const { isEditMode } = useEditMode();
  const { exportToCSV, exportToJSON, exportToPDF } = useExport();
  
  const [filtros, setFiltros] = useState<FiltroTransacao>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const transacoesFiltradas = useMemo(() => {
    return filtrarTransacoes(filtros);
  }, [filtrarTransacoes, filtros]);

  // Fechar menu de exportação ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleExcluirTransacao = (id: string) => {
    excluirTransacao(id);
    setTransacaoParaExcluir(null);
  };

  const limparFiltros = () => {
    setFiltros({});
  };

  const handleExportCSV = () => {
    const dataToExport = transacoesFiltradas.map(transacao => ({
      id: transacao.id,
      description: transacao.descricao,
      amount: transacao.valor,
      category: obterCategoria(transacao.categoriaId)?.nome || 'Sem categoria',
      date: transacao.data,
      type: transacao.tipo
    }));
    exportToCSV(dataToExport, 'transacoes');
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const dataToExport = transacoesFiltradas.map(transacao => ({
      id: transacao.id,
      description: transacao.descricao,
      amount: transacao.valor,
      category: obterCategoria(transacao.categoriaId)?.nome || 'Sem categoria',
      date: transacao.data,
      type: transacao.tipo
    }));
    exportToJSON(dataToExport, 'transacoes');
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    const dataToExport = transacoesFiltradas.map(transacao => ({
      id: transacao.id,
      description: transacao.descricao,
      amount: transacao.valor,
      category: obterCategoria(transacao.categoriaId)?.nome || 'Sem categoria',
      date: transacao.data,
      type: transacao.tipo
    }));
    exportToPDF(dataToExport, 'transacoes');
    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Transações</h1>
          <p className="text-gray-600 dark:text-gray-400">Histórico completo de receitas e despesas</p>
        </div>
        <div className="flex items-center justify-end space-x-3 mt-4 md:mt-0">
          {/* Export Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Exportar</span>
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-2">
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-gray-900 dark:text-gray-100">Exportar CSV</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-900 dark:text-gray-100">Exportar JSON</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4 text-red-600" />
                    <span className="text-gray-900 dark:text-gray-100">Exportar PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Link
            to="/nova-transacao"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Transação</span>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-blue-100/50 dark:shadow-gray-900/50 border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Filtros e Busca</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
            </button>
          </div>

          {/* Busca */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={filtros.busca || ''}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
                <select
                  value={filtros.tipo || ''}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value as TipoTransacao || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  <option value={TipoTransacao.RECEITA}>Receitas</option>
                  <option value={TipoTransacao.DESPESA}>Despesas</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                <select
                  value={filtros.categoria || ''}
                  onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.icone} {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Início</label>
                <input
                  type="date"
                  value={filtros.dataInicio || ''}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={filtros.dataFim || ''}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Limpar filtros */}
              <div className="md:col-span-4 flex justify-end">
                <button
                  onClick={limparFiltros}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumo dos resultados */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {transacoesFiltradas.length} de {transacoes.length} transações
        </p>
      </div>

      {/* Lista de transações */}
      {transacoesFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg shadow-blue-100/50 dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <Eye className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {transacoes.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação corresponde aos filtros'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {transacoes.length === 0 
              ? 'Comece adicionando sua primeira transação'
              : 'Tente ajustar os filtros para ver mais resultados'
            }
          </p>
          {transacoes.length === 0 && (
            <Link
              to="/nova-transacao"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Transação
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-blue-100/50 dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-white dark:bg-gray-800">
            {transacoesFiltradas.map((transacao) => {
              const categoria = obterCategoria(transacao.categoriaId);
              return (
                <div key={transacao.id} className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{categoria?.icone || '📝'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{transacao.descricao}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{formatDate(transacao.data)}</span>
                          <span>•</span>
                          <span>{transacao.registradoPor}</span>
                          <span>•</span>
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            {categoria?.nome}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="text-right">
                        <p className={`font-bold text-base ${
                          transacao.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transacao.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(transacao.valor)}
                        </p>
                      </div>
                      {isEditMode && (
                        <div className="flex items-center">
                          <Link
                            to={`/editar-transacao/${transacao.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setTransacaoParaExcluir(transacao.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors duration-200 ml-1"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {transacaoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleExcluirTransacao(transacaoParaExcluir)}
                className="flex-1 bg-red-600 text-white font-medium py-2 px-4 rounded-xl hover:bg-red-700 transition-colors duration-200"
              >
                Excluir
              </button>
              <button
                onClick={() => setTransacaoParaExcluir(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
