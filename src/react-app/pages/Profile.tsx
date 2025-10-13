import { Settings, Heart, HelpCircle, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { STORAGE_KEYS } from '@/react-app/lib/config';

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aqui você pode adicionar a lógica de logout
    if (confirm('Tem certeza que deseja sair?')) {
      // Limpar dados de autenticação
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Redirecionar para página de login ou home
      navigate('/');
    }
  };

  const menuItems = [
    {
      icon: Settings,
      title: 'Configurações',
      description: 'Preferências do aplicativo',
      color: 'text-gray-600 dark:text-gray-400',
      path: '/perfil/configuracoes'
    },

    {
      icon: Heart,
      title: 'Dados do Casal',
      description: 'Informações compartilhadas',
      color: 'text-pink-600',
      path: '/perfil/dados-casal'
    },
    {
      icon: HelpCircle,
      title: 'Ajuda',
      description: 'Suporte e FAQ',
      color: 'text-green-600',
      path: '/perfil/ajuda'
    },
    {
      icon: LogOut,
      title: 'Sair',
      description: 'Fazer logout',
      color: 'text-red-600',
      action: handleLogout
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Perfil</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Configurações da conta</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Usuário Demo</h2>
            <p className="text-gray-600 dark:text-gray-400">demo@zetafin.com</p>
            <div className="flex items-center space-x-2 mt-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Modo demonstração</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {menuItems.map((item, index) => {
            if (item.action) {
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className={`w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={index}
                to={item.path}
                className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 block"
              >
                <div className={`w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
                <div className="text-gray-400 dark:text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* App Info */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">ZetaFin v1.0.0</p>
        <p className="text-gray-400 text-xs mt-1">Desenvolvido com ❤️ para casais</p>
      </div>
    </div>
  );
}
