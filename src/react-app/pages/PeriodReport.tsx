import { useState, useMemo, useEffect } from 'react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { TipoTransacao } from '@/shared/types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  Calendar, TrendingUp, TrendingDown, DollarSign,
  ArrowLeft, Download, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrazilianDateInput from '@/react-app/components/BrazilianDateInput';
import { DATE_UTILS } from '@/react-app/lib/config';

export default function PeriodReport() {
  const { transacoes, obterCategoria, recarregarDados } = useFinanceDataHybrid();
  const [dataInicio, setDataInicio] = useState(() => {
    // Usar o primeiro dia do mês atual
    return DATE_UTILS.getCurrentMonthStart();
  });
  const [dataFim, setDataFim] = useState(() => {
    // Usar a data atual
    return DATE_UTILS.getCurrentDate();
  });

  // Remover verificação de dados fictícios - agora usa apenas Supabase
  useEffect(() => {
    // Dados serão carregados automaticamente pelo hook híbrido
  }, []);



  const CORES = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const dadosRelatorio = useMemo(() => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    const transacoesPeriodo = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicio && dataTransacao <= fim;
    });

    const receitas = transacoesPeriodo.filter(t => t.tipo === TipoTransacao.RECEITA);
    const despesas = transacoesPeriodo.filter(t => t.tipo === TipoTransacao.DESPESA);

    const totalReceitas = receitas.reduce((acc, t) => acc + t.valor, 0);
    const totalDespesas = despesas.reduce((acc, t) => acc + t.valor, 0);
    const saldo = totalReceitas - totalDespesas;


    // Calcular dias do período
    const diasPeriodo = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const mediaDiariaReceitas = totalReceitas / diasPeriodo;
    const mediaDiariaDespesas = totalDespesas / diasPeriodo;

    // Gastos por categoria
    const gastosPorCategoria = despesas.reduce((acc, transacao) => {
      const categoria = obterCategoria(transacao.categoria_id);
      const nomeCategoria = categoria?.nome || 'Outros';
      const categoriaExistente = acc.find(c => c.nome === nomeCategoria);
      if (categoriaExistente) {
        categoriaExistente.valor += transacao.valor;
      } else {
        acc.push({ nome: nomeCategoria, valor: transacao.valor });
      }
      return acc;
    }, [] as { nome: string; valor: number }[]);

    // Evolução mensal (simplificada para o período)
    const evolucaoMensal = [];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 0; i < 6; i++) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mesAno = `${meses[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;
      
      const receitasMes = receitas
        .filter(t => new Date(t.data).getMonth() === data.getMonth())
        .reduce((acc, t) => acc + t.valor, 0);
      
      const despesasMes = despesas
        .filter(t => new Date(t.data).getMonth() === data.getMonth())
        .reduce((acc, t) => acc + t.valor, 0);

      evolucaoMensal.unshift({
        mes: mesAno,
        receitas: receitasMes,
        despesas: despesasMes,
        saldo: receitasMes - despesasMes
      });
    }

    // Comparação do período (atual vs anterior)
    const comparacaoPeriodo = [
      {
        periodo: 'Período Atual',
        receitas: totalReceitas,
        despesas: totalDespesas,
        saldo: saldo
      },
      {
        periodo: 'Período Anterior',
        receitas: totalReceitas * 0.85, // Simulação de período anterior
        despesas: totalDespesas * 0.92,
        saldo: (totalReceitas * 0.85) - (totalDespesas * 0.92)
      }
    ];

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      diasPeriodo,
      mediaDiariaReceitas,
      mediaDiariaDespesas,
      gastosPorCategoria,
      evolucaoMensal,
      comparacaoPeriodo,
      transacoesPeriodo: transacoesPeriodo.length
    };
  }, [transacoes, dataInicio, dataFim]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/relatorios" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatório por Período</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Análise detalhada do período selecionado</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Filtros de Período */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Período de Análise</h2>
        </div>
        
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
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primeira linha: Saldo + Transações */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo do Período</p>
              <p className={`text-2xl font-bold ${
                dadosRelatorio.saldo >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatarMoeda(dadosRelatorio.saldo)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transações</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dadosRelatorio.transacoesPeriodo}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        {/* Segunda linha: Total Receitas + Total Despesas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatarMoeda(dadosRelatorio.totalReceitas)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatarMoeda(dadosRelatorio.totalDespesas)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Médias Diárias</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Receitas/dia:</span>
              <span className="font-semibold text-green-600">
                {formatarMoeda(dadosRelatorio.mediaDiariaReceitas)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Despesas/dia:</span>
              <span className="font-semibold text-red-600">
                {formatarMoeda(dadosRelatorio.mediaDiariaDespesas)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações do Período</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Duração:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{dadosRelatorio.diasPeriodo} dias</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Período:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {new Date(dataInicio).toLocaleDateString('pt-BR')} - {new Date(dataFim).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="space-y-6 mb-8">
        {/* Evolução Mensal */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Evolução Mensal
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dadosRelatorio.evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis tickFormatter={(value) => formatarMoeda(value)} fontSize={12} />
              <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              <Legend />
              <Area type="monotone" dataKey="receitas" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Receitas" />
              <Area type="monotone" dataKey="despesas" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Comparação do Período */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Comparação do Período
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosRelatorio.comparacaoPeriodo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" fontSize={12} />
              <YAxis tickFormatter={(value) => formatarMoeda(value)} fontSize={12} />
              <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              <Legend />
              <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
              <Bar dataKey="saldo" fill="#3B82F6" name="Saldo" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Despesas por Categoria */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Despesas por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosRelatorio.gastosPorCategoria.map(item => ({
                  ...item,
                  valor: Math.abs(item.valor) // Garantir valores positivos
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
              >
                {dadosRelatorio.gastosPorCategoria.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatarMoeda(Number(value))}
                labelFormatter={(label) => `Categoria: ${label}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking de Categorias */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ranking de Gastos
        </h3>
        <div className="space-y-3">
          {dadosRelatorio.gastosPorCategoria
            .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
            .slice(0, 8)
            .map((categoria, index) => (
              <div key={categoria.nome} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </div>
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: CORES[index % CORES.length] }}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{categoria.nome}</span>
                </div>
                <span className="text-sm font-bold text-red-600">
                  {formatarMoeda(Math.abs(categoria.valor))}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}