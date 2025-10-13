import { useState, useMemo } from 'react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { TipoTransacao } from '@/shared/types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Calendar, TrendingUp, TrendingDown, DollarSign, 
  ArrowLeft, Download, Filter 
} from 'lucide-react';
import { Link } from 'react-router';

export default function MonthlyReport() {
  const { transacoes, obterCategoria } = useFinanceDataHybrid();
  
  // Estado para filtros
  const [mesAno, setMesAno] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  // Dados do relatório mensal
  const dadosRelatorio = useMemo(() => {
    const [ano, mes] = mesAno.split('-').map(Number);
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0);
    
    const transacoesMes = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicioMes && dataTransacao <= fimMes;
    });

    // Estatísticas básicas
    const receitas = transacoesMes.filter(t => t.tipo === TipoTransacao.RECEITA);
    const despesas = transacoesMes.filter(t => t.tipo === TipoTransacao.DESPESA);
    
    const totalReceitas = receitas.reduce((sum, t) => sum + t.valor, 0);
    const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0);
    const saldo = totalReceitas - totalDespesas;

    // Maior receita e despesa
    const maiorReceita = receitas.reduce((max, t) => t.valor > max.valor ? t : max, receitas[0] || { valor: 0, descricao: 'N/A' });
    const maiorDespesa = despesas.reduce((max, t) => t.valor > max.valor ? t : max, despesas[0] || { valor: 0, descricao: 'N/A' });

    // Dados por categoria
    const gastosPorCategoria = despesas.reduce((acc, transacao) => {
      const categoria = obterCategoria(transacao.categoriaId);
      const nomeCategoria = categoria?.nome || 'Outros';
      const iconeCategoria = categoria?.icone || '📝';
      
      if (!acc[nomeCategoria]) {
        acc[nomeCategoria] = {
          nome: nomeCategoria,
          icone: iconeCategoria,
          valor: 0
        };
      }
      acc[nomeCategoria].valor += transacao.valor;
      return acc;
    }, {} as Record<string, { nome: string; icone: string; valor: number }>);

    const receitasPorCategoria = receitas.reduce((acc, transacao) => {
      const categoria = obterCategoria(transacao.categoriaId);
      const nomeCategoria = categoria?.nome || 'Outros';
      acc[nomeCategoria] = (acc[nomeCategoria] || 0) + transacao.valor;
      return acc;
    }, {} as Record<string, number>);

    // Evolução diária
    const evolucaoDiaria = [];
    for (let dia = 1; dia <= fimMes.getDate(); dia++) {
      const dataAtual = new Date(ano, mes - 1, dia);
      const dataStr = dataAtual.toISOString().split('T')[0];
      
      const transacoesDia = transacoesMes.filter(t => t.data === dataStr);
      const receitasDia = transacoesDia.filter(t => t.tipo === TipoTransacao.RECEITA).reduce((sum, t) => sum + t.valor, 0);
      const despesasDia = transacoesDia.filter(t => t.tipo === TipoTransacao.DESPESA).reduce((sum, t) => sum + t.valor, 0);
      
      evolucaoDiaria.push({
        dia: dia.toString(),
        receitas: receitasDia,
        despesas: despesasDia,
        saldo: receitasDia - despesasDia
      });
    }

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      maiorReceita,
      maiorDespesa,
      quantidadeTransacoes: transacoesMes.length,
      gastosPorCategoria: (() => {
        const categorias = Object.values(gastosPorCategoria)
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 8); // Top 8 categorias
        
        const total = categorias.reduce((sum, cat) => sum + cat.valor, 0);
        
        return categorias.map(categoria => ({
          ...categoria,
          porcentagem: total > 0 ? (categoria.valor / total) * 100 : 0
        }));
      })(),
      receitasPorCategoria: Object.entries(receitasPorCategoria).map(([nome, valor]) => ({ nome, valor })),
      evolucaoDiaria,
      transacoesMes
    };
  }, [transacoes, mesAno, obterCategoria]);

  // Cores para gráficos
  const CORES = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const exportarRelatorio = () => {
    const dadosExport = {
      periodo: mesAno,
      estatisticas: {
        totalReceitas: dadosRelatorio.totalReceitas,
        totalDespesas: dadosRelatorio.totalDespesas,
        saldo: dadosRelatorio.saldo,
        quantidadeTransacoes: dadosRelatorio.quantidadeTransacoes
      },
      gastosPorCategoria: dadosRelatorio.gastosPorCategoria,
      receitasPorCategoria: dadosRelatorio.receitasPorCategoria,
      evolucaoDiaria: dadosRelatorio.evolucaoDiaria,
      transacoes: dadosRelatorio.transacoesMes
    };

    const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-mensal-${mesAno}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/relatorios" 
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar aos Relatórios
              </Link>
            </div>
            <button
              onClick={exportarRelatorio}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Relatório Mensal
          </h1>
          
          {/* Filtro de Mês/Ano */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Período:
              </label>
              <input
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="space-y-6 mb-8">
          {/* Primeira linha: Saldo + Transações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo</p>
                  <p className={`text-2xl font-bold ${dadosRelatorio.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatarMoeda(dadosRelatorio.saldo)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transações</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {dadosRelatorio.quantidadeTransacoes}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Segunda linha: Total Receitas + Total Despesas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Receitas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatarMoeda(dadosRelatorio.totalReceitas)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Despesas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatarMoeda(dadosRelatorio.totalDespesas)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Pizza - Gastos por Categoria */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Gastos por Categoria
          </h3>
          
          {dadosRelatorio.gastosPorCategoria.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa registrada este mês</p>
            </div>
          ) : (
            <>
              <div className="h-80 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosRelatorio.gastosPorCategoria}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="valor"
                      labelLine={false}
                    >
                      {dadosRelatorio.gastosPorCategoria.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
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
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Lista das categorias com legendas */}
              <div className="space-y-2">
                {dadosRelatorio.gastosPorCategoria.slice(0, 5).map((categoria, index) => (
                  <div key={categoria.nome} className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CORES[index % CORES.length] }}
                      ></div>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {categoria.icone} {categoria.nome} - {categoria.porcentagem.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-red-600">
                        {formatarMoeda(categoria.valor)}
                      </span>
                    </div>
                  </div>
                ))}
                {dadosRelatorio.gastosPorCategoria.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                    +{dadosRelatorio.gastosPorCategoria.length - 5} outras categorias
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Evolução Diária */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Evolução Diária
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosRelatorio.evolucaoDiaria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" fontSize={12} />
              <YAxis tickFormatter={(value) => formatarMoeda(value)} fontSize={12} />
              <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={2} name="Receitas" />
              <Line type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={2} name="Despesas" />
              <Line type="monotone" dataKey="saldo" stroke="#3B82F6" strokeWidth={2} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detalhes Adicionais */}
        <div className="space-y-6">
          {/* Todas as Transações */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Todas as Transações
            </h3>
            {dadosRelatorio.transacoesMes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma transação encontrada para este período
                </p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3">
                {dadosRelatorio.transacoesMes
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((transacao, index) => {
                    const categoria = obterCategoria(transacao.categoriaId);
                    const dataFormatada = new Date(transacao.data).toLocaleDateString('pt-BR');
                    
                    return (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="text-lg flex-shrink-0">
                            {categoria?.icone || '📝'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {transacao.descricao}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {dataFormatada}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {categoria?.nome || 'Outros'}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          <p className={`font-bold text-sm ${
                            transacao.tipo === TipoTransacao.RECEITA 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transacao.tipo === TipoTransacao.RECEITA ? '+' : '-'}{formatarMoeda(transacao.valor)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Ranking de Categorias de Receita */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Receitas por Categoria
            </h3>
            <div className="space-y-3">
              {dadosRelatorio.receitasPorCategoria
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 5)
                .map((categoria, index) => (
                  <div key={categoria.nome} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: CORES[index % CORES.length] }}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{categoria.nome}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatarMoeda(categoria.valor)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}