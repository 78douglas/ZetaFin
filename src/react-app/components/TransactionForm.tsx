import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { TipoTransacao } from '@/shared/types';
import { Save, X, DollarSign, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionFormProps {
  transacaoId?: string;
}

export default function TransactionForm({ transacaoId }: TransactionFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categorias, adicionarTransacao, editarTransacao, obterTransacao, adicionarCategoria } = useFinanceDataHybrid();

  const tipoParam = searchParams.get('tipo') as 'RECEITA' | 'DESPESA' | null;
  const isEditing = !!transacaoId;

  const [formData, setFormData] = useState({
    descricao: '',
    descricaoAdicional: '',
    valor: '',
    tipo: tipoParam || TipoTransacao.DESPESA,
    data: new Date().toISOString().split('T')[0],
    categoriaId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    nome: '',
    icone: '📝',
    tipoPadrao: 'AMBOS' as 'RECEITA' | 'DESPESA' | 'AMBOS'
  });

  // Carregar dados da transação se estiver editando
  useEffect(() => {
    if (isEditing && transacaoId) {
      const transacao = obterTransacao(transacaoId);
      if (transacao) {
        setFormData({
          descricao: transacao.descricao,
          descricaoAdicional: transacao.descricaoAdicional || '',
          valor: transacao.valor.toString(),
          tipo: transacao.tipo,
          data: transacao.data,
          categoriaId: transacao.categoriaId
        });
      }
    }
  }, [isEditing, transacaoId, obterTransacao]);

  // Filtrar categorias baseado no tipo
  const categoriasFiltradas = categorias.filter(categoria => 
    categoria.tipoPadrao === 'AMBOS' || categoria.tipoPadrao === formData.tipo
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    const valor = parseFloat(formData.valor);
    if (!formData.valor || isNaN(valor) || valor <= 0) {
      newErrors.valor = 'Valor deve ser um número positivo';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Categoria é obrigatória';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError('');
    
    try {
      const transacaoData = {
        descricao: formData.descricao.trim(),
        observacoes: formData.descricaoAdicional.trim() || undefined,
        valor: parseFloat(formData.valor),
        tipo: formData.tipo,
        data: formData.data,
        categoria_id: formData.categoriaId
      };

      let result;
      if (isEditing && transacaoId) {
        result = await editarTransacao(transacaoId, transacaoData);
      } else {
        result = await adicionarTransacao(transacaoData);
      }

      if (result) {
        toast.success(isEditing ? 'Transação atualizada com sucesso!' : 'Transação criada com sucesso!');
        navigate('/transacoes');
      } else {
        throw new Error('Falha ao salvar transação');
      }
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao salvar transação';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.nome.trim()) return;

    try {
      const categoria = await adicionarCategoria({
        nome: newCategoryData.nome.trim(),
        icone: newCategoryData.icone,
        tipo_padrao: newCategoryData.tipoPadrao
      });

      if (categoria) {
        setFormData(prev => ({ ...prev, categoriaId: categoria.id }));
        setShowNewCategoryModal(false);
        setNewCategoryData({
          nome: '',
          icone: '📝',
          tipoPadrao: 'AMBOS'
        });
        toast.success('Categoria criada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria. Tente novamente.');
    }
  };

  const iconesSugeridos = [
    '💰', '💸', '🍽️', '🏠', '🚗', '🏥', '🎬', '📚', 
    '👕', '⛽', '🛒', '💊', '🎯', '🎮', '📱', '💻'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {isEditing ? 'Editar Transação' : 'Nova Transação'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {isEditing ? 'Atualize os dados da transação' : 'Registre uma nova receita ou despesa'}
        </p>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Transação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: TipoTransacao.RECEITA, categoriaId: '' }))}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                  formData.tipo === TipoTransacao.RECEITA
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-500'
                }`}
              >
                <div className="text-xl mb-1">💰</div>
                <div className="font-medium text-sm">Receita</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Entrada</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: TipoTransacao.DESPESA, categoriaId: '' }))}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                  formData.tipo === TipoTransacao.DESPESA
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-500'
                }`}
              >
                <div className="text-xl mb-1">💸</div>
                <div className="font-medium text-sm">Despesa</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Saída</div>
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.descricao ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ex: Supermercado, Salário, Aluguel..."
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.descricao}</p>
            )}
          </div>

          {/* Descrição Adicional */}
          <div>
            <label htmlFor="descricaoAdicional" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição Adicional
            </label>
            <textarea
              id="descricaoAdicional"
              rows={3}
              value={formData.descricaoAdicional}
              onChange={(e) => setFormData(prev => ({ ...prev, descricaoAdicional: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              placeholder="Informações adicionais sobre a transação (opcional)..."
            />
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor (R$) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="number"
                id="valor"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.valor ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0,00"
              />
            </div>
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valor}</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data *
            </label>
            <input
              type="date"
              id="data"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.data ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.data && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.data}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria *
            </label>
            <div className="space-y-2">
              <select
                id="categoria"
                value={formData.categoriaId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoriaId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.categoriaId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {categoriasFiltradas.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.icone} {categoria.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategoryModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Criar nova categoria</span>
              </button>
            </div>
            {errors.categoriaId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoriaId}</p>
            )}
          </div>

          {/* Erro de Submit */}
          {submitError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="text-sm">{loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Cancelar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal para criar nova categoria */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Nova Categoria</h3>
            
            <div className="space-y-4">
              {/* Nome da categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da categoria *
                </label>
                <input
                  type="text"
                  value={newCategoryData.nome}
                  onChange={(e) => setNewCategoryData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Ex: Lazer, Educação, Investimentos..."
                />
              </div>

              {/* Ícone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-8 gap-2 mb-2">
                  {iconesSugeridos.map((icone) => (
                    <button
                      key={icone}
                      type="button"
                      onClick={() => setNewCategoryData(prev => ({ ...prev, icone }))}
                      className={`p-2 rounded-lg text-lg transition-all duration-200 ${
                        newCategoryData.icone === icone
                          ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {icone}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newCategoryData.icone}
                  onChange={(e) => setNewCategoryData(prev => ({ ...prev, icone: e.target.value }))}
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
                  value={newCategoryData.tipoPadrao}
                  onChange={(e) => setNewCategoryData(prev => ({ ...prev, tipoPadrao: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="AMBOS">Receitas e Despesas</option>
                  <option value="RECEITA">Apenas Receitas</option>
                  <option value="DESPESA">Apenas Despesas</option>
                </select>
              </div>
            </div>

            {/* Botões do modal */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryData.nome.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Categoria
              </button>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
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
