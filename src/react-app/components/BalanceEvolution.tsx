import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';

export default function BalanceEvolution() {
  // Limitar a 100 transações para evolução do saldo
  const { transacoes } = useFinanceDataHybrid({ limit: 100 });

  const dadosEvolucao = useMemo(() => {
    // Filtrar transações dos últimos 30 dias
    const agora = new Date();
    const inicioMes = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const transacoesFiltradas = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicioMes && dataTransacao <= agora;
    }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    if (transacoesFiltradas.length === 0) {
      return [];
    }

    // Calcular saldo acumulado por dia
    const saldoPorDia: Record<string, number> = {};
    let saldoAcumulado = 0;

    // Inicializar com saldo zero para os últimos 30 dias
    for (let i = 30; i >= 0; i--) {
      const data = new Date(agora.getTime() - i * 24 * 60 * 60 * 1000);
      const dataStr = data.toISOString().split('T')[0];
      saldoPorDia[dataStr] = saldoAcumulado;
    }

    // Processar transações
    transacoesFiltradas.forEach(transacao => {
      const valor = transacao.tipo === 'RECEITA' ? transacao.valor : -transacao.valor;
      saldoAcumulado += valor;
      
      // Atualizar saldo para esta data e todas as datas posteriores
      const dataTransacao = transacao.data;
      Object.keys(saldoPorDia).forEach(data => {
        if (data >= dataTransacao) {
          saldoPorDia[data] = saldoAcumulado;
        }
      });
    });

    // Converter para array para o gráfico (mostrar apenas alguns pontos para não ficar muito poluído)
    const entries = Object.entries(saldoPorDia);
    const step = Math.max(1, Math.floor(entries.length / 10)); // Mostrar no máximo 10 pontos
    
    return entries
      .filter((_, index) => index % step === 0 || index === entries.length - 1)
      .map(([data, saldo]) => ({
        data: new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        saldo: saldo,
        dataCompleta: data
      }));
  }, [transacoes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border dark:border-gray-600">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className={`font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (dadosEvolucao.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Evolução do Saldo</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-500 dark:text-gray-400">Sem dados suficientes para mostrar a evolução</p>
        </div>
      </div>
    );
  }

  const saldoAtual = dadosEvolucao[dadosEvolucao.length - 1]?.saldo || 0;
  const saldoAnterior = dadosEvolucao[0]?.saldo || 0;
  const variacao = saldoAtual - saldoAnterior;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Evolução do Saldo</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Últimos 30 dias</p>
          <p className={`text-sm font-medium ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {variacao >= 0 ? '+' : ''}{formatCurrency(variacao)}
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosEvolucao}>
            <XAxis 
              dataKey="data" 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              fontSize={12}
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
