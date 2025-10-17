import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#06b6d4', '#10b981'
];

export default function ExpensesByCategory() {
  // Limitar a 200 transações para análise de categorias
  const { transacoes, obterCategoria } = useFinanceDataHybrid({ limit: 200 });

  const despesasPorCategoria = useMemo(() => {
    // Filtrar transações dos últimos 3 meses
    const agora = new Date();
    const inicioAnalise = new Date(agora.getFullYear(), agora.getMonth() - 2, 1); // 3 meses atrás
    const fimAnalise = agora;

    const transacoesAnalise = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return t.tipo === 'DESPESA' && 
             dataTransacao >= inicioAnalise && 
             dataTransacao <= fimAnalise;
    });

    // Agrupar por categoria
    const categoriasMap = transacoesAnalise.reduce((acc, transacao) => {
      const categoria = obterCategoria(transacao.categoria_id);
      
      // Compatibilidade: categorias padrão usam 'name' e 'icon', categorias locais usam 'nome' e 'icone'
      const nomeCategoria = categoria?.name || categoria?.nome || 'Outros';
      const iconeCategoria = categoria?.icon || categoria?.icone || '📝';
      
      if (!acc[nomeCategoria]) {
        acc[nomeCategoria] = {
          nome: nomeCategoria,
          icone: iconeCategoria,
          valor: 0
        };
      }
      acc[nomeCategoria].valor += Math.abs(transacao.valor);
      return acc;
    }, {} as Record<string, { nome: string; icone: string; valor: number }>);

    const categorias = Object.values(categoriasMap)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8); // Top 8 categorias

    // Calcular total para porcentagens
    const total = categorias.reduce((sum, cat) => sum + cat.valor, 0);
    
    // Adicionar porcentagem a cada categoria
    return categorias.map(categoria => ({
      ...categoria,
      porcentagem: total > 0 ? (categoria.valor / total) * 100 : 0
    }));
  }, [transacoes, obterCategoria]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border dark:border-gray-600">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.icone} {data.nome}</p>
          <p className="text-red-600 font-semibold">{formatCurrency(data.valor)}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{data.porcentagem.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (despesasPorCategoria.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Despesas por Categoria</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa registrada este mês</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Despesas por Categoria</h3>
      
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={despesasPorCategoria}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="valor"
              labelLine={false}
            >
              {despesasPorCategoria.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Lista das categorias */}
      <div className="space-y-2">
        {despesasPorCategoria.slice(0, 5).map((categoria, index) => (
          <div key={categoria.nome} className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-sm text-gray-900 dark:text-gray-100">{categoria.icone} {categoria.nome} - {categoria.porcentagem.toFixed(1)}%</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(categoria.valor)}
              </span>
            </div>
          </div>
        ))}
        {despesasPorCategoria.length > 5 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
            +{despesasPorCategoria.length - 5} outras categorias
          </p>
        )}
      </div>
    </div>
  );
}
