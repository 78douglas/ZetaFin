// Flag para ativar/desativar Supabase
export const USE_SUPABASE = false; // Temporariamente desativado para usar localStorage

// Configurações do localStorage
export const STORAGE_KEYS = {
  TRANSACTIONS: 'zetafin_transactions',
  CATEGORIES: 'zetafin_categories',
  USER: 'zetafin_user',
  AUTH_TOKEN: 'zetafin_auth_token',
  THEME: 'zetafin_theme',
  COUPLE_DATA: 'zetafin_couple_data'
};

// Configuração da aplicação
export const APP_CONFIG = {
  USE_SUPABASE,
  STORAGE_KEYS,
  
  // Configurações padrão
  DEFAULT_TRANSACTION_LIMIT: 100,
  DEFAULT_CATEGORIES: [
    { id: '1', nome: 'Alimentação', tipo_padrao: 'DESPESA', cor: '#ef4444', icone: '🍽️', ativa: true },
    { id: '2', nome: 'Transporte', tipo_padrao: 'DESPESA', cor: '#f97316', icone: '🚗', ativa: true },
    { id: '3', nome: 'Moradia', tipo_padrao: 'DESPESA', cor: '#eab308', icone: '🏠', ativa: true },
    { id: '4', nome: 'Saúde', tipo_padrao: 'DESPESA', cor: '#22c55e', icone: '🏥', ativa: true },
    { id: '5', nome: 'Educação', tipo_padrao: 'DESPESA', cor: '#3b82f6', icone: '📚', ativa: true },
    { id: '6', nome: 'Lazer', tipo_padrao: 'DESPESA', cor: '#8b5cf6', icone: '🎬', ativa: true },
    { id: '7', nome: 'Salário', tipo_padrao: 'RECEITA', cor: '#10b981', icone: '💰', ativa: true },
    { id: '8', nome: 'Freelance', tipo_padrao: 'RECEITA', cor: '#06b6d4', icone: '💻', ativa: true },
    { id: '9', nome: 'Investimentos', tipo_padrao: 'AMBOS', cor: '#6366f1', icone: '📈', ativa: true },
    { id: '10', nome: 'Outros', tipo_padrao: 'AMBOS', cor: '#6b7280', icone: '📝', ativa: true }
  ]
}