import { useState, useMemo, useEffect } from 'react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { TipoTransacao } from '@/shared/types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  Calendar, ArrowLeft, Download, Filter, Repeat, 
  TrendingUp, AlertCircle, Clock, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrazilianDateInput from '@/react-app/components/BrazilianDateInput';
import { DATE_UTILS } from '@/react-app/lib/config';

interface GastoFrequente {
  descricao: string;
  categoria: string;
  frequencia: number;
  valorMedio: number;
  valorTotal: number;
  ultimaOcorrencia: string;
  proximaPrevisao: string;
  variacao: number;
}

export default function FrequentExpenses() {
  const { transacoes, recarregarDados } = useFinanceDataHybrid();
  const [periodoAnalise, setPeriodoAnalise] = useState(6); // meses
  const [tipoPeriodo, setTipoPeriodo] = useState<'predefinido' | 'personalizado'>('predefinido');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [ordenacao, setOrdenacao] = useState<'frequencia' | 'valor' | 'categoria'>('frequencia');



  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return DATE_UTILS.formatToBrazilian(data);
  };

  const dadosAnalise = useMemo(() => {
    let dataInicioFiltro: Date;
    let dataFimFiltro: Date;
    
    if (tipoPeriodo === 'personalizado' && dataInicio && dataFim) {
      dataInicioFiltro = new Date(dataInicio);
      dataFimFiltro = new Date(dataFim);
    } else {
      // Usar período baseado no mês atual
      const now = new Date();
      const monthsBack = periodoAnalise;
      dataInicioFiltro = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
      dataFimFiltro = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    const despesas = transacoes.filter(t => 
      t.tipo === TipoTransacao.DESPESA && 
      new Date(t.data) >= dataInicioFiltro &&
      new Date(t.data) <= dataFimFiltro
    );

    // Agrupar por descrição similar
    const gruposGastos = despesas.reduce((grupos, transacao) => {
      const descricaoNormalizada = transacao.descricao
        .toLowerCase()
        .replace(/\d+/g, '')
        .replace(/[^\w\s]/g, '')
        .trim();
      
      const chave = `${descricaoNormalizada}_${transacao.categoria_id}`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          descricao: transacao.descricao,
          categoria: transacao.categoria_id,
          transacoes: []
        };
      }
      
      grupos[chave].transacoes.push(transacao);
      return grupos;
    }, {} as Record<string, any>);

    // Calcular estatísticas para cada grupo
    const gastosFrequentes: GastoFrequente[] = Object.values(gruposGastos)
      .filter((grupo: any) => grupo.transacoes.length >= 2)
      .map((grupo: any) => {
        const transacoes = grupo.transacoes;
        const valores = transacoes.map((t: any) => t.valor);
        const datas = transacoes.map((t: any) => new Date(t.data)).sort((a: Date, b: Date) => a.getTime() - b.getTime());
        
        const valorMedio = valores.reduce((sum: number, v: number) => sum + v, 0) / valores.length;
        const valorTotal = valores.reduce((sum: number, v: number) => sum + v, 0);
        
        const variancia = valores.reduce((sum: number, v: number) => sum + Math.pow(v - valorMedio, 2), 0) / valores.length;
        const desvioPadrao = Math.sqrt(variancia);
        const variacao = valorMedio > 0 ? (desvioPadrao / valorMedio) * 100 : 0;
        
        const primeirData = datas[0];
        const ultimaData = datas[datas.length - 1];
        const mesesEntreDatas = Math.max(1, (ultimaData.getTime() - primeirData.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const frequencia = transacoes.length / mesesEntreDatas;
        
        const intervaloMedio = mesesEntreDatas / (transacoes.length - 1) * 30;
        const proximaPrevisao = new Date(ultimaData.getTime() + (intervaloMedio * 24 * 60 * 60 * 1000));
        
        return {
          descricao: grupo.descricao,
          categoria: grupo.categoria,
          frequencia: frequencia,
          valorMedio: valorMedio,
          valorTotal: valorTotal,
          ultimaOcorrencia: ultimaData.toISOString().split('T')[0],
          proximaPrevisao: proximaPrevisao.toISOString().split('T')[0],
          variacao: variacao
        };
      })
      .sort((a, b) => {
        switch (ordenacao) {
          case 'frequencia':
            return b.frequencia - a.frequencia;
          case 'valor':
            return b.valorTotal - a.valorTotal;
          case 'categoria':
            return a.categoria.localeCompare(b.categoria);
          default:
            return b.frequencia - a.frequencia;
        }
      });

    const gastosFiltrados = filtroCategoria === 'todas' 
      ? gastosFrequentes 
      : gastosFrequentes.filter(g => g.categoria === filtroCategoria);

    const totalGastosFrequentes = gastosFiltrados.reduce((sum, g) => sum + g.valorTotal, 0);
    const mediaFrequencia = gastosFiltrados.length > 0 
      ? gastosFiltrados.reduce((sum, g) => sum + g.frequencia, 0) / gastosFiltrados.length 
      : 0;
    const categorias = [...new Set(gastosFrequentes.map(g => g.categoria))];
    
    const dadosPorCategoria = categorias.map(categoria => {
      const gastosCategoria = gastosFrequentes.filter(g => g.categoria === categoria);
      return {
        categoria,
        quantidade: gastosCategoria.length,
        valorTotal: gastosCategoria.reduce((sum, g) => sum + g.valorTotal, 0),
        frequenciaMedia: gastosCategoria.length > 0 
          ? gastosCategoria.reduce((sum, g) => sum + g.frequencia, 0) / gastosCategoria.length 
          : 0
      };
    }).sort((a, b) => b.valorTotal - a.valorTotal);

    const top10Frequentes = gastosFrequentes.slice(0, 10).map(g => ({
      nome: g.descricao.length > 20 ? g.descricao.substring(0, 20) + '...' : g.descricao,
      frequencia: g.frequencia,
      valor: g.valorMedio
    }));

    return {
      gastosFrequentes: gastosFiltrados,
      totalGastos: gastosFiltrados.length,
      totalValor: totalGastosFrequentes,
      mediaFrequencia: mediaFrequencia,
      categorias,
      dadosPorCategoria,
      top10Frequentes,
      gastosProximosVencimento: gastosFiltrados.filter(g => {
        const proximaData = new Date(g.proximaPrevisao);
        const hoje = new Date();
        const diasAteProxima = (proximaData.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
        return diasAteProxima <= 7 && diasAteProxima >= 0;
      })
    };
  }, [transacoes, periodoAnalise, tipoPeriodo, dataInicio, dataFim, filtroCategoria, ordenacao]);

  const CORES = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarelo
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#06B6D4', // Ciano
  '#84CC16', // Lima
  '#F97316', // Laranja
  '#EC4899', // Rosa
  '#6B7280'  // Cinza
];

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
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gastos Frequentes</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise de padrões de gastos recorrentes</p>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtros</h3>
          </div>
          
          <div className="space-y-6">
            {/* Tipo de Período */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Tipo de Período:</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="predefinido"
                    checked={tipoPeriodo === 'predefinido'}
                    onChange={(e) => setTipoPeriodo(e.target.value as any)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Período Predefinido</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="personalizado"
                    checked={tipoPeriodo === 'personalizado'}
                    onChange={(e) => setTipoPeriodo(e.target.value as any)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Período Personalizado</span>
                </label>
              </div>
            </div>

            {/* Configuração do Período */}
            {tipoPeriodo === 'predefinido' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</label>
                  </div>
                  <select
                    value={periodoAnalise}
                    onChange={(e) => setPeriodoAnalise(Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={3}>Últimos 3 meses</option>
                    <option value={6}>Últimos 6 meses</option>
                    <option value={12}>Último ano</option>
                    <option value={24}>Últimos 2 anos</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BrazilianDateInput
                  label="Data Início"
                  value={dataInicio}
                  onChange={setDataInicio}
                />
                
                <BrazilianDateInput
                  label="Data Fim"
                  value={dataFim}
                  onChange={setDataFim}
                />
              </div>
            )}

            {/* Filtros Adicionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria:</label>
                </div>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todas">Todas as Categorias</option>
                  {dadosAnalise.categorias.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por:</label>
                </div>
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="frequencia">Frequência</option>
                  <option value="valor">Valor Total</option>
                  <option value="categoria">Categoria</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="space-y-6 mb-8">
          {/* Primeira linha: Total de Gastos Frequentes + Valor Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Gastos Frequentes</p>
                  <p className="text-2xl font-bold text-blue-600">{dadosAnalise.totalGastos}</p>
                </div>
                <Repeat className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatarMoeda(dadosAnalise.totalValor)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Segunda linha: Frequência Média + Próximos Vencimentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Frequência Média</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dadosAnalise.mediaFrequencia.toFixed(1)}/mês
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Próximos Vencimentos</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dadosAnalise.gastosProximosVencimento.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">próximos 7 dias</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de Próximos Vencimentos */}
        {dadosAnalise.gastosProximosVencimento.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-semibold text-orange-900 dark:text-orange-100">
                Gastos Previstos para os Próximos Dias
              </h3>
            </div>
            <div className="space-y-2">
              {dadosAnalise.gastosProximosVencimento.map((gasto, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-orange-800 dark:text-orange-200">{gasto.descricao}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      {formatarMoeda(gasto.valorMedio)}
                    </span>
                    <span className="text-xs text-orange-600 dark:text-orange-400 ml-2">
                      {formatarData(gasto.proximaPrevisao)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gráfico de Top 10 Gastos Mais Frequentes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Top 10 Gastos Mais Frequentes
          </h3>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={dadosAnalise.top10Frequentes}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB" 
                  className="dark:stroke-gray-600"
                />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  fontSize={11}
                  stroke="#6B7280"
                  className="dark:stroke-gray-400"
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}/mês`} 
                  fontSize={11}
                  stroke="#6B7280"
                  className="dark:stroke-gray-400"
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'frequencia' ? `${Number(value).toFixed(1)}/mês` : formatarMoeda(Number(value)),
                    name === 'frequencia' ? 'Frequência' : 'Valor Médio'
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar 
                  dataKey="frequencia" 
                  fill="url(#gradientBar)" 
                  name="Frequência"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gastos por Categoria */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Gastos Frequentes por Categoria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dadosAnalise.dadosPorCategoria.map((categoria, index) => (
              <div key={categoria.categoria} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: CORES[index % CORES.length] }}
                  ></div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{categoria.categoria}</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quantidade:</span>
                    <span className="font-medium dark:text-gray-200">{categoria.quantidade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Valor total:</span>
                    <span className="font-medium dark:text-gray-200">{formatarMoeda(categoria.valorTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Frequência média:</span>
                    <span className="font-medium dark:text-gray-200">{categoria.frequenciaMedia.toFixed(1)}/mês</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista Detalhada */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Lista Detalhada de Gastos Frequentes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Frequência</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Valor Médio</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Valor Total</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Última Ocorrência</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Próxima Previsão</th>
                </tr>
              </thead>
              <tbody>
                {dadosAnalise.gastosFrequentes.map((gasto, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{gasto.descricao}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{gasto.categoria}</td>
                    <td className="py-3 px-4 text-sm text-right dark:text-gray-300">{gasto.frequencia.toFixed(1)}/mês</td>
                    <td className="py-3 px-4 text-sm text-right dark:text-gray-300">{formatarMoeda(gasto.valorMedio)}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium dark:text-gray-200">{formatarMoeda(gasto.valorTotal)}</td>
                    <td className="py-3 px-4 text-sm text-right dark:text-gray-300">{formatarData(gasto.ultimaOcorrencia)}</td>
                    <td className="py-3 px-4 text-sm text-right dark:text-gray-300">{formatarData(gasto.proximaPrevisao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}