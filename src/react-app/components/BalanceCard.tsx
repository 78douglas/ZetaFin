import React, { useState, useEffect, useMemo, memo } from 'react';
import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { TipoTransacao } from '@/shared/types';
import { Meta } from '@/react-app/types/goals';
import { DATE_UTILS } from '@/react-app/lib/config';

const BalanceCard = memo(() => {
  const { transacoes } = useFinanceDataHybrid();
  const [showBalance, setShowBalance] = useState(true);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(DATE_UTILS.getCurrentMonth());
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'long' });
      const labelCap = label.charAt(0).toUpperCase() + label.slice(1);
      return { value, label: labelCap };
    });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const receitasMes = useMemo(() => {
    return transacoes
      .filter(t => t.tipo === TipoTransacao.RECEITA && t.data.slice(0, 7) === selectedMonth)
      .reduce((total, t) => total + t.valor, 0);
  }, [transacoes, selectedMonth]);

  const despesasMes = useMemo(() => {
    return transacoes
      .filter(t => t.tipo === TipoTransacao.DESPESA && t.data.slice(0, 7) === selectedMonth)
      .reduce((total, t) => total + t.valor, 0);
  }, [transacoes, selectedMonth]);

  const saldoMes = receitasMes - despesasMes;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
      {/* Seletor de mês central em formato pill */}
      <div className="flex justify-center mb-2">
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 shadow-sm"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Saldo em conta + toggle de visibilidade */}
      <div className="text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">Saldo em conta</p>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {showBalance ? formatCurrency(saldoMes) : '•••••'}
          </span>
          <button
            onClick={() => setShowBalance((s) => !s)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            type="button"
            aria-label={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {showBalance ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* Cards pequenos: Receitas e Despesas */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Receitas</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {showBalance ? formatCurrency(receitasMes) : '•••••'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Despesas</p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                {showBalance ? formatCurrency(despesasMes) : '•••••'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BalanceCard.displayName = 'BalanceCard';

export default BalanceCard;
