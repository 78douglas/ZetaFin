import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingScreen from './LoadingScreen'
import { USE_SUPABASE } from '../lib/config'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean // Nova prop para controlar se requer autenticação
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = false }) => {
  const { user, loading } = useAuth()

  // Se USE_SUPABASE for false, permite acesso sem autenticação
  if (!USE_SUPABASE || !requireAuth) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <LoadingScreen 
        message="Verificando autenticação..."
        showRetry={true}
        timeout={15}
      />
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute