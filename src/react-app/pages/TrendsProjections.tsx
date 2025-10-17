import { useState, useMemo } from 'react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { TipoTransacao } from '@/shared/types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Calendar, ArrowLeft, Download, 
  AlertTriangle, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrazilianDateInput from '@/react-app/components/BrazilianDateInput';
import { DATE_UTILS } from '@/react-app/lib/config';

export default function TrendsProjections() {
  const { transacoes } = useFinanceDataHybrid();
  const [periodoAnalise, setPeriodoAnalise] = useState(6);
  const [tipoPeriodo, setTipoPeriodo] = useState<'predefinido' | 'personalizado'>('predefinido');
  const [dataInicio, setDataInicio] = useState(DATE_UTILS.getMonthsAgo(1));
  const [dataFim, setDataFim] = useState(DATE_UTILS.getCurrentMonthEnd());

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPorcentagem = (valor: number) => {
    return `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
  };

  const dadosTendencias = useMemo(() => {
    const agora = new Date();
    let inicio: Date;
    let fim: Date;
    
    if (tipoPeriodo === 'personalizado') {
      inicio = new Date(dataInicio);
      fim = new Date(dataFim);
    } else {
      // Usar período dos últimos 3 meses incluindo o atual
      inicio = new Date(agora.getFullYear(), agora.getMonth() - 2, 1); // 3 meses atrás
      fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0); // final do mês atual
    }
    
    const transacoesPeriodo = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicio && dataTransacao <= fim;
    });
    
    // Dados mensais para tendências
    const dadosMensais = [];
    
    // Usar período baseado nos últimos 3 meses
    const mesesDisponiveis = [];
    for (let i = 2; i >= 0; i--) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      mesesDisponiveis.push({
        mes: data.getMonth() + 1,
        ano: data.getFullYear(),
        nome: `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`
      });
    }
    
    for (const mesInfo of mesesDisponiveis) {
      const transacoesMes = transacoesPeriodo.filter(t => {
        const dataTransacao = new Date(t.data);
        return dataTransacao.getMonth() === (mesInfo.mes - 1) && 
               dataTransacao.getFullYear() === mesInfo.ano;
      });
      
      const receitas = transacoesMes
        .filter(t => t.tipo === TipoTransacao.RECEITA)
        .reduce((sum, t) => sum + t.valor, 0);
      
      const despesas = transacoesMes
        .filter(t => t.tipo === TipoTransacao.DESPESA)
        .reduce((sum, t) => sum + t.valor, 0);
      
      dadosMensais.push({
        mes: mesInfo.nome,
        receitas,
        despesas,
        saldo: receitas - despesas
      });
    }
    
    // Cálculo de tendências
    const calcularTendencia = (dados: number[]) => {
      if (dados.length < 2) return 0;
      const n = dados.length;
      const x = dados.map((_, i) => i);
      const y = dados;
      
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      return slope;
    };
    
    const tendenciaReceitas = calcularTendencia(dadosMensais.map(d => d.receitas));
    const tendenciaDespesas = calcularTendencia(dadosMensais.map(d => d.despesas));
    const tendenciaSaldo = calcularTendencia(dadosMensais.map(d => d.saldo));
    
    // Projeções para os próximos 3 meses
    const projecoes = [];
    for (let i = 1; i <= 3; i++) {
      const dataProjecao = new Date(agora.getFullYear(), agora.getMonth() + i, 1);
      const mesAno = `${String(dataProjecao.getMonth() + 1).padStart(2, '0')}/${dataProjecao.getFullYear()}`;
      
      const ultimoMes = dadosMensais[dadosMensais.length - 1];
      const receitasProjetadas = Math.max(0, ultimoMes.receitas + (tendenciaReceitas * i));
      const despesasProjetadas = Math.max(0, ultimoMes.despesas + (tendenciaDespesas * i));
      
      projecoes.push({
        mes: mesAno,
        receitas: receitasProjetadas,
        despesas: despesasProjetadas,
        saldo: receitasProjetadas - despesasProjetadas,
        isProjecao: true
      });
    }
    
    // Análise de padrões
    const mediaReceitas = dadosMensais.reduce((sum, d) => sum + d.receitas, 0) / dadosMensais.length;
    const mediaDespesas = dadosMensais.reduce((sum, d) => sum + d.despesas, 0) / dadosMensais.length;
    const mediaSaldo = dadosMensais.reduce((sum, d) => sum + d.saldo, 0) / dadosMensais.length;
    
    // Variabilidade
    const variabilidadeReceitas = Math.sqrt(
      dadosMensais.reduce((sum, d) => sum + Math.pow(d.receitas - mediaReceitas, 2), 0) / dadosMensais.length
    );
    const variabilidadeDespesas = Math.sqrt(
      dadosMensais.reduce((sum, d) => sum + Math.pow(d.despesas - mediaDespesas, 2), 0) / dadosMensais.length
    );
    
    return {
      dadosMensais,
      projecoes,
      tendencias: {
        receitas: tendenciaReceitas,
        despesas: tendenciaDespesas,
        saldo: tendenciaSaldo
      },
      medias: {
        receitas: mediaReceitas,
        despesas: mediaDespesas,
        saldo: mediaSaldo
      },
      variabilidade: {
        receitas: variabilidadeReceitas,
        despesas: variabilidadeDespesas
      },
      dadosCompletos: [...dadosMensais, ...projecoes]
    };
  }, [transacoes, periodoAnalise, tipoPeriodo, dataInicio, dataFim]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/relatorios" 
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tendências e Projeções</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise de padrões financeiros e projeções futuras</p>
        </div>

        {/* Controles */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Filtros</h3>
          <div className="space-y-6">
            {/* Tipo de Período */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Tipo de Período:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="predefinido"
                    checked={tipoPeriodo === 'predefinido'}
                    onChange={(e) => setTipoPeriodo(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Período Predefinido</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="personalizado"
                    checked={tipoPeriodo === 'personalizado'}
                    onChange={(e) => setTipoPeriodo(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Período Personalizado</span>
                </label>
              </div>
            </div>

            {/* Configuração do Período */}
            {tipoPeriodo === 'predefinido' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</label>
                  <select
                    value={periodoAnalise}
                    onChange={(e) => setPeriodoAnalise(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={3}>Últimos 3 meses</option>
                    <option value={6}>Últimos 6 meses</option>
                    <option value={12}>Último ano</option>
                    <option value={24}>Últimos 2 anos</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Cards de Tendências */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tendência de Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatarPorcentagem((dadosTendencias.tendencias.receitas / dadosTendencias.medias.receitas) * 100)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">por mês</p>
              </div>
              {dadosTendencias.tendencias.receitas >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tendência de Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatarPorcentagem((dadosTendencias.tendencias.despesas / dadosTendencias.medias.despesas) * 100)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">por mês</p>
              </div>
              {dadosTendencias.tendencias.despesas >= 0 ? (
                <TrendingUp className="w-8 h-8 text-red-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-green-600" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tendência do Saldo</p>
                <p className={`text-2xl font-bold ${dadosTendencias.tendencias.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarPorcentagem((dadosTendencias.tendencias.saldo / Math.abs(dadosTendencias.medias.saldo || 1)) * 100)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">por mês</p>
              </div>
              {dadosTendencias.tendencias.saldo >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Tendências e Projeções */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Tendências e Projeções Financeiras
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosTendencias.dadosCompletos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis tickFormatter={(value) => formatarMoeda(value)} fontSize={12} />
              <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Receitas"
                strokeDasharray="0"
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Despesas"
                strokeDasharray="0"
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Saldo"
                strokeDasharray="0"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            * Linhas tracejadas representam projeções baseadas nas tendências históricas
          </p>
        </div>

        {/* Análise de Padrões */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Análise de Padrões
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Médias Mensais</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Receitas:</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatarMoeda(dadosTendencias.medias.receitas)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Despesas:</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatarMoeda(dadosTendencias.medias.despesas)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Saldo:</span>
                  <span className={`text-sm font-medium ${dadosTendencias.medias.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatarMoeda(dadosTendencias.medias.saldo)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Variabilidade</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Receitas:</span>
                  <span className="text-sm font-medium dark:text-gray-300">
                    ±{formatarMoeda(dadosTendencias.variabilidade.receitas)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Despesas:</span>
                  <span className="text-sm font-medium dark:text-gray-300">
                    ±{formatarMoeda(dadosTendencias.variabilidade.despesas)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projeções Detalhadas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Projeções para os Próximos 3 Meses
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Mês</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Receitas Projetadas</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Despesas Projetadas</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Saldo Projetado</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {dadosTendencias.projecoes.map((projecao, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{projecao.mes}</td>
                    <td className="py-3 px-4 text-sm text-right text-green-600">
                      {formatarMoeda(projecao.receitas)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">
                      {formatarMoeda(projecao.despesas)}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-medium ${projecao.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarMoeda(projecao.saldo)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {projecao.saldo >= 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 mx-auto" />
                      )}
                    </td>
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