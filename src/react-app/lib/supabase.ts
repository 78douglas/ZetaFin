import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para o banco de dados
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nome: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categorias: {
        Row: {
          id: string
          nome: string
          tipo_padrao: string | null
          icone: string | null
          ativa: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          tipo_padrao?: string | null
          icone?: string | null
          ativa?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          tipo_padrao?: string | null
          icone?: string | null
          ativa?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      transacoes: {
        Row: {
          id: string
          descricao: string
          descricao_adicional: string | null
          valor: number
          tipo: string
          categoria_id: string
          usuario_id: string | null
          data: string
          registrado_por: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          descricao: string
          descricao_adicional?: string | null
          valor: number
          tipo: string
          categoria_id: string
          usuario_id?: string | null
          data: string
          registrado_por: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          descricao?: string
          descricao_adicional?: string | null
          valor?: number
          tipo?: string
          categoria_id?: string
          usuario_id?: string | null
          data?: string
          registrado_por?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      inserir_dados_ficticios: {
        Args: {
          user_id: string
        }
        Returns: void
      }
      reset_user_data: {
        Args: {
          user_id: string
        }
        Returns: void
      }
    }
  }
}

// Tipos para as entidades
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type Transacao = Database['public']['Tables']['transacoes']['Row']

// Tipos para inserção
export type NovoUsuario = Database['public']['Tables']['usuarios']['Insert']
export type NovaCategoria = Database['public']['Tables']['categorias']['Insert']
export type NovaTransacao = Database['public']['Tables']['transacoes']['Insert']

// Tipos para atualização
export type AtualizarUsuario = Database['public']['Tables']['usuarios']['Update']
export type AtualizarCategoria = Database['public']['Tables']['categorias']['Update']
export type AtualizarTransacao = Database['public']['Tables']['transacoes']['Update']

// Tipo para transação com categoria
export type TransacaoComCategoria = Transacao & {
  categorias: Categoria
}