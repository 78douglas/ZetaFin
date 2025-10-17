import { Category } from '../lib/supabase'

// Categorias padrão do sistema - ficam no código, não no banco de dados
export const DEFAULT_CATEGORIES: Category[] = [
  // RECEITAS
  {
    id: 'default-salario',
    user_id: 'system',
    name: 'Salário',
    icon: '💰',
    color: '#58D68D',
    type: 'RECEITA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-freelance',
    user_id: 'system',
    name: 'Freelance',
    icon: '💼',
    color: '#85C1E9',
    type: 'RECEITA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-emprestimos',
    user_id: 'system',
    name: 'Emprestimo',
    icon: '🏦',
    color: '#F7DC6F',
    type: 'RECEITA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-vendas',
    user_id: 'system',
    name: 'Vendas',
    icon: '🛍️',
    color: '#F8C471',
    type: 'RECEITA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-presentes',
    user_id: 'system',
    name: 'Presente',
    icon: '🎁',
    color: '#DDA0DD',
    type: 'RECEITA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-outras-receitas',
    user_id: 'system',
    name: 'Outras Receitas',
    icon: '📈',
    color: '#AED6F1',
    type: 'RECEITA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  
  // DESPESAS
  {
    id: 'default-moradia',
    user_id: 'system',
    name: 'Moradia',
    icon: '🏠',
    color: '#FF6B6B',
    type: 'DESPESA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-alimentacao',
    user_id: 'system',
    name: 'Alimentação',
    icon: '🍽️',
    color: '#4ECDC4',
    type: 'DESPESA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-saude',
    user_id: 'system',
    name: 'Saúde',
    icon: '🏥',
    color: '#96CEB4',
    type: 'DESPESA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-educacao',
    user_id: 'system',
    name: 'Educação',
    icon: '📚',
    color: '#FFEAA7',
    type: 'DESPESA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-lazer',
    user_id: 'system',
    name: 'Lazer',
    icon: '🎮',
    color: '#BB8FCE',
    type: 'DESPESA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-transporte',
    user_id: 'system',
    name: 'Transporte',
    icon: '🚗',
    color: '#F39C12',
    type: 'DESPESA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-dividas',
    user_id: 'system',
    name: 'Dividas',
    icon: '💳',
    color: '#F1948A',
    type: 'DESPESA',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'default-outras',
    user_id: 'system',
    name: 'Outras Despesas',
    icon: '📦',
    color: '#85C1E9',
    type: 'DESPESA',
    is_default: true,
    created_at: new Date().toISOString()
  }
]

// Função para obter categoria padrão por ID
export const getDefaultCategoryById = (id: string): Category | undefined => {
  return DEFAULT_CATEGORIES.find(category => category.id === id)
}

// Função para verificar se uma categoria é padrão
export const isDefaultCategory = (categoryId: string): boolean => {
  return categoryId.startsWith('default-')
}

// Função para obter todas as categorias padrão
export const getDefaultCategories = (): Category[] => {
  return [...DEFAULT_CATEGORIES]
}