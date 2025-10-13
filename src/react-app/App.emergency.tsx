import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";
import { Toaster } from "sonner";

// Componente de teste simples
const TestPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 {title} - Modo de Teste
          </h1>
          <p className="text-gray-600 mb-4">
            Esta é uma versão simplificada para testar se o React Router está funcionando.
          </p>
          
          {/* Menu de navegação simples */}
          <nav className="bg-gray-100 rounded-lg p-4">
            <h2 className="font-semibold mb-3">Navegação de Teste:</h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Dashboard
              </Link>
              <Link to="/transacoes" className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Transações
              </Link>
              <Link to="/relatorios" className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                Relatórios
              </Link>
              <Link to="/configuracoes" className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                Configurações
              </Link>
            </div>
          </nav>
        </div>

        {/* Área de conteúdo específico da página */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Conteúdo da Página: {title}</h2>
          
          {title === 'Dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <h3 className="font-medium text-green-800">Receitas</h3>
                  <p className="text-2xl font-bold text-green-900">R$ 0,00</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h3 className="font-medium text-red-800">Despesas</h3>
                  <p className="text-2xl font-bold text-red-900">R$ 0,00</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h3 className="font-medium text-blue-800">Saldo</h3>
                  <p className="text-2xl font-bold text-blue-900">R$ 0,00</p>
                </div>
              </div>
            </div>
          )}

          {title === 'Transações' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-800">
                  📝 Aqui seria exibida a lista de transações. 
                  No momento, estamos testando apenas a navegação.
                </p>
              </div>
            </div>
          )}

          {title === 'Relatórios' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded p-4">
                <p className="text-purple-800">
                  📊 Aqui seriam exibidos os relatórios financeiros.
                  No momento, estamos testando apenas a navegação.
                </p>
              </div>
            </div>
          )}

          {title === 'Configurações' && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <p className="text-gray-800">
                  ⚙️ Aqui seriam exibidas as configurações da aplicação.
                  No momento, estamos testando apenas a navegação.
                </p>
              </div>
            </div>
          )}

          {/* Botões de teste */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-3">Testes de Funcionalidade:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => alert(`Página ${title} funcionando!`)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Testar Alert
              </button>
              <button
                onClick={() => console.log(`Console log da página ${title}`)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Testar Console
              </button>
              <button
                onClick={() => {
                  const timestamp = new Date().toLocaleTimeString();
                  const element = document.getElementById('timestamp');
                  if (element) element.textContent = `Última ação: ${timestamp}`;
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
              >
                Testar DOM
              </button>
            </div>
            <div id="timestamp" className="mt-2 text-sm text-gray-600">
              Clique em "Testar DOM" para ver a atualização
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// App de emergência simplificado
export default function EmergencyApp() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<TestPage title="Dashboard" />} />
            <Route path="/transacoes" element={<TestPage title="Transações" />} />
            <Route path="/relatorios" element={<TestPage title="Relatórios" />} />
            <Route path="/configuracoes" element={<TestPage title="Configurações" />} />
            <Route path="*" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
                  <p className="text-gray-600 mb-4">A página que você está procurando não existe.</p>
                  <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Voltar ao Dashboard
                  </Link>
                </div>
              </div>
            } />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}