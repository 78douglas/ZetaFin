import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';

export default function TestMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    console.log('🔍 Test menu toggle clicked, current state:', showMenu);
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Teste do Menu</h2>
      
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleToggle}
          className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer border border-gray-300"
          type="button"
        >
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Usuário Teste</p>
            <p className="text-xs text-gray-500">teste@zetafin.com</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="py-2">
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Perfil
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Configurações
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        Estado do menu: {showMenu ? 'Aberto' : 'Fechado'}
      </p>
    </div>
  );
}