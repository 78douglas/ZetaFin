import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { useFinanceDataLocal } from '@/react-app/hooks/useFinanceDataLocal';
import { TipoTransacao } from '@/shared/types';
import { Save, X, Calculator, Plus, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionFormProps {
  transacaoId?: string;
}

// Cores diversificadas para as tags
const TAG_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
];

// Função para obter cor da tag baseada no índice
const getTagColor = (index: number) => {
  return TAG_COLORS[index % TAG_COLORS.length];
};

export default function TransactionForm({ transacaoId }: TransactionFormProps) {
  console.log('🔥 TransactionForm CARREGOU!');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { obterTransacao, criarTransacao, atualizarTransacao, adicionarTransacao, editarTransacao } = useFinanceDataHybrid();
  const { categorias } = useFinanceDataLocal();

  console.log('🔧 TransactionForm - Funções recebidas:', {
    hasAdicionarTransacao: !!adicionarTransacao,
    hasEditarTransacao: !!editarTransacao,
    typeOfAdicionarTransacao: typeof adicionarTransacao,
    typeOfEditarTransacao: typeof editarTransacao
  });



  const tipoParam = searchParams.get('tipo') as 'RECEITA' | 'DESPESA' | null;
  const { id: routeId } = useParams();
  const effectiveId: string | null = transacaoId || (routeId as string | undefined) || null;
  const isEditing = !!effectiveId;
  const valorInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);
  const isUserEditingRef = useRef(false);

  const [formData, setFormData] = useState({
    descricao: '',
    descricaoAdicional: '',
    valor: '',
    tipo: tipoParam || TipoTransacao.DESPESA,
    data: new Date().toISOString().split('T')[0],
    categoriaId: ''
  });

  // Função utilitária para normalizar o valor em centavos e aceitar vírgula
  const normalizeValor = (v: string): number => {
    const s = (v || '').replace(',', '.').trim();
    const n = parseFloat(s);
    if (Number.isNaN(n) || !Number.isFinite(n)) return NaN;
    return Math.round(n * 100) / 100;
  };

  // Formatação brasileira para o campo de valor
  const formatValorDisplay = (raw: string): string => {
    let v = (raw || '').replace(/\./g, ',');
    v = v.replace(/[^\d,]/g, '');
    const parts = v.split(',');
    const inteiro = parts[0] || '';
    const dec = parts[1] || '';
    let inteiroLimpo = inteiro.replace(/^0+(?=\d)/, '');
    if (v.startsWith(',')) {
      inteiroLimpo = '0';
    }
    let res = inteiroLimpo;
    if (parts.length > 1) {
      res += ',' + dec.slice(0, 2);
    }
    return res;
  };

  const handleValorChange = (e: any) => {
    isUserEditingRef.current = true;
    const fmt = formatValorDisplay(e.target.value);
    setFormData(prev => ({ ...prev, valor: fmt }));
  };

  const handleValorBlur = () => {
    setFormData(prev => {
      const n = normalizeValor(prev.valor);
      if (Number.isNaN(n)) return { ...prev, valor: '' };
      return { ...prev, valor: n.toFixed(2).replace('.', ',') };
    });
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [mostrarMais, setMostrarMais] = useState(false);

  // Carregar dados da transação se estiver editando
  useEffect(() => {
    console.log('🔍 TransactionForm useEffect - EXECUTANDO - Debug:', {
      isEditing,
      effectiveId,
      hasObterTransacao: !!obterTransacao,
    });

    if (!isEditing || !effectiveId) return;
    if (hasLoadedRef.current || isUserEditingRef.current) return;

    const transacao = obterTransacao(effectiveId);
    console.log('🔍 RESULTADO obterTransacao:', transacao);
    
    if (transacao) {
      console.log('🔍 Carregando dados da transação no formulário:', {
        descricao: transacao.descricao,
        valor: transacao.valor,
        tipo: transacao.tipo,
        data: transacao.data,
        categoria_id: transacao.categoria_id
      });
      
      setFormData({
        descricao: transacao.descricao,
        descricaoAdicional: transacao.descricaoAdicional || '',
        valor: Number.isFinite(transacao.valor) ? transacao.valor.toFixed(2).replace('.', ',') : '',
        tipo: transacao.tipo,
        data: transacao.data,
        categoriaId: transacao.categoria_id
      });
      if (transacao.tags && Array.isArray(transacao.tags)) {
        setTags(transacao.tags);
      }
      hasLoadedRef.current = true;
    } else {
      console.log('❌ Transação não encontrada para ID:', effectiveId);
    }
  }, [isEditing, effectiveId, obterTransacao]);

  // Resetar flags quando trocar de transação
  useEffect(() => {
    hasLoadedRef.current = false;
    isUserEditingRef.current = false;
  }, [effectiveId]);

  // Foco automático no campo de valor quando o componente for montado
  useEffect(() => {
    const timer = setTimeout(() => {
      if (valorInputRef.current) {
        valorInputRef.current.focus();
      }
    }, 100); // Pequeno delay para garantir que o componente foi renderizado

    return () => clearTimeout(timer);
  }, []);



  // Filtrar categorias baseado no tipo com listas fixas por tipo
  const normalizeText = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const NOMES_DESPESA = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Dividas', 'Outras Despesas'];
  const NOMES_RECEITA = ['Salário', 'Emprestimo', 'Presente', 'Freelance', 'Vendas', 'Outras Receitas'];

  const DESPESA_ALLOWED = useMemo(() => new Set(NOMES_DESPESA.map(n => normalizeText(n))), []);
  const RECEITA_ALLOWED = useMemo(() => new Set(NOMES_RECEITA.map(n => normalizeText(n))), []);
  const ORDEM_DESPESA = useMemo(() => {
    const m = new Map<string, number>();
    NOMES_DESPESA.forEach((n, i) => m.set(normalizeText(n), i));
    return m;
  }, []);
  const ORDEM_RECEITA = useMemo(() => {
    const m = new Map<string, number>();
    NOMES_RECEITA.forEach((n, i) => m.set(normalizeText(n), i));
    return m;
  }, []);

  const categoriasDisponiveis = useMemo(() => {
    const allowedSet = formData.tipo === 'DESPESA' ? DESPESA_ALLOWED : RECEITA_ALLOWED;
    const ordem = formData.tipo === 'DESPESA' ? ORDEM_DESPESA : ORDEM_RECEITA;

    const base = (categorias || []).filter(categoria => {
      const tipo = (categoria.type || categoria.tipo_padrao);
      if (tipo !== formData.tipo) return false; // somente categorias do tipo selecionado
      const nome = normalizeText(categoria.name || categoria.nome || '');
      return allowedSet.has(nome);
    });

    const lista = base; // sem fallback, usamos apenas as listas estritas

    // Ordenar conforme a ordem solicitada
    return lista.sort((a, b) => {
      const na = normalizeText(a.name || a.nome || '');
      const nb = normalizeText(b.name || b.nome || '');
      const ia = ordem.has(na) ? (ordem.get(na) as number) : 999;
      const ib = ordem.has(nb) ? (ordem.get(nb) as number) : 999;
      return ia - ib;
    });
  }, [categorias, formData.tipo, DESPESA_ALLOWED, RECEITA_ALLOWED, ORDEM_DESPESA, ORDEM_RECEITA]);

  // Debug para verificar categorias
  useEffect(() => {
    console.log('🔍 DEBUG TransactionForm - Categorias carregadas:', categorias?.length || 0);
    console.log('🔍 DEBUG TransactionForm - Todas as categorias:', categorias);
    console.log('🔍 DEBUG TransactionForm - Tipo selecionado:', formData.tipo);
    console.log('🔍 DEBUG TransactionForm - Categorias disponíveis:', categoriasDisponiveis);
    
    // Verificar se existe categoria Transporte
    const transporteCategory = categorias?.find(cat => 
      (cat.name || cat.nome)?.toLowerCase().includes('transporte')
    );
    console.log('🔍 DEBUG TransactionForm - Categoria Transporte encontrada:', transporteCategory);
  }, [categorias, formData.tipo]); // Removido categoriasDisponiveis das dependências


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Descrição agora é opcional - removida a validação obrigatória

    const valor = normalizeValor(formData.valor);
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
    
    console.log('🚀 handleSubmit iniciado')
    console.log('🚀 formData:', formData)
    console.log('🚀 isEditing:', isEditing)
    console.log('🚀 transacaoId:', transacaoId)
    
    if (!validateForm()) {
      console.log('❌ Validação falhou')
      return;
    }

    setLoading(true);
    setSubmitError('');
    
    try {
      const valorNormalizado = normalizeValor(formData.valor);

      const transacaoData = {
        descricao: formData.descricao.trim(),
        descricaoAdicional: formData.descricaoAdicional.trim() || undefined,
        valor: valorNormalizado,
        tipo: formData.tipo,
        data: formData.data,
        categoria_id: formData.categoriaId,
        tags: tags.length > 0 ? tags : undefined
      };

      console.log('🚀 transacaoData preparado:', transacaoData)

      let result;
      if (isEditing && effectiveId) {
        console.log('✏️ Editando transação...')
        result = await editarTransacao(effectiveId, transacaoData);
      } else {
        console.log('🆕 Criando nova transação...')
        result = await adicionarTransacao(transacaoData);
      }

      console.log('🚀 Resultado:', result)

      if (result?.error) {
        throw new Error(result.error);
      }
      if (!result?.data) {
        throw new Error('Falha ao salvar transação');
      }

      navigate('/transacoes');
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

  const handleCategorySelect = (categoria: any) => {
    isUserEditingRef.current = true;
    setFormData(prev => ({ ...prev, categoriaId: categoria.id }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Função para lidar com Enter em qualquer campo do formulário
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Verificar se o foco está no input de tags
      const target = e.target as HTMLElement;
      if (target.placeholder === 'Adicionar tag...') {
        // Se estiver no input de tags, adicionar tag
        e.preventDefault();
        addTag();
        return;
      }
      
      // Para outros campos, salvar o formulário
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Cores baseadas no tipo
  const isReceita = formData.tipo === 'RECEITA';
  const primaryColor = isReceita ? 'bg-green-500' : 'bg-red-500';
  const primaryColorHover = isReceita ? 'hover:bg-green-600' : 'hover:bg-red-600';
  const primaryColorLight = isReceita ? 'bg-green-50' : 'bg-red-50';
  const primaryColorText = isReceita ? 'text-green-700' : 'text-red-700';
  const primaryColorBorder = isReceita ? 'border-green-500' : 'border-red-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Editar Transação' : 'Nova Transação'}
          </h1>
          <div className="w-9" /> {/* Spacer para centralizar o título */}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
          {/* Toggle de Tipo - Pill Style */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className={`relative rounded-full p-1 transition-all duration-300 ${primaryColor}`}>
              <div className="grid grid-cols-2 relative">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: 'DESPESA', categoriaId: '' }))}
                  className={`relative z-10 py-3 px-6 text-center font-medium transition-all duration-300 rounded-full ${
                    formData.tipo === 'DESPESA'
                      ? 'text-red-700 bg-white shadow-md'
                      : 'text-white hover:text-red-100'
                  }`}
                >
                  DÉBITO
                  {formData.tipo === 'DESPESA' && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-red-500 rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipo: 'RECEITA', categoriaId: '' }))}
                  className={`relative z-10 py-3 px-6 text-center font-medium transition-all duration-300 rounded-full ${
                    formData.tipo === 'RECEITA'
                      ? 'text-green-700 bg-white shadow-md'
                      : 'text-white hover:text-green-100'
                  }`}
                >
                  CRÉDITO
                  {formData.tipo === 'RECEITA' && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-green-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Campo de Valor */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  ref={valorInputRef}
                  type="text"
                  inputMode="decimal"
                  title="Use números com vírgula ou ponto para centavos (ex: 50,00 ou 50.00)"
                  value={formData.valor}
                  onChange={handleValorChange}
                  onBlur={handleValorBlur}
                  className={`w-full text-3xl font-bold bg-transparent border-0 outline-none placeholder-gray-400 ${
                    errors.valor ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'
                  }`}
                  placeholder="0,00"
                />
                {errors.valor && (
                  <p className="mt-1 text-sm text-red-500">{errors.valor}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <span className="text-lg font-medium">BRL</span>
                <Calculator className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Grid de Categorias - Usar categorias reais do sistema */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Categorias
            </label>
            
            <div className="grid grid-cols-4 gap-4">
              {categoriasDisponiveis.map((categoria, index) => {
                const isSelected = categoria.id === formData.categoriaId;
                const nomeCategoria = categoria.name || categoria.nome;
                const iconeCategoria = categoria.icon || categoria.icone || '📝';

                return (
                  <button
                    key={categoria.id}
                    type="button"
                    onClick={() => handleCategorySelect(categoria)}
                    className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
                      isSelected
                        ? `${primaryColorLight} ${primaryColorBorder} border-2 ${primaryColorText}`
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${
                      isSelected ? 'bg-white shadow-md' : 'bg-white dark:bg-gray-600'
                    }`}>
                      {iconeCategoria}
                    </div>
                    <span className={`text-xs font-medium text-center ${
                      isSelected ? primaryColorText : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {nomeCategoria}
                    </span>
                  </button>
                );
              })}
            </div>

            {errors.categoriaId && (
              <p className="mt-3 text-sm text-red-500">{errors.categoriaId}</p>
            )}
          </div>

          {/* Sistema de Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            
            {/* Tags existentes */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColor(index)}`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-current hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input para nova tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Adicionar tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarMais(prev => !prev)}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {mostrarMais ? 'Mostrar Menos' : 'Mostrar Mais'}
            </button>
          </div>

          {/* Descrição (Opcional) */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg ${mostrarMais ? '' : 'hidden'}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => { isUserEditingRef.current = true; setFormData(prev => ({ ...prev, descricao: e.target.value })); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.descricao ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ex: Supermercado, Combustível, etc."
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-500">{errors.descricao}</p>
            )}
          </div>

          {/* Data */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg ${mostrarMais ? '' : 'hidden'}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => { isUserEditingRef.current = true; setFormData(prev => ({ ...prev, data: e.target.value })); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.data ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.data && (
              <p className="mt-1 text-sm text-red-500">{errors.data}</p>
            )}
          </div>

          {/* Erro de Submit */}
          {submitError && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
            </div>
          )}

          {/* Botões de Ação */}
           <div className="grid grid-cols-2 gap-4 pt-4">
             
             <button
               type="submit"
               disabled={loading}
               className={`flex items-center justify-center space-x-2 ${primaryColor} ${primaryColorHover} text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
             >
               {loading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <Save className="w-5 h-5" />
               )}
               <span>Salvar</span>
             </button>
             
             <button
               type="button"
               onClick={handleCancel}
               className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-4 px-6 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-lg"
             >
               <X className="w-5 h-5" />
               <span>Cancelar</span>
             </button>
           </div>
        </form>
      </div>
    </div>
  );
 }
