import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { EstatisticasFinanceiras } from '@/shared/types';

interface BalanceCardProps {
  estatisticas: EstatisticasFinanceiras;
}

export default function BalanceCard({ estatisticas }: BalanceCardProps) {
  const { saldoTotal, totalReceitas } = estatisticas;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Simulando dados individuais (em uma implementação real, isso viria do backend)
  const saldoConjunto = saldoTotal * 0.6; // 60% do saldo total
  const saldoIndividualUsuario = totalReceitas * 0.58; // Simulação baseada nas receitas
  const saldoIndividualParceiro = totalReceitas * 0.54; // Simulação baseada nas receitas

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Saldo Total do Casal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Saldo Total do Casal</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(saldoTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Conjunto */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Saldo Conjunto</p>
            <p className={`text-lg font-bold ${saldoConjunto >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-red-600'}`}>
              {saldoConjunto < 0 ? '-' : ''}{formatCurrency(Math.abs(saldoConjunto))}
            </p>
          </div>
        </div>
      </div>

      {/* Seu Saldo Individual */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Seu Saldo Individual</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(saldoIndividualUsuario)}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Individual Parceiro(a) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Saldo Individual Parceiro(a)</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(saldoIndividualParceiro)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
