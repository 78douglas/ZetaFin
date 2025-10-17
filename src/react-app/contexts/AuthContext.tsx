import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { USE_SUPABASE } from '../lib/config'
import { throttledErrorToast, throttledSuccessToast } from '../lib/notificationThrottle'
// import { createLocalTestData, hasLocalData } from '../utils/createLocalTestData'

// Função de log centralizada para debug
const authLog = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info', data?: any) => {
  const timestamp = new Date().toLocaleTimeString()
  const prefix = {
    info: '🔍',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  }[type]
  
  console.log(`${prefix} [AUTH ${timestamp}] ${message}`, data || '')
  
  // Também salvar no localStorage para debug
  try {
    const logs = JSON.parse(localStorage.getItem('zetafin-auth-logs') || '[]')
    logs.push({
      timestamp: new Date().toISOString(),
      type,
      message,
      data: data ? JSON.stringify(data) : null
    })
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }
    
    localStorage.setItem('zetafin-auth-logs', JSON.stringify(logs))
  } catch (e) {
    console.warn('Erro ao salvar log:', e)
  }
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Flags de controle anti-loop
  const initializingRef = useRef(false)
  const authStateChangeRef = useRef(false)
  const sessionCheckRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Log inicial
  useEffect(() => {
    authLog('AuthProvider inicializado', 'info', {
      USE_SUPABASE,
      initialLoading: loading,
      initialUser: user,
      initialSession: session
    })
  }, [])

  // Função debounced para verificação de sessão
  const debouncedSessionCheck = useCallback(async () => {
    authLog('debouncedSessionCheck chamado', 'info', { USE_SUPABASE, loading, initialized })
    
    if (!USE_SUPABASE) {
      // Verificar se há logout em progresso
      const logoutInProgress = localStorage.getItem('zetafin-logout-in-progress')
      if (logoutInProgress) {
        authLog('Logout em progresso detectado - aguardando conclusão', 'warning')
        // Aguardar um pouco mais para garantir que o logout seja concluído
        setTimeout(() => {
          const stillInProgress = localStorage.getItem('zetafin-logout-in-progress')
          if (!stillInProgress) {
            authLog('Logout concluído - reexecutando verificação de sessão', 'info')
            debouncedSessionCheck()
          } else {
            authLog('Logout ainda em progresso - limpando estado', 'warning')
            setUser(null)
            setSession(null)
            setLoading(false)
            setInitialized(true)
          }
        }, 300) // Aumentar o tempo de espera
        return
      }
      
      // Verificar se há usuário salvo no localStorage
      try {
        const localUser = localStorage.getItem('zetafin-local-user')
        const localSession = localStorage.getItem('zetafin-local-session')
        
        authLog('Verificando dados locais', 'info', {
          hasLocalUser: !!localUser,
          hasLocalSession: !!localSession,
          localUserLength: localUser?.length,
          localSessionLength: localSession?.length
        })
        
        if (localUser && localSession) {
          const userData = JSON.parse(localUser)
          const sessionData = JSON.parse(localSession)
          
          authLog('Dados locais encontrados', 'info', {
            userEmail: userData.email,
            sessionExpiresAt: new Date(sessionData.expires_at).toISOString(),
            currentTime: new Date().toISOString(),
            isExpired: sessionData.expires_at <= Date.now()
          })
          
          // Verificar se a sessão não expirou
          if (sessionData.expires_at > Date.now()) {
            // Aguardar um pouco antes de definir o estado para evitar condições de corrida
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Verificar novamente se não há logout em progresso
            const logoutCheck = localStorage.getItem('zetafin-logout-in-progress')
            if (!logoutCheck) {
              setUser(userData)
              setSession(sessionData)
              authLog('Usuário local carregado com sucesso', 'success', { email: userData.email })
            } else {
              authLog('Logout detectado durante carregamento - cancelando', 'warning')
              return
            }
          } else {
            authLog('Sessão local expirada - removendo dados', 'warning')
            localStorage.removeItem('zetafin-local-user')
            localStorage.removeItem('zetafin-local-session')
          }
        } else {
          authLog('Nenhum usuário local encontrado', 'info')
        }
      } catch (error) {
        authLog('Erro ao carregar dados locais', 'error', error)
        localStorage.removeItem('zetafin-local-user')
        localStorage.removeItem('zetafin-local-session')
      }
      
      setLoading(false)
      setInitialized(true)
      return
    }

    if (sessionCheckRef.current) {
      authLog('Verificação de sessão já em andamento - ignorando', 'warning')
      return
    }

    sessionCheckRef.current = true

    try {
      authLog('Iniciando verificação de sessão Supabase', 'info')
      
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        authLog('Erro ao verificar sessão Supabase', 'error', error)
        // Fallback para localStorage
        const localUser = localStorage.getItem('sb-user')
        if (localUser) {
          try {
            const userData = JSON.parse(localUser)
            setUser(userData)
            setSession({ user: userData } as Session)
            authLog('Usuário carregado do localStorage como fallback', 'success')
          } catch (e) {
            authLog('Erro ao parsear usuário do localStorage', 'error', e)
          }
        }
      } else {
        authLog('Sessão Supabase verificada', 'success', { userEmail: session?.user?.email || 'Nenhum usuário' })
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          localStorage.setItem('sb-user', JSON.stringify(session.user))
          authLog('Usuário Supabase salvo no localStorage', 'info')
        }
      }
    } catch (error) {
      authLog('Erro na verificação de sessão Supabase', 'error', error)
    } finally {
      sessionCheckRef.current = false
      setLoading(false)
      setInitialized(true)
      authLog('Verificação de sessão finalizada', 'info', { 
        hasUser: !!user, 
        hasSession: !!session,
        loading: false,
        initialized: true 
      })
    }
  }, [USE_SUPABASE, loading, initialized])

  // useEffect para verificação inicial de sessão com debounce
  useEffect(() => {
    if (initialized) {
      authLog('AuthProvider já inicializado - ignorando useEffect', 'info')
      return
    }

    authLog('Iniciando inicialização do AuthProvider', 'info', { 
      USE_SUPABASE, 
      loading, 
      user: user?.email || null,
      session: !!session 
    })

    if (debounceTimeoutRef.current) {
      authLog('Cancelando timeout anterior', 'info')
      clearTimeout(debounceTimeoutRef.current)
    }

    if (sessionCheckRef.current) {
      authLog('Verificação de sessão já em progresso - aguardando', 'warning')
      return
    }

    authLog('Executando verificação de sessão com debounce de 300ms', 'info')
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSessionCheck()
    }, 300)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [debouncedSessionCheck, initialized])

  // Escutar mudanças de autenticação com controle anti-loop
  useEffect(() => {
    if (!USE_SUPABASE) {
      console.log('🚫 Supabase desabilitado - não configurando listener de auth')
      return
    }

    if (authStateChangeRef.current) {
      console.log('⏭️ Listener de auth já configurado - ignorando')
      return
    }

    authStateChangeRef.current = true
    let isMounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('🔄 Auth state changed:', event, session ? 'Usuário logado' : 'Usuário não logado')
        
        // Evitar logout desnecessário em eventos de TOKEN_REFRESHED
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed, mantendo sessão')
          setSession(session)
          setUser(session.user)
          return
        }
        
        // Para outros eventos, atualizar normalmente
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Usuário logado com sucesso')
          
          // Salvar dados do usuário no cache local para fallback
          try {
            localStorage.setItem('sb-user', JSON.stringify(session.user))
            console.log('💾 Dados do usuário salvos no cache local')
          } catch (cacheError) {
            console.error('❌ Erro ao salvar dados no cache:', cacheError)
          }
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 Usuário deslogado')
          // Limpar cache local
          localStorage.removeItem('sb-user')
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
      authStateChangeRef.current = false
    }
  }, [])
    const signUpWithEmail = async (email: string, password: string, name: string): Promise<void> => {
      try {
        authLog('Iniciando registro com email', 'info', { email, name, passwordLength: password.length })
        setLoading(true)
        
        if (!USE_SUPABASE) {
          // Registro local para desenvolvimento
          authLog('Usando registro local para desenvolvimento', 'info')
          
          // Validação básica
          if (!email || !password || !name) {
            authLog('Validação falhou: campos obrigatórios vazios', 'error')
            toast.error('Todos os campos são obrigatórios')
            setLoading(false)
            return
          }
          
          if (password.length < 6) {
            authLog('Validação falhou: senha muito curta', 'error')
            toast.error('A senha deve ter pelo menos 6 caracteres')
            setLoading(false)
            return
          }
          
          // Verificar se usuário já existe no localStorage
          const existingUser = localStorage.getItem('zetafin-local-user')
          if (existingUser) {
            const userData = JSON.parse(existingUser)
            if (userData.email === email) {
              authLog('Registro falhou: email já existe', 'error', { email })
              toast.error('Este email já está cadastrado')
              setLoading(false)
              return
            }
          }
          
          authLog('Simulando delay de registro', 'info')
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Criar usuário mock
          const mockUser = {
            id: 'local-user-' + Date.now(),
            email,
            user_metadata: { 
              full_name: name,
              avatar_url: null
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          const mockSession = {
            user: mockUser,
            access_token: 'local-token-' + Date.now(),
            refresh_token: 'local-refresh-' + Date.now(),
            expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
            token_type: 'bearer'
          }
          
          authLog('Salvando dados de registro local', 'info', { userId: mockUser.id })
          localStorage.setItem('zetafin-local-user', JSON.stringify(mockUser))
          localStorage.setItem('zetafin-local-session', JSON.stringify(mockSession))
          
          // Atualizar estado
          setUser(mockUser as any)
          setSession(mockSession as any)
          
          authLog('Registro local concluído com sucesso', 'success', { userId: mockUser.id, email })
          toast.success('Conta criada com sucesso!')
          return
        }
        
        // Registro com Supabase (quando habilitado)
        authLog('Usando registro Supabase', 'info')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        })

        if (error) {
          authLog('Erro no registro Supabase', 'error', { error: error.message })
          toast.error('Erro ao criar conta')
          throw error
        } else {
          authLog('Registro Supabase realizado com sucesso', 'success', { userId: data.user?.id })
          toast.success('Conta criada! Verifique seu email para confirmar.')
        }
      } catch (error) {
        authLog('Erro no processo de registro', 'error', error)
        throw error
      } finally {
        setLoading(false)
      }
    }

    const signInWithEmail = async (email: string, password: string): Promise<void> => {
      try {
        authLog('Iniciando login com email', 'info', { email })
        setLoading(true)
        
        if (!USE_SUPABASE) {
          // Login local para desenvolvimento - aceita qualquer email/senha
          authLog('Usando login local para desenvolvimento - modo demo', 'info')
          
          // Validação básica
          if (!email || !password) {
            authLog('Login falhou: email ou senha vazios', 'error')
            toast.error('Email e senha são obrigatórios')
            setLoading(false)
            return
          }
          
          // Simular delay de autenticação
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Verificar se existe usuário local, senão criar um automaticamente
          let userData
          const localUser = localStorage.getItem('zetafin-local-user')
          
          if (!localUser) {
            // Criar usuário mock automaticamente para qualquer email
            authLog('Criando usuário mock automaticamente para desenvolvimento', 'info', { email })
            userData = {
              id: 'local-user-' + Date.now(),
              email,
              user_metadata: { 
                full_name: email.split('@')[0] || 'Usuário Demo',
                avatar_url: null
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            // Salvar usuário criado automaticamente
            localStorage.setItem('zetafin-local-user', JSON.stringify(userData))
            authLog('Usuário mock criado e salvo', 'success', { userId: userData.id, email })
          } else {
            userData = JSON.parse(localUser)
            
            // Se o email for diferente, criar novo usuário para este email
            if (userData.email !== email) {
              authLog('Email diferente detectado, criando novo usuário mock', 'info', { oldEmail: userData.email, newEmail: email })
              userData = {
                id: 'local-user-' + Date.now(),
                email,
                user_metadata: { 
                  full_name: email.split('@')[0] || 'Usuário Demo',
                  avatar_url: null
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              
              // Salvar novo usuário
              localStorage.setItem('zetafin-local-user', JSON.stringify(userData))
              authLog('Novo usuário mock criado e salvo', 'success', { userId: userData.id, email })
            }
          }
          
          // Criar nova sessão local
          const mockSession = {
            user: userData,
            access_token: 'local-token-' + Date.now(),
            refresh_token: 'local-refresh-' + Date.now(),
            expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
            token_type: 'bearer'
          }
          
          authLog('Salvando nova sessão local', 'info', { userId: userData.id })
          localStorage.setItem('zetafin-local-session', JSON.stringify(mockSession))
          
          // Atualizar estado
          setUser(userData as any)
          setSession(mockSession as any)
          
          authLog('Login local realizado com sucesso', 'success', { email, userId: userData.id })
          throttledSuccessToast('Login realizado com sucesso!', 'login-success')
          return
        }
        
        // Autenticação com Supabase (quando habilitado)
        authLog('Iniciando autenticação com Supabase', 'info', { email })
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout no login')), 15000)
        })

        const loginPromise = supabase.auth.signInWithPassword({
          email,
          password
        })

        const { error } = await Promise.race([loginPromise, timeoutPromise]) as any

        if (error) {
          authLog('Erro na autenticação Supabase', 'error', { error: error.message })
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos')
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Por favor, confirme seu email antes de fazer login')
          } else if (error.message.includes('Timeout')) {
            toast.error('Login demorou muito. Verifique sua conexão e tente novamente.')
          } else {
            toast.error('Erro ao fazer login')
          }
          throw error
        }
        
        authLog('Login Supabase realizado com sucesso', 'success', { email })
      } catch (error) {
        authLog('Erro no processo de login', 'error', error)
        if (error instanceof Error && error.message.includes('Timeout')) {
          toast.error('Login demorou muito. Verifique sua conexão e tente novamente.')
        }
        throw error
      } finally {
        setLoading(false)
      }
    }

    const signInWithGoogle = async () => {
      try {
        authLog('Iniciando login com Google', 'info')
        setLoading(true)
        
        if (!USE_SUPABASE) {
          // Modo de desenvolvimento - login simulado com Google
          authLog('Login simulado com Google em modo de desenvolvimento', 'info')
          
          // Simular um pequeno delay para parecer real
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Criar usuário mock do Google
          const mockGoogleUser = {
            id: 'google-demo-user',
            email: 'google@demo.com',
            name: 'Usuário Google',
            avatar: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          // Salvar no localStorage
          localStorage.setItem('auth_user', JSON.stringify(mockGoogleUser))
          localStorage.setItem('auth_session', JSON.stringify({
            access_token: 'demo-google-token',
            refresh_token: 'demo-google-refresh',
            expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
          }))
          
          // Atualizar estado
          setUser(mockGoogleUser)
          setSession({
            access_token: 'demo-google-token',
            refresh_token: 'demo-google-refresh',
            expires_at: Date.now() + (24 * 60 * 60 * 1000)
          })
          
          authLog('Login simulado com Google realizado com sucesso', 'success', { user: mockGoogleUser })
          toast.success('Login com Google realizado com sucesso! (modo demo)')
          setLoading(false)
          return
        }
        
        // Timeout de 30 segundos para OAuth
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout no login com Google')), 30000)
        })

        const loginPromise = supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })

        const { error } = await Promise.race([loginPromise, timeoutPromise]) as any

        if (error) {
          authLog('Erro no login com Google', 'error', { error: error.message })
          if (error.message.includes('provider is not enabled')) {
            toast.error('Login com Google não está configurado. Use email e senha.')
          } else if (error.message.includes('Timeout')) {
            toast.error('Login com Google demorou muito. Tente novamente.')
          } else {
            toast.error('Erro ao fazer login com Google')
          }
        } else {
          authLog('Login com Google iniciado com sucesso', 'success')
        }
      } catch (error) {
        authLog('Erro no processo de login com Google', 'error', error)
        if (error instanceof Error && error.message.includes('Timeout')) {
          toast.error('Login com Google demorou muito. Tente novamente.')
        } else {
          toast.error('Erro ao fazer login com Google')
        }
      } finally {
        setLoading(false)
      }
    }

    const resetPassword = async (email: string) => {
      try {
        authLog('Iniciando reset de senha', 'info', { email })
        setLoading(true)
        
        if (!USE_SUPABASE) {
          authLog('Reset de senha não disponível em modo local', 'warning')
          toast.error('Reset de senha não disponível em modo de desenvolvimento')
          return
        }
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) {
          authLog('Erro no reset de senha', 'error', { error: error.message })
          toast.error('Erro ao enviar email de recuperação')
          throw error
        } else {
          authLog('Email de reset enviado com sucesso', 'success', { email })
          toast.success('Email de recuperação enviado!')
        }
      } catch (error) {
        authLog('Erro no processo de reset de senha', 'error', error)
        throw error
      } finally {
        setLoading(false)
      }
    }

    const signOut = async () => {
      try {
        authLog('INICIANDO LOGOUT', 'info', { user: user?.email, USE_SUPABASE })
        setLoading(true)
        
        if (!USE_SUPABASE) {
          // Logout local para desenvolvimento
          authLog('Usando logout local', 'info')
          
          // Marcar que estamos fazendo logout para evitar recarregamento automático
          authLog('Marcando logout em progresso', 'info')
          localStorage.setItem('zetafin-logout-in-progress', 'true')
          
          // Primeiro, limpar o estado imediatamente
          authLog('Limpando estado de autenticação', 'info')
          setUser(null)
          setSession(null)
          
          // Aguardar um pouco para garantir que o estado foi limpo
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Limpar TODOS os dados do localStorage relacionados ao ZetaFin
          const keysToRemove = [
            // Chaves de autenticação
            'zetafin-local-user',
            'zetafin-local-session',
            'sb-user',
            
            // Chaves de dados da aplicação
            'zetafin_transactions',
            'zetafin_categories',
            'zetafin_user',
            'zetafin_auth_token',
            'zetafin_theme',
            'zetafin_metas',
            
            // Chaves antigas que podem existir
            'transactions',
            'categories',
            'user',
            'auth_token',
            'theme',
            
            // Outras chaves possíveis
            'zetafin-transactions',
            'zetafin-categories',
            'zetafin-user',
            'zetafin-theme',
            
            // Chaves de migração e backup
            'migration_backup',
            
            // Chaves de sessão
            'zetafin_session',
            
            // Chaves de configuração
            'zetafin_edit_mode'
          ]
          
          authLog('Limpando localStorage', 'info', { keysToRemove: keysToRemove.length })
          keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
              localStorage.removeItem(key)
              authLog(`Removido: ${key}`, 'info')
            }
          })
          
          authLog('Logout local realizado com sucesso - localStorage completamente limpo', 'success')
          throttledSuccessToast('Logout realizado com sucesso!', 'logout-success')
          
          // Aguardar um pouco para garantir que o estado foi limpo
          await new Promise(resolve => setTimeout(resolve, 200))
          
          authLog('Removendo flag de logout e redirecionando', 'info')
          localStorage.removeItem('zetafin-logout-in-progress')
          
          // Aguardar mais um pouco antes do redirecionamento
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Usar window.location para garantir limpeza completa
          authLog('Redirecionando para login', 'info')
          window.location.href = '/login'
          return
        }
        
        // Logout com Supabase (quando habilitado)
        authLog('Iniciando logout Supabase', 'info')
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          authLog('Erro no logout Supabase', 'error', { error: error.message })
          toast.error('Erro ao fazer logout')
        } else {
          authLog('Logout Supabase realizado com sucesso', 'success')
          throttledSuccessToast('Logout realizado com sucesso!', 'logout-success')
        }
      } catch (error) {
        authLog('Erro no processo de logout', 'error', error)
        toast.error('Erro ao fazer logout')
      } finally {
        setLoading(false)
      }
    }

    const value: AuthContextType = {
      user,
      session,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      signOut
    }

    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    )
  }

  export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
  }