import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

// Criar cliente Supabase com configurações de autenticação
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos TypeScript para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          is_default: boolean
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          color?: string
          is_default?: boolean
          type?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          is_default?: boolean
          type?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          description: string
          amount: number
          type: 'RECEITA' | 'DESPESA'
          transaction_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          description: string
          amount: number
          type: 'RECEITA' | 'DESPESA'
          transaction_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          description?: string
          amount?: number
          type?: 'RECEITA' | 'DESPESA'
          transaction_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          name: string
          target_amount: number
          current_amount: number
          start_date: string
          end_date: string
          status: 'ATIVA' | 'CONCLUIDA' | 'PAUSADA'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          name: string
          target_amount: number
          current_amount?: number
          start_date: string
          end_date: string
          status?: 'ATIVA' | 'CONCLUIDA' | 'PAUSADA'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          name?: string
          target_amount?: number
          current_amount?: number
          start_date?: string
          end_date?: string
          status?: 'ATIVA' | 'CONCLUIDA' | 'PAUSADA'
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          preferences: any
          currency: string
          locale: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferences?: any
          currency?: string
          locale?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferences?: any
          currency?: string
          locale?: string
          updated_at?: string
        }
      }
    }
  }
}

// Tipos para as entidades
export type User = Database['public']['Tables']['users']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

// Tipos para inserção
export type NewUser = Database['public']['Tables']['users']['Insert']
export type NewCategory = Database['public']['Tables']['categories']['Insert']
export type NewTransaction = Database['public']['Tables']['transactions']['Insert']
export type NewGoal = Database['public']['Tables']['goals']['Insert']
export type NewUserSettings = Database['public']['Tables']['user_settings']['Insert']

// Tipos para atualização
export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateCategory = Database['public']['Tables']['categories']['Update']
export type UpdateTransaction = Database['public']['Tables']['transactions']['Update']
export type UpdateGoal = Database['public']['Tables']['goals']['Update']
export type UpdateUserSettings = Database['public']['Tables']['user_settings']['Update']

// Tipos compostos
export type TransactionWithCategory = Transaction & {
  category?: Category
}

export type GoalWithCategory = Goal & {
  category?: Category
}