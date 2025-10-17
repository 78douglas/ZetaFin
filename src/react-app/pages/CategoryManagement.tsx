import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCategories } from '@/react-app/hooks/useCategories';

export default function CategoryManagement() {
  const { 
    categories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    loading 
  } = useCategories();
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📝',
    type: 'AMBOS' as 'RECEITA' | 'DESPESA' | 'AMBOS'
  });

  // Filtrar apenas categorias personalizadas
  const customCategories = categories.filter(cat => !cat.is_default && !cat.id.startsWith('default-'));

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      await createCategory({
        name: newCategory.name.trim(),
        icon: newCategory.icon,
        color: '#6366f1', // Cor padrão para todas as categorias personalizadas
        type: newCategory.type
      });
      
      setNewCategory({
        name: '',
        icon: '📝',
        type: 'AMBOS'
      });
      setShowCategoryModal(false);
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      icon: category.icon,
      type: category.type || 'AMBOS'
    });
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      await updateCategory(editingCategory.id, {
        name: newCategory.name.trim(),
        icon: newCategory.icon,
        color: '#6366f1', // Cor padrão para todas as categorias personalizadas
        type: newCategory.type
      });
      
      setNewCategory({
        name: '',
        icon: '📝',
        type: 'AMBOS'
      });
      setEditingCategory(null);
      setShowCategoryModal(false);
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleDeleteCategory = (category: any) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      const result = await deleteCategory(categoryToDelete.id);
      
      // Verificar se houve erro no resultado (para hooks que retornam { error })
      if (result && result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Categoria excluída com sucesso!');
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      
      let errorMessage = 'Erro ao excluir categoria';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const cancelDeleteCategory = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const resetCategoryModal = () => {
    setNewCategory({
      name: '',
      icon: '📝',
      type: 'AMBOS'
    });
    setEditingCategory(null);
    setShowCategoryModal(false);
  };

  const iconesSugeridos = [
    '💰', '💸', '🍽️', '🏠', '🚗', '🏥', '🎬', '📚', 
    '👕', '⛽', '🛒', '💊', '🎯', '🎮', '📱', '💻'
  ];



  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          to="/perfil" 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gerenciar Categorias</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Adicione, edite e organize suas categorias</p>
        </div>
      </div>


      {/* Categorias Personalizadas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suas Categorias Personalizadas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Categorias criadas por você</p>
            </div>
          </div>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
              <p>Carregando categorias...</p>
            </div>
          ) : customCategories.length > 0 ? (
            customCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 text-sm">
                    {category.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Categoria personalizada • {
                        category.type === 'RECEITA' ? 'Apenas Receitas' :
                        category.type === 'DESPESA' ? 'Apenas Despesas' :
                        'Receitas e Despesas'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                    title="Editar categoria"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma categoria personalizada encontrada</p>
              <p className="text-sm mt-1">Clique em "Nova Categoria" para criar sua primeira categoria</p>
            </div>
          )}
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da categoria *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Ex: Alimentação, Transporte, Salário..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ícone da categoria
                </label>
                <div className="grid grid-cols-8 gap-2 mb-3">
                  {iconesSugeridos.map((icone) => (
                    <button
                      key={icone}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, icon: icone })}
                      className={`p-2 text-lg rounded-lg border-2 transition-colors ${
                        newCategory.icon === icone
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {icone}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Ou digite um emoji personalizado..."
                />
              </div>

              {/* Tipo padrão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo padrão
                </label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="AMBOS">Receitas e Despesas</option>
                  <option value="RECEITA">Apenas Receitas</option>
                  <option value="DESPESA">Apenas Despesas</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                disabled={!newCategory.name.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCategory ? 'Atualizar Categoria' : 'Criar Categoria'}
              </button>
              <button
                onClick={resetCategoryModal}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Excluir Categoria
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Tem certeza que deseja excluir a categoria:
              </p>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/50 text-sm">
                  {categoryToDelete.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {categoryToDelete.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Categoria personalizada
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Excluir
              </button>
              <button
                onClick={cancelDeleteCategory}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}