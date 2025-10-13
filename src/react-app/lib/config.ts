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
    // Categorias de Despesas
    { id: '1', nome: 'Alimentação', tipo_padrao: 'DESPESA', cor: '#ef4444', icone: '🍽️', ativa: true },
    { id: '2', nome: 'Transporte', tipo_padrao: 'DESPESA', cor: '#f97316', icone: '🚗', ativa: true },
    { id: '3', nome: 'Moradia', tipo_padrao: 'DESPESA', cor: '#eab308', icone: '🏠', ativa: true },
    { id: '4', nome: 'Saúde', tipo_padrao: 'DESPESA', cor: '#22c55e', icone: '🏥', ativa: true },
    { id: '5', nome: 'Educação', tipo_padrao: 'DESPESA', cor: '#3b82f6', icone: '📚', ativa: true },
    { id: '6', nome: 'Lazer', tipo_padrao: 'DESPESA', cor: '#8b5cf6', icone: '🎬', ativa: true },
    { id: '7', nome: 'Compras', tipo_padrao: 'DESPESA', cor: '#ec4899', icone: '🛍️', ativa: true },
    { id: '8', nome: 'Serviços', tipo_padrao: 'DESPESA', cor: '#14b8a6', icone: '🔧', ativa: true },
    { id: '9', nome: 'Vestuário', tipo_padrao: 'DESPESA', cor: '#f59e0b', icone: '👕', ativa: true },
    { id: '10', nome: 'Beleza', tipo_padrao: 'DESPESA', cor: '#d946ef', icone: '💄', ativa: true },
    { id: '11', nome: 'Pet', tipo_padrao: 'DESPESA', cor: '#84cc16', icone: '🐕', ativa: true },
    { id: '12', nome: 'Viagem', tipo_padrao: 'DESPESA', cor: '#06b6d4', icone: '✈️', ativa: true },
    { id: '13', nome: 'Impostos', tipo_padrao: 'DESPESA', cor: '#dc2626', icone: '📋', ativa: true },
    { id: '14', nome: 'Seguros', tipo_padrao: 'DESPESA', cor: '#7c3aed', icone: '🛡️', ativa: true },
    { id: '15', nome: 'Telefone/Internet', tipo_padrao: 'DESPESA', cor: '#0891b2', icone: '📱', ativa: true },
    { id: '16', nome: 'Assinaturas', tipo_padrao: 'DESPESA', cor: '#be185d', icone: '📺', ativa: true },
    { id: '17', nome: 'Farmácia', tipo_padrao: 'DESPESA', cor: '#059669', icone: '💊', ativa: true },
    { id: '18', nome: 'Combustível', tipo_padrao: 'DESPESA', cor: '#ea580c', icone: '⛽', ativa: true },
    
    // Categorias de Receitas
    { id: '19', nome: 'Salário', tipo_padrao: 'RECEITA', cor: '#10b981', icone: '💰', ativa: true },
    { id: '20', nome: 'Freelance', tipo_padrao: 'RECEITA', cor: '#06b6d4', icone: '💻', ativa: true },
    { id: '21', nome: 'Renda Extra', tipo_padrao: 'RECEITA', cor: '#8b5cf6', icone: '💵', ativa: true },
    { id: '22', nome: 'Vendas', tipo_padrao: 'RECEITA', cor: '#f59e0b', icone: '🏪', ativa: true },
    { id: '23', nome: 'Dividendos', tipo_padrao: 'RECEITA', cor: '#6366f1', icone: '📊', ativa: true },
    { id: '24', nome: 'Aluguel Recebido', tipo_padrao: 'RECEITA', cor: '#84cc16', icone: '🏘️', ativa: true },
    { id: '25', nome: 'Bonificação', tipo_padrao: 'RECEITA', cor: '#22c55e', icone: '🎁', ativa: true },
    { id: '26', nome: 'Restituição', tipo_padrao: 'RECEITA', cor: '#14b8a6', icone: '💸', ativa: true },
    { id: '27', nome: 'Prêmio', tipo_padrao: 'RECEITA', cor: '#f97316', icone: '🏆', ativa: true },
    
    // Categorias Mistas (Receita e Despesa)
    { id: '28', nome: 'Investimentos', tipo_padrao: 'AMBOS', cor: '#6366f1', icone: '📈', ativa: true },
    { id: '29', nome: 'Empréstimo', tipo_padrao: 'AMBOS', cor: '#dc2626', icone: '🏦', ativa: true },
    { id: '30', nome: 'Transferência', tipo_padrao: 'AMBOS', cor: '#64748b', icone: '🔄', ativa: true },
    { id: '31', nome: 'Outros', tipo_padrao: 'AMBOS', cor: '#6b7280', icone: '📝', ativa: true }
  ]
}