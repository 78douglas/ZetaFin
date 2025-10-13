import { useState, useMemo } from 'react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { TipoTransacao } from '@/shared/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, TrendingDown, DollarSign, ArrowLeft, Calendar, Plus, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

interface Goal {
  id: string;
  titulo: string;
  descricao: string;
  valorMeta: number;
  valorAtual: number;
  dataInicio: string;
  dataFim: string;
  categoria: string;
  tipo: 'economia' | 'receita' | 'despesa';
  status: 'ativo' | 'concluido' | 'pausado';
}

export default function GoalsTracking() {
  const { } = useFinanceDataHybrid();
  // const [mostrarFormulario, setMostrarFormulario] = useState(false);
  // const [metaEditando, setMetaEditando] = useState<Meta | null>(null);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPorcentagem = (valor: number) => {
    return `${valor.toFixed(1)}%`;
  };

  // Metas de exemplo (em uma aplicação real, viriam de um estado global ou API)
  const [metas] = useState<Meta[]>([
    {
      id: '1',
      nome: 'Reserva de Emergência',
      categoria: 'Poupança',
      valorMeta: 10000,
      valorAtual: 6500,
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      tipo: 'economia',
      status: 'ativa'
    },
    {
      id: '2',
      nome: 'Limite de Gastos com Lazer',
      categoria: 'Lazer',
      valorMeta: 800,
      valorAtual: 650,
      dataInicio: '2024-10-01',
      dataFim: '2024-10-31',
      tipo: 'limite_gasto',
      status: 'ativa'
    },
    {
      id: '3',
      nome: 'Renda Extra',
      categoria: 'Freelance',
      valorMeta: 2000,
      valorAtual: 2200,
      dataInicio: '2024-10-01',
      dataFim: '2024-10-31',
      tipo: 'receita',
      status: 'concluida'
    },
    {
      id: '4',
      nome: 'Viagem de Férias',
      categoria: 'Viagem',
      valorMeta: 5000,
      valorAtual: 3200,
      dataInicio: '2024-01-01',
      dataFim: '2024-06-30',
      tipo: 'economia',
      status: 'atrasada'
    }
  ]);

  const dadosAnalise = useMemo(() => {
    const metasAtivas = metas.filter(m => m.status === 'ativa');
    const metasConcluidas = metas.filter(m => m.status === 'concluida');
    const metasAtrasadas = metas.filter(m => m.status === 'atrasada');

    const progressoMedio = metas.reduce((acc, meta) => {
      const progresso = Math.min((meta.valorAtual / meta.valorMeta) * 100, 100);
      return acc + progresso;
    }, 0) / metas.length;

    // Dados para gráfico de progresso
    const dadosProgresso = metas.map(meta => ({
      nome: meta.nome,
      progresso: Math.min((meta.valorAtual / meta.valorMeta) * 100, 100),
      valorAtual: meta.valorAtual,
      valorMeta: meta.valorMeta,
      status: meta.status
    }));

    // Dados por categoria
    const categorias = metas.reduce((acc, meta) => {
      if (!acc[meta.categoria]) {
        acc[meta.categoria] = {
          nome: meta.categoria,
          metas: 0,
          concluidas: 0,
          valorTotal: 0,
          valorAtual: 0
        };
      }
      acc[meta.categoria].metas++;
      acc[meta.categoria].valorTotal += meta.valorMeta;
      acc[meta.categoria].valorAtual += meta.valorAtual;
      if (meta.status === 'concluida') {
        acc[meta.categoria].concluidas++;
      }
      return acc;
    }, {} as Record<string, any>);

    const dadosCategorias = Object.values(categorias);

    return {
      metasAtivas: metasAtivas.length,
      metasConcluidas: metasConcluidas.length,
      metasAtrasadas: metasAtrasadas.length,
      progressoMedio,
      dadosProgresso,
      dadosCategorias,
      totalInvestido: metas.reduce((sum, m) => sum + m.valorAtual, 0),
      totalMetas: metas.reduce((sum, m) => sum + m.valorMeta, 0)
    };
  }, [metas]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'text-blue-600 dark:text-blue-400';
      case 'concluida': return 'text-green-600 dark:text-green-400';
      case 'atrasada': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return <Clock className="w-4 h-4" />;
      case 'concluida': return <CheckCircle className="w-4 h-4" />;
      case 'atrasada': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const CORES = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/relatorios" 
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar aos Relatórios
            </Link>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => {/* setMostrarFormulario(true) */}}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Acompanhamento de Metas</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitore o progresso das suas metas financeiras</p>
        </div>

        {/* Cards de Resumo */}
        <div className="space-y-6 mb-8">
          {/* Primeira linha: Metas Ativas + Concluídas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Metas Ativas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dadosAnalise.metasAtivas}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dadosAnalise.metasConcluidas}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Segunda linha: Progresso Médio + Atrasadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progresso Médio</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatarPorcentagem(dadosAnalise.progressoMedio)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dadosAnalise.metasAtrasadas}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Progresso das Metas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Progresso das Metas
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosAnalise.dadosProgresso} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} fontSize={12} />
              <YAxis dataKey="nome" type="category" width={120} fontSize={12} />
              <Tooltip 
                formatter={(value) => [
                  `${Number(value).toFixed(1)}%`,
                  'Progresso'
                ]}
                labelFormatter={(label) => `Meta: ${label}`}
              />
              <Bar dataKey="progresso" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lista de Metas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Suas Metas
          </h3>
          <div className="space-y-4">
            {metas.map((meta) => {
              const progresso = Math.min((meta.valorAtual / meta.valorMeta) * 100, 100);
              return (
                <div key={meta.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={getStatusColor(meta.status)}>
                        {getStatusIcon(meta.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{meta.nome}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{meta.categoria}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {/* setMetaEditando(meta) */}}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatarPorcentagem(progresso)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          meta.status === 'concluida' ? 'bg-green-600' :
                          meta.status === 'atrasada' ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(progresso, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Atual: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatarMoeda(meta.valorAtual)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Meta: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatarMoeda(meta.valorMeta)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Início: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(meta.dataInicio).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fim: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(meta.dataFim).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Análise por Categoria */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Metas por Categoria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dadosAnalise.dadosCategorias.map((categoria: any, index: number) => (
              <div key={categoria.nome} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: CORES[index % CORES.length] }}
                  ></div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{categoria.nome}</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total de metas:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{categoria.metas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Concluídas:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{categoria.concluidas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Valor atual:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatarMoeda(categoria.valorAtual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Valor meta:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatarMoeda(categoria.valorTotal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}