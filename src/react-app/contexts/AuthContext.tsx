import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { USE_SUPABASE, STORAGE_KEYS } from '../lib/config'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, nome: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_SUPABASE) {
      // Obter sessão inicial do Supabase
      const getInitialSession = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Erro ao obter sessão:', error)
            toast.error('Erro ao verificar autenticação')
          } else {
            setSession(session)
            setUser(session?.user ?? null)
          }
        } catch (error) {
          console.error('Erro inesperado ao obter sessão:', error)
          toast.error('Erro inesperado na autenticação')
        } finally {
          setLoading(false)
        }
      }

      getInitialSession()

      // Escutar mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email)
          
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          if (event === 'SIGNED_IN') {
            toast.success('Login realizado com sucesso!')
            
            // Criar ou atualizar registro do usuário na tabela usuarios
            if (session?.user) {
              try {
                const { error } = await supabase
                  .from('usuarios')
                  .upsert({
                    id: session.user.id,
                    email: session.user.email!,
                    nome: session.user.user_metadata?.nome || session.user.email!.split('@')[0],
                    avatar_url: session.user.user_metadata?.avatar_url || null,
                    updated_at: new Date().toISOString()
                  })
                
                if (error) {
                  console.error('Erro ao criar/atualizar usuário:', error)
                }
              } catch (error) {
                console.error('Erro inesperado ao criar usuário:', error)
              }
            }
          } else if (event === 'SIGNED_OUT') {
            toast.success('Logout realizado com sucesso!')
          } else if (event === 'PASSWORD_RECOVERY') {
            toast.success('Email de recuperação enviado!')
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    } else {
      // Modo localStorage - verificar se há usuário salvo
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setSession({ user: userData } as Session)
        } catch (error) {
          console.error('Erro ao carregar usuário do localStorage:', error)
          localStorage.removeItem(STORAGE_KEYS.USER)
        }
      }
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      setLoading(true)
      
      if (USE_SUPABASE) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: nome
            }
          }
        })

        if (error) {
          toast.error(error.message)
          return { error }
        }

        toast.success('Conta criada! Verifique seu email para confirmar.')
        return { error: null }
      } else {
        // Modo localStorage - simular criação de conta
        const userData = {
          id: Date.now().toString(),
          email,
          user_metadata: { nome },
          created_at: new Date().toISOString()
        }
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
        setUser(userData as User)
        setSession({ user: userData } as Session)
        
        toast.success('Conta criada com sucesso!')
        return { error: null }
      }
    } catch (error) {
      const authError = error as AuthError
      toast.error('Erro inesperado ao criar conta')
      return { error: authError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      if (USE_SUPABASE) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          toast.error(error.message)
          return { error }
        }

        return { error: null }
      } else {
        // Modo localStorage - simular login
        const userData = {
          id: Date.now().toString(),
          email,
          user_metadata: { nome: email.split('@')[0] },
          created_at: new Date().toISOString()
        }
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
        setUser(userData as User)
        setSession({ user: userData } as Session)
        
        toast.success('Login realizado com sucesso!')
        return { error: null }
      }
    } catch (error) {
      const authError = error as AuthError
      toast.error('Erro inesperado ao fazer login')
      return { error: authError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      if (USE_SUPABASE) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          toast.error(error.message)
        }
      } else {
        // Modo localStorage - limpar dados do usuário
        localStorage.removeItem(STORAGE_KEYS.USER)
        setUser(null)
        setSession(null)
        toast.success('Logout realizado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro inesperado ao fazer logout')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      if (USE_SUPABASE) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) {
          toast.error(error.message)
          return { error }
        }

        toast.success('Email de recuperação enviado!')
        return { error: null }
      } else {
        // Modo localStorage - simular recuperação de senha
        toast.success('Funcionalidade de recuperação não disponível no modo offline')
        return { error: null }
      }
    } catch (error) {
      const authError = error as AuthError
      toast.error('Erro inesperado ao enviar email de recuperação')
      return { error: authError }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}