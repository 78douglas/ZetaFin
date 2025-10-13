import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { useExport } from '@/react-app/contexts/ExportContext';
import { 
  Calendar, 
  Clock, 
  BarChart3, 
  PieChart, 
  Target,
  Receipt,
  Wallet,
  List,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  DollarSign,
  Download,
  FileText,
  Database
} from 'lucide-react';

export default function Reports() {
  const { loading, transacoes, obterCategoria } = useFinanceDataHybrid();
  const navigate = useNavigate();
  const { exportToCSV, exportToJSON, exportToPDF } = useExport();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const resumoRapido = useMemo(() => {
    // Transações do mês atual (outubro 2024)
    const inicioMes = new Date(2024, 9, 1); // Outubro 2024
    const fimMes = new Date(2024, 9, 31);

    const transacoesMesAtual = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicioMes && dataTransacao <= fimMes;
    });

    // Categorias utilizadas no mês
    const categoriasUtilizadas = new Set(transacoesMesAtual.map(t => t.categoriaId));

    // Orçamentos ativos (simulado - apps reais teriam orçamentos definidos)
    const orcamentosAtivos = 3; // Simulando que tem 3 orçamentos definidos

    return {
      transacoesMes: transacoesMesAtual.length,
      orcamentosAtivos,
      categoriasUtilizadas: categoriasUtilizadas.size
    };
  }, [transacoes]);

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

  const handleExportCSV = () => {
    const dataToExport = transacoes.map(transacao => ({
      id: transacao.id,
      description: transacao.descricao,
      amount: transacao.valor,
      category: obterCategoria(transacao.categoriaId)?.nome || 'Sem categoria',
      date: transacao.data,
      type: transacao.tipo
    }));
    exportToCSV(dataToExport, 'relatorio-completo');
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const dataToExport = transacoes.map(transacao => ({
      id: transacao.id,
      description: transacao.descricao,
      amount: transacao.valor,
      category: obterCategoria(transacao.categoriaId)?.nome || 'Sem categoria',
      date: transacao.data,
      type: transacao.tipo
    }));
    exportToJSON(dataToExport, 'relatorio-completo');
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    const dataToExport = transacoes.map(transacao => ({
      id: transacao.id,
      description: transacao.descricao,
      amount: transacao.valor,
      category: obterCategoria(transacao.categoriaId)?.nome || 'Sem categoria',
      date: transacao.data,
      type: transacao.tipo
    }));
    exportToPDF(dataToExport, 'relatorio-completo');
    setShowExportMenu(false);
  };

  const relatoriosDisponiveis = [
    {
      id: 'mensal',
      titulo: 'Relatório Mensal',
      descricao: 'Visualize o resumo completo do mês atual com gráficos e estatísticas',
      icone: Calendar,
      cor: 'blue'
    },
    {
      id: 'periodo',
      titulo: 'Relatório por Período',
      descricao: 'Analise suas finanças em um período personalizado',
      icone: Clock,
      cor: 'purple'
    },
    {
      id: 'categorias',
      titulo: 'Análise por Categorias',
      descricao: 'Veja como você gasta em cada categoria ao longo do tempo',
      icone: PieChart,
      cor: 'orange'
    },
    {
      id: 'tendencias',
      titulo: 'Tendências e Projeções',
      descricao: 'Identifique padrões e projeções baseadas no seu histórico',
      icone: BarChart3,
      cor: 'indigo'
    },
    {
      id: 'metas',
      titulo: 'Acompanhamento de Metas',
      descricao: 'Monitore o progresso das suas metas financeiras',
      icone: Target,
      cor: 'red'
    },
    {
      id: 'frequentes',
      titulo: 'Gastos Frequentes',
      descricao: 'Identifique seus gastos recorrentes e padrões de consumo',
      icone: Receipt,
      cor: 'pink'
    }
  ];

  const navegarPara = (relatorioId: string) => {
    const rotas: Record<string, string> = {
      'mensal': '/relatorios/mensal',
      'periodo': '/relatorios/periodo',
      'categorias': '/relatorios/categorias',
      'tendencias': '/relatorios/tendencias',
      'metas': '/relatorios/metas',
      'frequentes': '/relatorios/frequentes'
    };
    
    if (rotas[relatorioId]) {
      navigate(rotas[relatorioId]);
    }
  };

  const dicasAnalise = [
    'Use o relatório mensal para acompanhar seus gastos regularmente',
    'Compare meses diferentes para identificar padrões de gastos',
    'Analise períodos específicos para avaliar metas financeiras',
    'Monitore categorias de maior gasto para otimizar o orçamento',
    'Defina metas realistas baseadas no seu histórico financeiro',
    'Revise mensalmente seus gastos recorrentes e assinaturas'
  ];

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Análise detalhada das suas finanças</p>
        </div>
        
        {/* Export Menu */}
        <div className="relative mt-4 md:mt-0" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Dados</span>
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
      </div>

      {/* Resumo Rápido */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumo Rápido</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {resumoRapido.transacoesMes}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
              Transações este mês
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {resumoRapido.orcamentosAtivos}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
              Orçamentos ativos
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <List className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {resumoRapido.categoriasUtilizadas}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
              Categorias utilizadas
            </div>
          </div>
        </div>
      </div>

      {/* Relatórios Disponíveis */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Relatórios Disponíveis</h2>
        <div className="space-y-3">
          {relatoriosDisponiveis.map((relatorio) => {
            const Icon = relatorio.icone;
            const corClasses = {
              blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
              green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
              purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
              orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
              indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
              red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
              emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
              pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
            };

            return (
              <button
                key={relatorio.id}
                onClick={() => navegarPara(relatorio.id)}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${corClasses[relatorio.cor as keyof typeof corClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1">
                      {relatorio.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {relatorio.descricao}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200 flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dicas para Análise */}
      <div className="bg-orange-50 dark:bg-gray-800 rounded-xl p-6 border border-orange-100 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-orange-200 dark:bg-orange-800/50 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dicas para Análise</h2>
        </div>
        <div className="space-y-3">
          {dicasAnalise.map((dica, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{dica}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Estatísticas Gerais - Mantendo para referência */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Estatísticas Gerais</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(6719)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Saldo Total</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
            <Receipt className="w-8 h-8 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{transacoes.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Transações</div>
          </div>
        </div>
      </div>
    </div>
  );
}
