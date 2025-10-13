import React from 'react';

const SimpleDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎯 Dashboard Simplificado - Teste
        </h1>
        <p className="text-gray-600">
          Esta é uma versão simplificada do dashboard para testar se o React está funcionando corretamente.
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Receitas</p>
              <p className="text-2xl font-bold text-green-900">R$ 0,00</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">Despesas</p>
              <p className="text-2xl font-bold text-red-900">R$ 0,00</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Saldo</p>
              <p className="text-2xl font-bold text-blue-900">R$ 0,00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Teste */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-3">
          🔧 Área de Teste
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-700">React está renderizando ✓</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-700">Tailwind CSS está funcionando ✓</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-700">Componente carregou sem erros ✓</span>
          </div>
        </div>
      </div>

      {/* Botões de Teste */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🧪 Testes de Interação
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => alert('Botão funcionando!')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Testar Clique
          </button>
          <button
            onClick={() => console.log('Log no console funcionando!')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Testar Console
          </button>
          <button
            onClick={() => {
              const now = new Date().toLocaleTimeString();
              document.getElementById('time-display')!.textContent = `Última atualização: ${now}`;
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Testar DOM
          </button>
        </div>
        <div id="time-display" className="mt-3 text-sm text-gray-600">
          Clique em "Testar DOM" para ver a atualização
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;