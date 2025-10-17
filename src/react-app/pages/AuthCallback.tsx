import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processando callback de autenticação...')
        
        // Verificar se há parâmetros de erro na URL
        const urlParams = new URLSearchParams(window.location.search)
        const errorParam = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')
        
        if (errorParam) {
          console.error('❌ Erro no callback OAuth:', errorParam, errorDescription)
          setError(errorDescription || errorParam)
          toast.error('Erro na autenticação: ' + (errorDescription || errorParam))
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Tentar obter a sessão
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Erro ao obter sessão:', error)
          setError('Erro ao processar autenticação')
          toast.error('Erro ao processar autenticação')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (data.session) {
          console.log('✅ Usuário autenticado com sucesso:', data.session.user.email)
          toast.success('Login realizado com sucesso!')
          // Redirecionar para dashboard
          navigate('/', { replace: true })
        } else {
          console.log('⚠️ Nenhuma sessão encontrada')
          setError('Nenhuma sessão encontrada')
          setTimeout(() => navigate('/login'), 3000)
        }
      } catch (error) {
        console.error('❌ Erro no callback de autenticação:', error)
        setError('Erro inesperado na autenticação')
        toast.error('Erro inesperado na autenticação')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro na Autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Processando autenticação...</h2>
        <p className="text-gray-600">Aguarde enquanto validamos seu login</p>
      </div>
    </div>
  )
}

export default AuthCallback