import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Receipt, Plus, BarChart3, User, LogOut, ChevronDown, RefreshCw, ArrowDown, ArrowUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const expandedMenuRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, label: 'Início' },
    { name: 'Transações', href: '/transacoes', icon: MessageSquare, label: 'Transações' },
    { name: 'Nova Transação', href: '/nova-transacao', icon: Plus, label: 'Nova', isCenter: true },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3, label: 'Planejamento' },
    { name: 'Perfil', href: '/perfil', icon: User, label: 'Perfil' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (expandedMenuRef.current && !expandedMenuRef.current.contains(event.target as Node)) {
        setIsMenuExpanded(false);
      }
    };

    if (showUserMenu || isMenuExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, isMenuExpanded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZF</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ZetaFin
                </h1>
              </div>
            </div>
            
            {/* User Info */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors cursor-pointer relative z-10"
                type="button"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                  style={{ 
                    top: '100%'
                  }}
                >
                  <div className="py-1">
                    <Link
                      to="/perfil"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Forçar reload completo da aplicação
                        window.location.reload();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recarregar App
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 z-50">
        <div className="flex items-center justify-around h-20 px-4 relative">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                item.isCenter ? 'relative' : 'flex-1'
              }`}
            >
              {item.isCenter ? (
                <div className="relative flex items-center justify-center" ref={expandedMenuRef}>
                  {/* Botões circulares coloridos para despesas e receitas - só aparecem quando expandido */}
                  <div 
                    className={`absolute -top-6 -left-10 z-10 transition-all duration-300 ease-in-out ${
                      isMenuExpanded 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-50 translate-y-2 pointer-events-none'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/nova-transacao?tipo=DESPESA');
                      setIsMenuExpanded(false);
                    }}
                  >
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors cursor-pointer hover:scale-110 transform">
                      <ArrowDown className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div 
                    className={`absolute -top-6 -right-10 z-10 transition-all duration-300 ease-in-out ${
                      isMenuExpanded 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-50 translate-y-2 pointer-events-none'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/nova-transacao?tipo=RECEITA');
                      setIsMenuExpanded(false);
                    }}
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors cursor-pointer hover:scale-110 transform">
                      <ArrowUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Botão central azul */}
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105 transform cursor-pointer ${
                      isActive(item.href)
                        ? 'bg-blue-600 shadow-blue-600/30'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsMenuExpanded(!isMenuExpanded);
                    }}
                  >
                    <item.icon className={`w-8 h-8 text-white transition-transform duration-300 ${
                      isMenuExpanded ? 'rotate-45' : 'rotate-0'
                    }`} />
                  </div>
                  
                  {/* Label do botão central */}
                  <span className={`absolute -bottom-6 text-xs font-medium ${
                    isActive(item.href)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  <div className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                    <item.icon className={`w-6 h-6 ${
                      isActive(item.href)
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </div>
                  <span className={`text-xs font-medium mt-1 ${
                    isActive(item.href)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
