import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, ArrowLeft, Key } from 'lucide-react'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      return
    }

    setIsLoading(true)
    const { error } = await resetPassword(email)
    
    if (!error) {
      setEmailSent(true)
    }
    
    setIsLoading(false)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Email enviado!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enviamos um link de recuperação para:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Tentar outro email
              </button>

              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center">
            <Key className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Esqueceu sua senha?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Enviar link de recuperação'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword