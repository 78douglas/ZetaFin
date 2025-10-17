import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  showRetry?: boolean
  onRetry?: () => void
  timeout?: number // em segundos
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...", 
  showRetry = false,
  onRetry,
  timeout = 15
}) => {
  const [loadingTime, setLoadingTime] = useState(0)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 1
        if (newTime >= timeout) {
          setShowTimeoutWarning(true)
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeout])

  const handleRetry = () => {
    setLoadingTime(0)
    setShowTimeoutWarning(false)
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        {/* Indicador de conexão */}
        <div className="flex items-center justify-center mb-4">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className={`ml-2 text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Spinner de loading */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        
        {/* Mensagem principal */}
        <p className="text-gray-600 mb-2 font-medium">{message}</p>
        <p className="text-sm text-gray-400">Tempo: {loadingTime}s</p>

        {/* Aviso de timeout */}
        {(showTimeoutWarning || showRetry) && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800 font-medium">
                Carregamento demorado
              </p>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              {!isOnline 
                ? "Você está offline. Verifique sua conexão com a internet."
                : "O carregamento está demorando mais que o esperado. Isso pode ser devido a problemas de conexão ou servidor."
              }
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isOnline}
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Dicas para o usuário */}
        {loadingTime > 10 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Dica:</strong> Se o problema persistir, tente:
            </p>
            <ul className="text-xs text-blue-600 mt-1 text-left">
              <li>• Verificar sua conexão com a internet</li>
              <li>• Recarregar a página (F5)</li>
              <li>• Limpar o cache do navegador</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingScreen