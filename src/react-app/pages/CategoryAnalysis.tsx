import { useState, useMemo, useEffect } from 'react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { 
  Calendar, ArrowLeft, PieChart as PieChartIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TipoTransacao } from '@/shared/types';
import { DATE_UTILS } from '@/react-app/lib/config';

const CORES = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#06b6d4', '#10b981'
];

export default function CategoryAnalysis() {
  const { transacoes, obterCategoria, recarregarDados } = useFinanceDataHybrid();
  
  // Estado para o mês/ano selecionado (usar mês atual)
  const [mesSelecionado, setMesSelecionado] = useState(DATE_UTILS.getCurrentMonth());

  // Remover verificação de dados fictícios - agora usa apenas Supabase
  useEffect(() => {
    // Dados serão carregados automaticamente pelo hook híbrido
  }, []);



  // Função para formatar moeda
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Calcular dados do mês selecionado
  const dadosMes = useMemo(() => {
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0);

    // Filtrar transações do mês selecionado (apenas despesas)
    const transacoesMes = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return t.tipo === TipoTransacao.DESPESA && 
             dataTransacao >= inicioMes && 
             dataTransacao <= fimMes;
    });

    // Agrupar por categoria
    const categoriasMap = transacoesMes.reduce((acc, transacao) => {
      const categoria = obterCategoria(transacao.categoria_id);
      const nomeCategoria = categoria?.nome || 'Outros';
      const iconeCategoria = categoria?.icone || '📝';
      
      if (!acc[nomeCategoria]) {
        acc[nomeCategoria] = {
          nome: nomeCategoria,
          icone: iconeCategoria,
          valor: 0,
          transacoes: 0
        };
      }
      acc[nomeCategoria].valor += transacao.valor;
      acc[nomeCategoria].transacoes += 1;
      return acc;
    }, {} as Record<string, { nome: string; icone: string; valor: number; transacoes: number }>);

    const categorias = Object.values(categoriasMap)
      .sort((a, b) => b.valor - a.valor);

    // Calcular total para porcentagens
    const totalGasto = categorias.reduce((sum, cat) => sum + cat.valor, 0);
    
    // Adicionar porcentagem a cada categoria
    const categoriasComPorcentagem = categorias.map(categoria => ({
      ...categoria,
      porcentagem: totalGasto > 0 ? (categoria.valor / totalGasto) * 100 : 0
    }));

    return {
      categorias: categoriasComPorcentagem,
      totalGasto,
      totalTransacoes: transacoesMes.length,
      dadosPizza: categoriasComPorcentagem.slice(0, 8) // Top 8 para o gráfico
    };
  }, [transacoes, obterCategoria, mesSelecionado]);

  // Tooltip customizado para o gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border dark:border-gray-600">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.icone} {data.nome}</p>
          <p className="text-red-600 font-semibold">{formatarMoeda(data.valor)}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{data.porcentagem.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Obter nome do mês para exibição
  const obterNomeMes = (mesAno: string) => {
    const [ano, mes] = mesAno.split('-').map(Number);
    const data = new Date(ano, mes - 1);
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/relatorios"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar aos Relatórios</span>
          </Link>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gastos por Categoria</h1>
        <p className="text-gray-600 dark:text-gray-400">Análise detalhada dos gastos por categoria</p>
      </div>

      {/* Seletor de Mês/Ano */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-center justify-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selecionar Mês:</label>
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {obterNomeMes(mesSelecionado)}
          </span>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gasto</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatarMoeda(dadosMes.totalGasto)}
              </p>
            </div>
            <PieChartIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorias Ativas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dadosMes.categorias.length}
              </p>
            </div>
            <PieChartIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Transações</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dadosMes.totalTransacoes}
              </p>
            </div>
            <PieChartIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {dadosMes.categorias.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Nenhuma despesa encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Não há despesas registradas para {obterNomeMes(mesSelecionado)}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Gráfico de Pizza */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Distribuição por Categoria
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosMes.dadosPizza}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="valor"
                    labelLine={false}
                  >
                    {dadosMes.dadosPizza.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lista de Categorias */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Ranking de Gastos
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {dadosMes.categorias.map((categoria, index) => (
                <div key={categoria.nome} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: CORES[index % CORES.length] }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {categoria.icone} {categoria.nome}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {categoria.transacoes} transação{categoria.transacoes !== 1 ? 'ões' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">
                      {formatarMoeda(categoria.valor)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {categoria.porcentagem.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}