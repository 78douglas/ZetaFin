import { useState, useEffect, useMemo } from 'react';
import { useFinanceDataHybrid } from '@/react-app/hooks/useFinanceDataHybrid';
import { TipoTransacao } from '@/shared/types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Target, Plus, Edit2, Trash2, ArrowLeft, CheckCircle, 
  AlertTriangle, Clock, TrendingUp, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Cores para os gráficos
const CORES = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

// Interface para Meta
interface Meta {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  categoria: string;
  dataLimite: string;
  tipo: 'economia' | 'gasto' | 'receita';
  descricao?: string;
  createdAt: string;
}

export default function GoalsTracking() {
  const { transacoes, categorias } = useFinanceDataHybrid();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [novaMeta, setNovaMeta] = useState<Partial<Meta>>({
    nome: '',
    valorAlvo: 0,
    categoria: '',
    dataLimite: '',
    tipo: 'economia',
    descricao: ''
  });

  // Carregar metas do localStorage
  useEffect(() => {
    const metasSalvas = localStorage.getItem('zetafin_metas');
    if (metasSalvas) {
      setMetas(JSON.parse(metasSalvas));
    }
  }, []);

  // Salvar metas no localStorage
  const salvarMetas = (novasMetas: Meta[]) => {
    setMetas(novasMetas);
    localStorage.setItem('zetafin_metas', JSON.stringify(novasMetas));
  };

  // Calcular progresso das metas
  const metasComProgresso = useMemo(() => {
    return metas.map(meta => {
      let valorAtual = 0;
      
      if (meta.tipo === 'economia') {
        // Para economia, calcular receitas - despesas da categoria
        const receitasCategoria = transacoes
          .filter(t => t.categoria_id === meta.categoria && t.tipo === TipoTransacao.RECEITA)
          .reduce((sum, t) => sum + t.valor, 0);
        const despesasCategoria = transacoes
          .filter(t => t.categoria_id === meta.categoria && t.tipo === TipoTransacao.DESPESA)
          .reduce((sum, t) => sum + t.valor, 0);
        valorAtual = receitasCategoria - despesasCategoria;
      } else if (meta.tipo === 'gasto') {
        // Para gasto, calcular total de despesas da categoria
        valorAtual = transacoes
          .filter(t => t.categoria_id === meta.categoria && t.tipo === TipoTransacao.DESPESA)
          .reduce((sum, t) => sum + t.valor, 0);
      } else if (meta.tipo === 'receita') {
        // Para receita, calcular total de receitas da categoria
        valorAtual = transacoes
          .filter(t => t.categoria_id === meta.categoria && t.tipo === TipoTransacao.RECEITA)
          .reduce((sum, t) => sum + t.valor, 0);
      }

      const progresso = meta.valorAlvo > 0 ? (valorAtual / meta.valorAlvo) * 100 : 0;
      const dataLimite = new Date(meta.dataLimite);
      const hoje = new Date();
      const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...meta,
        valorAtual,
        progresso: Math.min(progresso, 100),
        diasRestantes,
        status: progresso >= 100 ? 'concluida' : diasRestantes < 0 ? 'vencida' : 'em_andamento'
      };
    });
  }, [metas, transacoes]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleSalvarMeta = () => {
    if (!novaMeta.nome || !novaMeta.valorAlvo || !novaMeta.categoria || !novaMeta.dataLimite) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const meta: Meta = {
      id: editingMeta?.id || Date.now().toString(),
      nome: novaMeta.nome!,
      valorAlvo: novaMeta.valorAlvo!,
      valorAtual: 0,
      categoria: novaMeta.categoria!,
      dataLimite: novaMeta.dataLimite!,
      tipo: novaMeta.tipo!,
      descricao: novaMeta.descricao || '',
      createdAt: editingMeta?.createdAt || new Date().toISOString()
    };

    if (editingMeta) {
      const metasAtualizadas = metas.map(m => m.id === editingMeta.id ? meta : m);
      salvarMetas(metasAtualizadas);
    } else {
      salvarMetas([...metas, meta]);
    }

    resetModal();
  };

  const handleEditarMeta = (meta: Meta) => {
    setEditingMeta(meta);
    setNovaMeta({
      nome: meta.nome,
      valorAlvo: meta.valorAlvo,
      categoria: meta.categoria,
      dataLimite: meta.dataLimite,
      tipo: meta.tipo,
      descricao: meta.descricao
    });
    setShowModal(true);
  };

  const handleExcluirMeta = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      const metasAtualizadas = metas.filter(m => m.id !== id);
      salvarMetas(metasAtualizadas);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingMeta(null);
    setNovaMeta({
      nome: '',
      valorAlvo: 0,
      categoria: '',
      dataLimite: '',
      tipo: 'economia',
      descricao: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'vencida':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'vencida':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  // Dados para gráficos
  const dadosProgresso = metasComProgresso.map(meta => ({
    nome: meta.nome,
    progresso: meta.progresso,
    valorAtual: meta.valorAtual,
    valorAlvo: meta.valorAlvo
  }));

  const dadosStatus = [
    { name: 'Concluídas', value: metasComProgresso.filter(m => m.status === 'concluida').length },
    { name: 'Em Andamento', value: metasComProgresso.filter(m => m.status === 'em_andamento').length },
    { name: 'Vencidas', value: metasComProgresso.filter(m => m.status === 'vencida').length }
  ].filter(item => item.value > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/relatorios" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6" />
              Acompanhamento de Metas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Defina e acompanhe suas metas financeiras
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Metas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metas.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metasComProgresso.filter(m => m.status === 'concluida').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Em Andamento</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metasComProgresso.filter(m => m.status === 'em_andamento').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metasComProgresso.filter(m => m.status === 'vencida').length}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      {metas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Status */}
          {dadosStatus.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status das Metas
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Progresso */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Progresso das Metas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProgresso}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'progresso' ? `${value}%` : formatarMoeda(Number(value)),
                    name === 'progresso' ? 'Progresso' : name === 'valorAtual' ? 'Valor Atual' : 'Valor Alvo'
                  ]}
                />
                <Bar dataKey="progresso" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Lista de Metas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Suas Metas</h2>
        </div>
        <div className="p-6">
          {metas.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma meta cadastrada. Crie sua primeira meta para começar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {metasComProgresso.map((meta) => (
                <div key={meta.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(meta.status)}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{meta.nome}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meta.status)}`}>
                          {meta.status === 'concluida' ? 'Concluída' : 
                           meta.status === 'vencida' ? 'Vencida' : 'Em Andamento'}
                        </span>
                      </div>
                      {meta.descricao && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{meta.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Categoria: {categorias.find(c => c.id === meta.categoria)?.nome || 'N/A'}</span>
                        <span>Tipo: {meta.tipo}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(meta.dataLimite).toLocaleDateString('pt-BR')}
                        </span>
                        {meta.diasRestantes >= 0 && (
                          <span>{meta.diasRestantes} dias restantes</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditarMeta(meta)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExcluirMeta(meta.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatarMoeda(meta.valorAtual)} / {formatarMoeda(meta.valorAlvo)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          meta.status === 'concluida' ? 'bg-green-500' :
                          meta.status === 'vencida' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>0%</span>
                      <span className="font-medium">{meta.progresso.toFixed(1)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Nova/Editar Meta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingMeta ? 'Editar Meta' : 'Nova Meta'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome da Meta *
                </label>
                <input
                  type="text"
                  value={novaMeta.nome || ''}
                  onChange={(e) => setNovaMeta({ ...novaMeta, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Economizar para viagem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Alvo *
                </label>
                <input
                  type="number"
                  value={novaMeta.valorAlvo || ''}
                  onChange={(e) => setNovaMeta({ ...novaMeta, valorAlvo: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={novaMeta.categoria || ''}
                  onChange={(e) => setNovaMeta({ ...novaMeta, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Meta *
                </label>
                <select
                  value={novaMeta.tipo || 'economia'}
                  onChange={(e) => setNovaMeta({ ...novaMeta, tipo: e.target.value as 'economia' | 'gasto' | 'receita' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="economia">Economia (Receitas - Despesas)</option>
                  <option value="gasto">Limite de Gasto</option>
                  <option value="receita">Meta de Receita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Limite *
                </label>
                <input
                  type="date"
                  value={novaMeta.dataLimite || ''}
                  onChange={(e) => setNovaMeta({ ...novaMeta, dataLimite: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={novaMeta.descricao || ''}
                  onChange={(e) => setNovaMeta({ ...novaMeta, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Descrição opcional da meta"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarMeta}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingMeta ? 'Atualizar' : 'Criar Meta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}