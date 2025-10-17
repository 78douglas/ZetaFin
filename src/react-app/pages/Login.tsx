import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { USE_SUPABASE } from '../lib/config'
import { LogIn, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

const Login: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loading, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  // Redirecionar automaticamente quando o usuário fizer login com sucesso
  useEffect(() => {
    if (user && !loading) {
      console.log('✅ Usuário logado detectado, redirecionando para dashboard...')
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      return
    }

    try {
      setFormLoading(true)
      await signInWithEmail(formData.email, formData.password)
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setFormLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.name) {
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    try {
      setFormLoading(true)
      await signUpWithEmail(formData.email, formData.password, formData.name)
      setMode('login')
      setFormData({ email: '', password: '', name: '', confirmPassword: '' })
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setFormLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      return
    }

    try {
      setFormLoading(true)
      await resetPassword(formData.email)
      setMode('login')
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">Z</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ZetaFin</h1>
          <p className="text-gray-600">Sua gestão financeira pessoal</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {mode === 'login' && 'Bem-vindo de volta!'}
              {mode === 'register' && 'Criar nova conta'}
              {mode === 'forgot' && 'Recuperar senha'}
            </h2>
            <p className="text-gray-600 text-sm">
              {mode === 'login' && 'Faça login para acessar suas finanças'}
              {mode === 'register' && 'Crie sua conta para começar'}
              {mode === 'forgot' && 'Digite seu email para recuperar a senha'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                mode === 'login'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                mode === 'register'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Formulário de Login */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={formLoading || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Formulário de Registro */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}

          {/* Formulário de Recuperação de Senha */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Enviando...' : 'Enviar email de recuperação'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                Voltar ao login
              </button>
            </form>
          )}

          {/* Divisor "ou" */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Login com Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loading || formLoading}
            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              {loading ? 'Entrando...' : 'Continuar com Google'}
            </span>
          </button>

          {/* Aviso para modo de desenvolvimento */}
          {!USE_SUPABASE && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-700">
                <strong>Modo de Desenvolvimento</strong><br />
                Use qualquer email/senha ou clique em "Continuar com Google" para login demo
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Termos de Serviço
              </a>{' '}
              e{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <LogIn className="w-4 h-4" />
            <span>Login seguro e protegido</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login