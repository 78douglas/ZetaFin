import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const AuthDebugger: React.FC = () => {
  const { user, session, loading } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [localStorageData, setLocalStorageData] = useState<any>({})

  useEffect(() => {
    // Monitorar mudanças no estado de autenticação
    const authState = {
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? { access_token: session.access_token?.substring(0, 20) + '...', expires_at: session.expires_at } : null,
      loading
    }

    setLogs(prev => [...prev.slice(-9), authState]) // Manter apenas os últimos 10 logs

    // Monitorar localStorage
    const localData = {
      'zetafin-local-user': localStorage.getItem('zetafin-local-user'),
      'zetafin-local-session': localStorage.getItem('zetafin-local-session'),
      'zetafin-logout-in-progress': localStorage.getItem('zetafin-logout-in-progress'),
      'zetafin-auth-logs': localStorage.getItem('zetafin-auth-logs')
    }
    setLocalStorageData(localData)
  }, [user, session, loading])

  const clearLogs = () => {
    setLogs([])
    localStorage.removeItem('zetafin-auth-logs')
  }

  const simulateLogout = () => {
    localStorage.setItem('zetafin-logout-in-progress', 'true')
    setTimeout(() => {
      localStorage.removeItem('zetafin-local-user')
      localStorage.removeItem('zetafin-local-session')
      localStorage.removeItem('zetafin-logout-in-progress')
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Auth Debugger</h3>
        <button 
          onClick={clearLogs}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-xs mb-1">Estado Atual:</h4>
          <div className="text-xs space-y-1">
            <div>User: {user ? `${user.email} (${user.id})` : 'null'}</div>
            <div>Session: {session ? 'ativa' : 'null'}</div>
            <div>Loading: {loading ? 'true' : 'false'}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-xs mb-1">localStorage:</h4>
          <div className="text-xs space-y-1">
            {Object.entries(localStorageData).map(([key, value]) => (
              <div key={key}>
                <span className="font-mono">{key}:</span> {value ? 'presente' : 'null'}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-xs mb-1">Histórico de Estados:</h4>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="border-b border-gray-100 pb-1">
                <div className="font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                <div>User: {log.user ? log.user.email : 'null'}</div>
                <div>Loading: {log.loading ? 'true' : 'false'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={simulateLogout}
            className="text-xs bg-orange-500 text-white px-2 py-1 rounded w-full"
          >
            Simular Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthDebugger