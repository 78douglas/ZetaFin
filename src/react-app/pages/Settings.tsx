import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Moon, Sun, Download, Info, Palette, Edit3, ChevronDown, FileText, Database, FileSpreadsheet, RefreshCw, Trash2, AlertTriangle, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/react-app/contexts/ThemeContext';
import { useEditMode } from '@/react-app/contexts/EditModeContext';
import { useExport } from '@/react-app/contexts/ExportContext';
import { useDatabase } from '@/react-app/hooks/useDatabase';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { useTransactionsHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { useCategoriesHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { supabase } from '@/react-app/lib/supabase';
import { toast } from 'sonner';
import { executeCompleteSystemCleanup, verifySystemIsClean, resetCategoriesToDefault } from '@/react-app/utils/cleanupSystem';
import { STORAGE_KEYS, APP_CONFIG } from '@/react-app/lib/config';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { isEditMode, toggleEditMode } = useEditMode();
  const { exportToCSV, exportToJSON, exportToPDF } = useExport();
  const { resetUserData, checkLocalStorageData, loading: dbLoading, forceReset } = useDatabase();
  const { user } = useAuth();
  const { createTransaction } = useTransactionsHybrid();
  const { categories, createCategory, getCategoryById } = useCategoriesHybrid();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetConfirmationStep, setResetConfirmationStep] = useState(0);
  const [localDataInfo, setLocalDataInfo] = useState({ hasLocalData: false, transactionCount: 0, categoryCount: 0 });
  const [showCSVImportModal, setShowCSVImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Estados para gerenciamento de categorias removidos - funcionalidade movida para página dedicada

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
  }, []);



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
      console.log('🧹 INICIANDO RESET COMPLETO DO BANCO DE DADOS...');
      console.log('=' .repeat(80));
      
      // 1. Reset do banco de dados no Supabase
      console.log('📋 ETAPA 1: Resetando dados no Supabase...');
      const supabaseResult = await resetUserData();
      
      if (!supabaseResult.success) {
        throw new Error(supabaseResult.error || 'Erro ao resetar dados no Supabase');
      }
      
      console.log('✅ Dados do Supabase resetados com sucesso!');
      console.log(`📊 Estatísticas: ${JSON.stringify(supabaseResult.data)}`);
      
      // 2. Limpeza do localStorage
      console.log('📋 ETAPA 2: Limpeza completa do localStorage...');
      const cleanupResult = executeCompleteSystemCleanup();
      
      // 3. Resetar categorias para as padrão no localStorage
      console.log('📋 ETAPA 3: Resetando categorias para padrão...');
      resetCategoriesToDefault();
      
      // 4. Limpeza adicional manual de chaves específicas
      console.log('📋 ETAPA 4: Limpeza adicional manual...');
      const additionalKeysToRemove = [
        'zetafin_transactions', 'zetafin_transacoes', 'zetafin-transactions',
        'transactions', 'transacoes'
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
      
      // 5. Verificação final rigorosa
      console.log('📋 ETAPA 5: Verificação final...');
      const isClean = verifySystemIsClean();
      
      // 6. Verificação adicional manual
      let allKeysClean = true;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('zetafin') || 
          key.includes('transaction') || 
          key.includes('transac') ||
          key.includes('categor') ||
          key.includes('dados')
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
      
      // 7. Resultado final
      const finalSuccess = supabaseResult.success && cleanupResult.success && isClean && allKeysClean;
      
      console.log('=' .repeat(80));
      console.log('🎯 RESULTADO FINAL DO RESET:');
      console.log(`✅ Reset do Supabase: ${supabaseResult.success ? 'SUCESSO' : 'FALHA'}`);
      console.log(`✅ Limpeza do localStorage: ${cleanupResult.success ? 'SUCESSO' : 'FALHA'}`);
      console.log(`✅ Verificação do sistema: ${isClean ? 'LIMPO' : 'DADOS RESTANTES'}`);
      console.log(`✅ Verificação manual: ${allKeysClean ? 'LIMPO' : 'CHAVES SUSPEITAS'}`);
      console.log(`🎯 STATUS GERAL: ${finalSuccess ? 'RESET 100% COMPLETO' : 'ATENÇÃO NECESSÁRIA'}`);
      console.log('=' .repeat(80));
      
      if (finalSuccess) {
        console.log('🎉 RESET COMPLETO CONCLUÍDO COM SUCESSO!');
        const stats = supabaseResult.data;
        toast.success(
          `🎉 Reset completo realizado! ` +
          `${stats?.deleted_transactions || 0} transações, ` +
          `${stats?.deleted_goals || 0} metas e ` +
          `${cleanupResult.itemsRemoved.length} itens locais removidos.`
        );
      } else {
        console.warn('⚠️ Reset concluído com avisos. Verifique o console.');
        toast.warning('Reset concluído, mas alguns dados podem persistir. Verifique o console.');
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
      toast.error(`Erro crítico ao resetar banco de dados: ${error.message}`);
      setShowResetConfirmation(false);
      setResetConfirmationStep(0);
    }
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
    setResetConfirmationStep(0);
  };

  const handleResetAndImportCSV = () => {
    setShowCSVImportModal(true);
  };

  const handleCSVFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast.error('Por favor, selecione um arquivo CSV válido');
      setCsvFile(null);
    }
  };

  const parseCSVData = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('📋 Headers encontrados:', headers);
    
    const transactions = [];
    const categoryNames = new Set();
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= 6) {
        // Novo formato: description,amount,type,transaction_date,notes,category_name
        const [descricao, valor, tipo, data, notes, categoria] = values;
        
        // Adicionar categoria ao conjunto
        categoryNames.add(categoria);
        
        // Criar transação
        transactions.push({
          transaction_date: data,
          description: descricao,
          category_name: categoria, // Será mapeado para category_id depois
          type: tipo.toUpperCase() as 'RECEITA' | 'DESPESA',
          amount: parseFloat(valor.replace('R$', '').replace(',', '.')),
          notes: notes || null
        });
      }
    }
    
    console.log('📊 Transações processadas:', transactions.length);
    console.log('🏷️ Categorias encontradas:', Array.from(categoryNames));
    
    return { transactions, categoryNames: Array.from(categoryNames) };
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      toast.error('Selecione um arquivo CSV');
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsImporting(true);
    
    try {
      // 1. Ler o arquivo CSV
      console.log('📄 Lendo arquivo CSV...');
      const csvText = await csvFile.text();
      const { transactions, categoryNames } = parseCSVData(csvText);
      
      // 2. Primeiro, limpar todas as transações do usuário
      console.log('🧹 Limpando transações existentes...');
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // 3. Criar categorias que não existem
      console.log('📂 Verificando categorias...');
      const categoryMap = new Map();
      
      for (const categoryName of categoryNames) {
        // Verificar se a categoria já existe
        let existingCategory = categories.find(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (!existingCategory) {
          // Criar nova categoria
          console.log(`➕ Criando categoria: ${categoryName}`);
          try {
            const newCategory = await createCategory({
              name: categoryName,
              icon: '📝',
              color: '#6366f1',
              is_default: false
            });
            categoryMap.set(categoryName, newCategory.id);
          } catch (err) {
            console.error(`Erro ao criar categoria ${categoryName}:`, err);
            // Se falhar, usar uma categoria padrão
            if (categories.length > 0) {
              categoryMap.set(categoryName, categories[0].id);
            }
          }
        } else {
          categoryMap.set(categoryName, existingCategory.id);
        }
      }
      
      // 4. Inserir transações
      console.log('💰 Inserindo transações...');
      let successCount = 0;
      let errorCount = 0;
      
      for (const transaction of transactions) {
        try {
          const categoryId = categoryMap.get(transaction.category_name);
          
          await createTransaction({
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            transaction_date: transaction.transaction_date,
            notes: transaction.notes,
            category_id: categoryId || null
          });
          
          successCount++;
        } catch (err) {
          console.error('Erro ao inserir transação:', err);
          errorCount++;
        }
      }
      
      console.log(`✅ Importação concluída: ${successCount} sucessos, ${errorCount} erros`);
      
      if (successCount > 0) {
        toast.success(`✅ Importadas ${successCount} transações com sucesso!`);
      }
      
      if (errorCount > 0) {
        toast.warning(`⚠️ ${errorCount} transações falharam na importação`);
      }
      
      // 5. Fechar modal e recarregar
      setShowCSVImportModal(false);
      setCsvFile(null);
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erro ao importar CSV:', error);
      toast.error('Erro ao importar arquivo CSV: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsImporting(false);
    }
  };

  const cancelCSVImport = () => {
    setShowCSVImportModal(false);
    setCsvFile(null);
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

        {/* Seção Gerenciar Categorias removida - funcionalidade movida para página dedicada */}

        {/* Gerenciar Banco de Dados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gerenciar Banco de Dados</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Importar dados ou reset completo</p>
            </div>
          </div>
          
          <div className="space-y-4">


             {/* Seção removida - inserção de dados fictícios não mais necessária com Supabase */}

            {/* Zerar Tudo e Importar CSV */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-300">Zerar Tudo e Importar CSV</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Remove todos os dados e importa de um arquivo CSV</p>
                </div>
              </div>
              <button
                onClick={handleResetAndImportCSV}
                disabled={dbLoading || isImporting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isImporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{isImporting ? 'Importando...' : 'Importar CSV'}</span>
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
                  {dbLoading ? (
                    <RefreshCw className="w-5 h-5 text-red-600 dark:text-red-400 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {dbLoading ? 'Resetando Banco de Dados...' : 
                   resetConfirmationStep === 1 ? 'Confirmar Reset' : 'Confirmação Final'}
                </h3>
              </div>
              
              {dbLoading ? (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Processando reset do banco de dados. Por favor, aguarde...
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      • Resetando dados no Supabase
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      • Limpando dados locais
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      • Verificando sistema
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                </div>
              ) : resetConfirmationStep === 1 ? (
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
              
              {!dbLoading && (
                <div className="flex space-x-3">
                  <button
                    onClick={cancelReset}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResetDatabase}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    {resetConfirmationStep === 1 ? 'Continuar' : 'Resetar Definitivamente'}
                  </button>
                </div>
              )}
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

      {/* Modal de Categoria removido - funcionalidade movida para página dedicada */}

      {/* Modal de Importação CSV */}
      {showCSVImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Zerar Tudo e Importar CSV
              </h3>
              <button
                onClick={cancelCSVImport}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Atenção!</p>
                    <p>Esta ação irá:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Apagar TODOS os dados existentes</li>
                      <li>Importar apenas os dados do CSV</li>
                      <li>Recarregar a página automaticamente</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecionar arquivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-blue-900/20 dark:file:text-blue-400
                    dark:hover:file:bg-blue-900/30"
                />
                {csvFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Arquivo selecionado: {csvFile.name}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Formato esperado do CSV:</p>
                  <p className="font-mono text-xs">data,tipo,categoria,descricao,valor</p>
                  <p className="mt-1">Exemplo: 2025-08-01,DESPESA,Alimentação,Almoço,25.50</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelCSVImport}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportCSV}
                disabled={!csvFile || isImporting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Zerar e Importar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}