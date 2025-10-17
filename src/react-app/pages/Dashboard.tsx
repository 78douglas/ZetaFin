import React, { useEffect, memo, useState } from 'react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { useCategoriesHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import BalanceCard from '@/react-app/components/BalanceCard';
import ExpensesByCategory from '@/react-app/components/ExpensesByCategory';
import { Receipt, Database, Users, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { executeCompleteSystemCleanup } from '@/react-app/utils/cleanupSystem';

import { DATE_UTILS } from '@/react-app/lib/config';

const Dashboard = memo(() => {
  // Limitar a 50 transações no Dashboard para melhor performance
  const { loading, estatisticas, transacoes, obterCategoria, recarregarDados } = useFinanceDataHybrid({ limit: 50 });
  const { categories } = useCategoriesHybrid();
  
  // Estado para teste do menu
  const [showTestMenu, setShowTestMenu] = useState(false);

  // Limpeza automática removida - sistema já foi limpo

  // Dados de exemplo para demonstração
  const exemploTransacoes = [
        {
          "data": "2025-06-01",
          "tipo": "Recebimento",
          "descricao": "Salário Ana",
          "categoria": "Renda",
          "valor": 4800.00,
          "pago_por": "Ana",
          "observacoes": "Salário mensal"
        },
        {
          "data": "2025-06-01",
          "tipo": "Recebimento",
          "descricao": "Salário João",
          "categoria": "Renda",
          "valor": 5200.00,
          "pago_por": "João",
          "observacoes": "Salário mensal"
        },
        {
          "data": "2025-06-02",
          "tipo": "Pagamento",
          "descricao": "Supermercado",
          "categoria": "Alimentação",
          "valor": 320.50,
          "pago_por": "Ana",
          "observacoes": "Compras da semana"
        },
        {
          "data": "2025-06-05",
          "tipo": "Pagamento",
          "descricao": "Aluguel",
          "categoria": "Moradia",
          "valor": 2000.00,
          "pago_por": "João",
          "observacoes": "Apartamento 2 quartos"
        },
        {
          "data": "2025-06-07",
          "tipo": "Pagamento",
          "descricao": "Conta de energia",
          "categoria": "Moradia",
          "valor": 180.30,
          "pago_por": "Ana",
          "observacoes": "Maio/Junho"
        },
        {
          "data": "2025-06-10",
          "tipo": "Pagamento",
          "descricao": "Restaurante",
          "categoria": "Lazer",
          "valor": 150.00,
          "pago_por": "Ana",
          "observacoes": "Restaurante"
        },
        {
          "data": "2025-07-08",
          "tipo": "Pagamento",
          "descricao": "Gasolina",
          "categoria": "Transporte",
          "valor": 250.00,
          "pago_por": "João",
          "observacoes": "Abastecimento"
        },
        {
          "data": "2025-07-10",
          "tipo": "Pagamento",
          "descricao": "Internet",
          "categoria": "Moradia",
          "valor": 120.00,
          "pago_por": "Ana",
          "observacoes": "Plano 300 Mbps"
        },
        {
          "data": "2025-07-12",
          "tipo": "Recebimento",
          "descricao": "Venda de roupas usadas",
          "categoria": "Renda extra",
          "valor": 180.00,
          "pago_por": "Ana",
          "observacoes": "Brechó online"
        },
        {
          "data": "2025-07-15",
          "tipo": "Pagamento",
          "descricao": "Farmácia",
          "categoria": "Saúde",
          "valor": 85.60,
          "pago_por": "João",
          "observacoes": "Remédio e vitaminas"
        },
        {
          "data": "2025-07-20",
          "tipo": "Pagamento",
          "descricao": "Cinema",
          "categoria": "Lazer",
          "valor": 80.00,
          "pago_por": "Ambos",
          "observacoes": "Ingresso + pipoca"
        },
        {
          "data": "2025-07-25",
          "tipo": "Pagamento",
          "descricao": "Mercado",
          "categoria": "Alimentação",
          "valor": 310.50,
          "pago_por": "Ana",
          "observacoes": "Compras mensais"
        },
        {
          "data": "2025-07-30",
          "tipo": "Pagamento",
          "descricao": "Academia",
          "categoria": "Saúde",
          "valor": 220.00,
          "pago_por": "João",
          "observacoes": "Mensalidade"
        },
        {
          "data": "2025-08-01",
          "tipo": "Recebimento",
          "descricao": "Salário Ana",
          "categoria": "Renda",
          "valor": 4800.00,
          "pago_por": "Ana",
          "observacoes": "Salário mensal"
        },
        {
          "data": "2025-08-01",
          "tipo": "Recebimento",
          "descricao": "Salário João",
          "categoria": "Renda",
          "valor": 5200.00,
          "pago_por": "João",
          "observacoes": "Salário mensal"
        },
        {
          "data": "2025-08-02",
          "tipo": "Pagamento",
          "descricao": "Supermercado",
          "categoria": "Alimentação",
          "valor": 340.90,
          "pago_por": "Ana",
          "observacoes": "Semana 1"
        },
        {
          "data": "2025-08-05",
          "tipo": "Pagamento",
          "descricao": "Aluguel",
          "categoria": "Moradia",
          "valor": 2000.00,
          "pago_por": "João",
          "observacoes": "Depósito conjunto"
        },
        {
          "data": "2025-08-07",
          "tipo": "Pagamento",
          "descricao": "Conta de energia",
          "categoria": "Moradia",
          "valor": 215.50,
          "pago_por": "Ana",
          "observacoes": "Julho/Agosto"
        },
        {
          "data": "2025-08-10",
          "tipo": "Pagamento",
          "descricao": "Restaurante",
          "categoria": "Lazer",
          "valor": 180.00,
          "pago_por": "João",
          "observacoes": "Aniversário"
        },
        {
          "data": "2025-08-13",
          "tipo": "Pagamento",
          "descricao": "Gasolina",
          "categoria": "Transporte",
          "valor": 260.00,
          "pago_por": "João",
          "observacoes": ""
        },
        {
          "data": "2025-08-15",
          "tipo": "Recebimento",
          "descricao": "Cashback cartão",
          "categoria": "Renda extra",
          "valor": 35.00,
          "pago_por": "Ana",
          "observacoes": "App banco"
        },
        {
          "data": "2025-08-18",
          "tipo": "Pagamento",
          "descricao": "Farmácia",
          "categoria": "Saúde",
          "valor": 120.00,
          "pago_por": "Ana",
          "observacoes": "Remédio"
        },
        {
          "data": "2025-08-20",
          "tipo": "Pagamento",
          "descricao": "Cinema",
          "categoria": "Lazer",
          "valor": 75.00,
          "pago_por": "Ambos",
          "observacoes": ""
        },
        {
          "data": "2025-08-23",
          "tipo": "Pagamento",
          "descricao": "Mercado",
          "categoria": "Alimentação",
          "valor": 310.00,
          "pago_por": "Ana",
          "observacoes": ""
        },
        {
          "data": "2025-08-29",
          "tipo": "Pagamento",
          "descricao": "Internet",
          "categoria": "Moradia",
          "valor": 120.00,
          "pago_por": "João",
          "observacoes": ""
        },
        {
          "data": "2025-09-01",
          "tipo": "Recebimento",
          "descricao": "Salário Ana",
          "categoria": "Renda",
          "valor": 4800.00,
          "pago_por": "Ana",
          "observacoes": "Salário mensal"
        },
        {
          "data": "2025-09-01",
          "tipo": "Recebimento",
          "descricao": "Salário João",
          "categoria": "Renda",
          "valor": 5200.00,
          "pago_por": "João",
          "observacoes": "Salário mensal"
        },
        {
          "data": "2025-09-02",
          "tipo": "Pagamento",
          "descricao": "Supermercado",
          "categoria": "Alimentação",
          "valor": 330.00,
          "pago_por": "Ana",
          "observacoes": "Semana 1"
        }
      ];


  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  // Últimas 5 transações
  const ultimasTransacoes = (transacoes || [])
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  // Agrupar últimas transações por data (YYYY-MM-DD)
  const gruposPorData = ultimasTransacoes.reduce((acc: Record<string, any[]>, t) => {
    const key = (t.data || '').split('T')[0];
    acc[key] = acc[key] ? [...acc[key], t] : [t];
    return acc;
  }, {} as Record<string, any[]>);
  const datasOrdenadasDesc = Object.keys(gruposPorData).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return DATE_UTILS.formatToBrazilian(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Visão geral das finanças</p>
      </div>

      {/* Menu de teste removido para focar no layout do Dashboard */}


      {/* Balance Cards */}
      <div>
        <BalanceCard estatisticas={estatisticas} />
      </div>

      {/* Gráficos */}
      <div className="space-y-6">
        <ExpensesByCategory />
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transações Recentes</h2>
          <div className="flex space-x-2">
            <Link
              to="/nova-transacao"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Nova Transação
            </Link>
          </div>
        </div>

        {ultimasTransacoes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm">
            <Receipt className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Nenhuma transação ainda</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-4">Comece adicionando uma receita ou despesa</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {datasOrdenadasDesc.map((isoDate) => (
<div key={isoDate}>
<div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
{DATE_UTILS.formatToBrazilian(isoDate)}
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {gruposPorData[isoDate].map((transacao) => {
                      const categoria = transacao.categoria || obterCategoria(transacao.categoria_id);
                      return (
                        <div key={transacao.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600 dark:bg-gray-500">
                                <span className="text-white text-xs">{categoria?.icone || '📝'}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{transacao.descricao}</h4>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>{categoria?.nome || 'Outros'}</span>
                                  <span>•</span>
                                  <span className={`${transacao.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-medium`}>
                                    {transacao.tipo === 'RECEITA' ? '+ Receita' : '- Despesa'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className={`font-bold text-sm ${transacao.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(transacao.valor)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transacao.data)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
               </div>
            
            {/* Link para ver todas as transações */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
              <Link
                to="/transacoes"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Ver todas as transações
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Dashboard;
