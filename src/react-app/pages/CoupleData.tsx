import { useState } from 'react';
import { ArrowLeft, Heart, Users, Copy, Check, RefreshCw, UserPlus, Share2, Target, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router';
import { STORAGE_KEYS } from '@/react-app/lib/config';

interface CoupleConnection {
  isConnected: boolean;
  myCode: string;
  partnerName?: string;
  partnerCode?: string;
  connectionDate?: string;
}

export default function CoupleData() {
  const [coupleData, setCoupleData] = useState<CoupleConnection>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUPLE_DATA);
    return saved ? JSON.parse(saved) : {
      isConnected: false,
      myCode: generateConnectionCode(),
    };
  });

  const [partnerCode, setPartnerCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  function generateConnectionCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const saveCoupleData = (data: CoupleConnection) => {
    setCoupleData(data);
    localStorage.setItem(STORAGE_KEYS.COUPLE_DATA, JSON.stringify(data));
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupleData.myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };

  const generateNewCode = () => {
    const newCode = generateConnectionCode();
    saveCoupleData({
      ...coupleData,
      myCode: newCode
    });
  };

  const connectWithPartner = () => {
    if (partnerCode.length === 6) {
      setConnecting(true);
      
      // Simular conexão
      setTimeout(() => {
        saveCoupleData({
          ...coupleData,
          isConnected: true,
          partnerCode: partnerCode,
          partnerName: 'Parceiro(a)',
          connectionDate: new Date().toISOString()
        });
        setPartnerCode('');
        setConnecting(false);
      }, 1500);
    }
  };

  const disconnect = () => {
    saveCoupleData({
      isConnected: false,
      myCode: generateConnectionCode(),
    });
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ZetaFin - Código de Conexão',
          text: `Use este código para se conectar comigo no ZetaFin: ${coupleData.myCode}`,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
        copyCode();
      }
    } else {
      copyCode();
    }
  };

  const sharedData = [
    { label: 'Transações Compartilhadas', value: '47', icon: DollarSign },
    { label: 'Metas em Conjunto', value: '3', icon: Target },
    { label: 'Dias Conectados', value: coupleData.connectionDate ? Math.floor((Date.now() - new Date(coupleData.connectionDate).getTime()) / (1000 * 60 * 60 * 24)).toString() : '0', icon: Calendar },
  ];

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-4 p-6">
        <Link to="/perfil" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dados do Casal</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {coupleData.isConnected ? 'Conectado com seu parceiro(a)' : 'Conecte-se com seu parceiro(a)'}
          </p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {!coupleData.isConnected ? (
          <>
            {/* Meu Código de Conexão */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Meu Código de Conexão</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Compartilhe este código com seu parceiro(a)</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Seu código é:</p>
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 tracking-wider mb-4">
                    {coupleData.myCode}
                  </div>
                  
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={copyCode}
                      className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    
                    <button
                      onClick={shareCode}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </button>
                    
                    <button
                      onClick={generateNewCode}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Novo Código</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conectar com Parceiro */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conectar com Parceiro(a)</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Digite o código do seu parceiro(a)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código do Parceiro(a)
                  </label>
                  <input
                    type="text"
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="Digite o código de 6 caracteres"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-wider"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={connectWithPartner}
                  disabled={partnerCode.length !== 6 || connecting}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Conectar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Status da Conexão */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conectado</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Conectado com {coupleData.partnerName} desde {new Date(coupleData.connectionDate!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Desconectar
                </button>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-300 font-medium">Sincronização ativa</span>
                </div>
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                  Seus dados financeiros estão sendo compartilhados em tempo real
                </p>
              </div>
            </div>

            {/* Dados Compartilhados */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Dados Compartilhados</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sharedData.map((item, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Códigos de Conexão */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Códigos de Conexão</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Meu código</p>
                  <p className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">{coupleData.myCode}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Código do parceiro(a)</p>
                  <p className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">{coupleData.partnerCode}</p>
                </div>
              </div>
            </div>

            {/* Configurações de Compartilhamento */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Configurações de Compartilhamento</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Compartilhar Transações</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sincronizar todas as transações</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Compartilhar Metas</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sincronizar metas financeiras</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Compartilhar Relatórios</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sincronizar relatórios e análises</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}