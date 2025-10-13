import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Moon, Sun, Download, Info, Palette, Edit3, ChevronDown, FileText, Database, FileSpreadsheet, RefreshCw, Plus, Trash2, AlertTriangle, Upload } from 'lucide-react';
import { Link } from 'react-router';
import { useTheme } from '@/react-app/contexts/ThemeContext';
import { useEditMode } from '@/react-app/contexts/EditModeContext';
import { useExport } from '@/react-app/contexts/ExportContext';
import { useDatabase } from '@/react-app/hooks/useDatabase';
import { toast } from 'sonner';
import { executeCompleteSystemCleanup, verifySystemIsClean, resetCategoriesToDefault } from '@/react-app/utils/cleanupSystem';
import { STORAGE_KEYS } from '@/react-app/lib/config';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { isEditMode, toggleEditMode } = useEditMode();
  const { exportToCSV, exportToJSON, exportToPDF } = useExport();
  const { insertFictitiousData, resetUserData, checkLocalStorageData, loading: dbLoading, forceReset } = useDatabase();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetConfirmationStep, setResetConfirmationStep] = useState(0);
  const [localDataInfo, setLocalDataInfo] = useState({ hasLocalData: false, transactionCount: 0, categoryCount: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Verificar dados locais ao carregar a página
    const localData = checkLocalStorageData();
    setLocalDataInfo(localData);
  }, []); // Remover dependência para evitar loop infinito

  const handleInsertFictitiousData = async () => {
    if (dbLoading) {
      return; // Evitar múltiplas chamadas
    }
    
    try {
      console.log('📥 Iniciando carregamento de dados do arquivo dados.json...');
      
      // Tentar carregar o arquivo dados.json
      const response = await fetch('/dados.json');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados.json: ${response.status} ${response.statusText}`);
      }
      
      const dadosJSON = await response.json();
      
      if (!Array.isArray(dadosJSON) || dadosJSON.length === 0) {
        throw new Error('Arquivo dados.json está vazio ou não contém um array válido');
      }
      
      console.log(`📊 ${dadosJSON.length} transações encontradas no arquivo dados.json`);
      
      // Verificar se já existem dados do JSON para evitar duplicação
      const transacoesExistentes = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
      const jaExistemDadosJSON = transacoesExistentes.some(t => t.id && t.id.startsWith('json_'));
      
      if (jaExistemDadosJSON) {
        toast.warning('⚠️ Dados do arquivo JSON já foram inseridos anteriormente. Use o botão Reset para limpar antes de inserir novamente.');
        return;
      }

      // Mapeamento de nomes de categoria para IDs
      const categoriaMap = {
        'Alimentação': '1',
        'Transporte': '2', 
        'Moradia': '3',
        'Saúde': '4',
        'Educação': '5',
        'Lazer': '6',
        'Salário': '7',
        'Freelance': '8',
        'Investimentos': '9',
        'Outros': '10'
      };

      // Processar e converter dados para o formato do sistema
      const transacoesProcessadas = dadosJSON.map((item, index) => {
        // Gerar ID único baseado no timestamp e índice
        const id = `json_${Date.now()}_${index}`;
        
        // Mapear categoria nome para ID
        const categoriaId = categoriaMap[item.categoria] || '10'; // Default para 'Outros'
        
        return {
          id,
          descricao: item.descricao || 'Transação sem descrição',
          valor: parseFloat(item.valor) || 0,
          tipo: item.tipo === 'receita' ? 'RECEITA' : 'DESPESA', // Maiúsculo conforme esperado
          categoria_id: categoriaId, // Usar categoria_id em vez de categoria
          data: item.data || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
      
      // Combinar com as transações existentes
      const todasTransacoes = [...transacoesExistentes, ...transacoesProcessadas];
      
      console.log('🔍 DEBUG: Transações processadas:', transacoesProcessadas.slice(0, 3)); // Mostrar primeiras 3
      console.log('🔍 DEBUG: Total de transações após inserção:', todasTransacoes.length);
      
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(todasTransacoes));
      
      // Marcar que dados do JSON foram inseridos
      localStorage.setItem('zetafin_dados_json_inseridos', 'true');
      localStorage.setItem('dados_ficticios_inseridos', 'true');
      
      console.log(`✅ ${transacoesProcessadas.length} transações do arquivo dados.json inseridas com sucesso!`);
      toast.success(`✅ ${transacoesProcessadas.length} transações carregadas do arquivo dados.json com sucesso!`);
      
      // Atualizar informações dos dados locais
      const localData = checkLocalStorageData();
      setLocalDataInfo(localData);
      
      // Recarregar a página para atualizar os dados
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do arquivo dados.json:', error);
      
      if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
        toast.error('❌ Arquivo dados.json não encontrado na raiz do projeto. Verifique se o arquivo existe.');
      } else {
        toast.error(`❌ Erro ao carregar dados: ${error.message}`);
      }
    }
  };

  const handleResetDatabase = async () => {
    if (resetConfirmationStep === 0) {
      setResetConfirmationStep(1);
      setShowResetConfirmation(true);
      return;
    }

    if (resetConfirmationStep === 1) {
      setResetConfirmationStep(2);
      return;
    }

    if (dbLoading) {
      return; // Evitar múltiplas chamadas
    }

    try {
      console.log('🧹 INICIANDO LIMPEZA COMPLETA E TOTAL DO SISTEMA...');
      console.log('=' .repeat(80));
      
      // 1. Executar limpeza completa usando o script especializado
      console.log('📋 ETAPA 1: Limpeza completa do localStorage...');
      const cleanupResult = executeCompleteSystemCleanup();
      
      // 2. Resetar categorias para as padrão (SEMPRE, independente do resultado)
      console.log('📋 ETAPA 2: Resetando categorias para padrão...');
      resetCategoriesToDefault();
      
      // 3. Limpeza adicional manual de chaves específicas
      console.log('📋 ETAPA 3: Limpeza adicional manual...');
      const additionalKeysToRemove = [
        'zetafin_transactions', 'zetafin_transacoes', 'zetafin-transactions',
        'transactions', 'transacoes', 'dados_ficticios_inseridos',
        'zetafin_dados_json_inseridos', 'auto_insert_executed',
        'zetafin_auto_insert_executed', 'fictitious_data_inserted'
      ];
      
      additionalKeysToRemove.forEach(key => {
        try {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🔨 Remoção manual: ${key}`);
          }
        } catch (error) {
          console.warn(`⚠️ Aviso na remoção manual de ${key}:`, error);
        }
      });
      
      // 4. Verificação final rigorosa
      console.log('📋 ETAPA 4: Verificação final...');
      const isClean = verifySystemIsClean();
      
      // 5. Verificação adicional manual
      let allKeysClean = true;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('zetafin') || 
          key.includes('transaction') || 
          key.includes('transac') ||
          key.includes('categor') ||
          key.includes('dados') ||
          key.includes('ficticio')
        )) {
          console.warn(`⚠️ Chave suspeita ainda presente: ${key}`);
          allKeysClean = false;
          // Tentar remover forçadamente
          try {
            localStorage.removeItem(key);
            console.log(`🔨 Remoção forçada final: ${key}`);
          } catch (error) {
            console.error(`❌ Falha na remoção forçada de ${key}:`, error);
          }
        }
      }
      
      // 6. Resultado final
      const finalSuccess = cleanupResult.success && isClean && allKeysClean;
      
      console.log('=' .repeat(80));
      console.log('🎯 RESULTADO FINAL DA LIMPEZA:');
      console.log(`✅ Limpeza do script: ${cleanupResult.success ? 'SUCESSO' : 'FALHA'}`);
      console.log(`✅ Verificação do sistema: ${isClean ? 'LIMPO' : 'DADOS RESTANTES'}`);
      console.log(`✅ Verificação manual: ${allKeysClean ? 'LIMPO' : 'CHAVES SUSPEITAS'}`);
      console.log(`🎯 STATUS GERAL: ${finalSuccess ? 'SISTEMA 100% LIMPO' : 'ATENÇÃO NECESSÁRIA'}`);
      console.log('=' .repeat(80));
      
      if (finalSuccess) {
        console.log('🎉 LIMPEZA TOTAL CONCLUÍDA COM SUCESSO!');
        toast.success(`🎉 Sistema 100% limpo! ${cleanupResult.itemsRemoved.length} itens removidos.`);
      } else {
        console.warn('⚠️ Limpeza concluída com avisos. Verifique o console.');
        toast.warning('Limpeza concluída, mas alguns dados podem persistir. Verifique o console.');
      }
      
      // Fechar modal
      setShowResetConfirmation(false);
      setResetConfirmationStep(0);
      
      // Recarregar a página para atualizar os dados
      console.log('🔄 Recarregando página em 2 segundos...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO ao resetar banco de dados:', error);
      toast.error('Erro crítico ao resetar banco de dados');
      setShowResetConfirmation(false);
      setResetConfirmationStep(0);
    }
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
    setResetConfirmationStep(0);
  };



  const getAllTransactions = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  };

  const handleExportJSON = () => {
    const data = {
      transactions: getAllTransactions(),
      settings: {
        theme: localStorage.getItem(STORAGE_KEYS.THEME),
      },
      coupleData: JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPLE_DATA) || '{}'),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zetafin-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
  };

  const handleExportCSV = () => {
    const transactions = getAllTransactions();
    exportToCSV(transactions, `zetafin-transacoes-${new Date().toISOString().split('T')[0]}`);
    setShowExportDropdown(false);
  };

  const handleExportPDF = () => {
    const transactions = getAllTransactions();
    exportToPDF(transactions, `zetafin-relatorio-${new Date().toISOString().split('T')[0]}`);
    setShowExportDropdown(false);
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-4 p-6">
        <Link to="/perfil" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Personalize sua experiência</p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Aparência */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Aparência</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escolha entre tema claro ou escuro</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Modo Escuro</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {theme === 'dark' ? 'Ativado' : 'Desativado'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>



        {/* Modo Edição */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Modo Edição</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Habilite botões de editar e excluir transações</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Edição de Transações</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditMode ? 'Botões de edição visíveis' : 'Botões de edição ocultos'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleEditMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEditMode ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEditMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Dica:</strong> Quando ativado, você verá botões "Editar" e "Excluir" na página de transações para facilitar o gerenciamento dos seus dados.
            </p>
          </div>
        </div>

        {/* Gerenciar Banco de Dados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gerenciar Banco de Dados</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Adicione dados fictícios ou reset completo</p>
            </div>
          </div>
          
          <div className="space-y-4">


             {/* Inserir Dados */}
             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Inserir Dados</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Carrega transações do arquivo dados.json</p>
                </div>
              </div>
              <button
                onClick={handleInsertFictitiousData}
                disabled={dbLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {dbLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{dbLoading ? 'Inserindo...' : 'Inserir'}</span>
              </button>
            </div>

            {/* Reset do Banco */}
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">Reset do Banco</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Remove TODOS os dados permanentemente</p>
                </div>
              </div>
              <button
                onClick={handleResetDatabase}
                disabled={dbLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {dbLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{dbLoading ? 'Processando...' : 'Resetar'}</span>
              </button>
            </div>

            {/* Botão de Emergência - Forçar Reset do Estado */}
            {dbLoading && (
              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-orange-700 dark:text-orange-300">Emergência</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Se a operação travou, force o reset do estado</p>
                  </div>
                </div>
                <button
                  onClick={forceReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Forçar Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmação de Reset */}
        {showResetConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {resetConfirmationStep === 1 ? 'Confirmar Reset' : 'Confirmação Final'}
                </h3>
              </div>
              
              {resetConfirmationStep === 1 ? (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Tem certeza que deseja resetar o banco de dados? Esta ação irá remover TODAS as transações, categorias e dados do usuário.
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-sm mb-6 font-medium">
                    Esta ação não pode ser desfeita!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    ÚLTIMA CONFIRMAÇÃO: Clique em "Resetar Definitivamente" para confirmar que deseja apagar todos os dados.
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-sm mb-6 font-bold">
                    TODOS OS DADOS SERÃO PERDIDOS PERMANENTEMENTE!
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelReset}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetDatabase}
                  disabled={dbLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {resetConfirmationStep === 1 ? 'Continuar' : 'Resetar Definitivamente'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exportar Banco de Dados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Exportar Dados</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Faça backup dos seus dados</p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="w-full p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-center space-x-2">
                <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-300">Exportar Banco de Dados</span>
                <ChevronDown className={`w-4 h-4 text-green-600 dark:text-green-400 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Escolha o formato de exportação
              </p>
            </button>

            {showExportDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="p-2">
                  <button
                    onClick={handleExportJSON}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">JSON</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Backup completo dos dados</p>
                    </div>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">CSV</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Planilha de transações</p>
                    </div>
                  </button>

                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">PDF</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Relatório formatado</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sobre o App */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sobre o App</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Informações do aplicativo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</p>
                  <p className="text-gray-900 dark:text-gray-100">ZetaFin</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Versão</p>
                  <p className="text-gray-900 dark:text-gray-100">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Desenvolvedor</p>
                  <p className="text-gray-900 dark:text-gray-100">ZetaFin Team</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Licença</p>
                  <p className="text-gray-900 dark:text-gray-100">MIT</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tecnologias</p>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Recharts', 'Lucide Icons'].map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Descrição</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                ZetaFin é um aplicativo de gestão financeira pessoal e para casais, 
                desenvolvido para ajudar você a controlar suas finanças de forma simples e eficiente. 
                Com recursos de sincronização entre parceiros, relatórios detalhados e interface moderna.
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Contato</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Email: suporte@zetafin.com<br />
                Website: www.zetafin.com<br />
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}