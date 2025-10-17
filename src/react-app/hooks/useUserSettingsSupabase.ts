import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { UserSettings, UserSettingsUpdate } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export const useUserSettingsSupabase = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar configurações do usuário
  const loadSettings = async () => {
    if (!user) {
      setSettings(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Erro ao carregar configurações:', error)
        setError('Erro ao carregar configurações')
        return
      }

      setSettings(data)
    } catch (error) {
      console.error('Erro inesperado ao carregar configurações:', error)
      setError('Erro inesperado ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  // Atualizar configurações
  const updateSettings = async (updates: UserSettingsUpdate) => {
    if (!user || !settings) {
      toast.error('Usuário não autenticado ou configurações não carregadas')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('*')
        .single()

      if (error) {
        console.error('Erro ao atualizar configurações:', error)
        toast.error('Erro ao atualizar configurações')
        return null
      }

      setSettings(data)
      toast.success('Configurações atualizadas com sucesso!')
      return data
    } catch (error) {
      console.error('Erro inesperado ao atualizar configurações:', error)
      toast.error('Erro inesperado ao atualizar configurações')
      return null
    }
  }

  // Atualizar moeda
  const updateCurrency = async (currency: string) => {
    return updateSettings({ currency })
  }

  // Atualizar idioma
  const updateLanguage = async (language: string) => {
    return updateSettings({ language })
  }

  // Atualizar tema
  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    return updateSettings({ theme })
  }

  // Atualizar notificações
  const updateNotifications = async (notifications: boolean) => {
    return updateSettings({ notifications_enabled: notifications })
  }

  // Atualizar notificações de metas
  const updateGoalNotifications = async (goalNotifications: boolean) => {
    return updateSettings({ goal_notifications: goalNotifications })
  }

  // Atualizar formato de data
  const updateDateFormat = async (dateFormat: string) => {
    return updateSettings({ date_format: dateFormat })
  }

  // Atualizar fuso horário
  const updateTimezone = async (timezone: string) => {
    return updateSettings({ timezone })
  }

  // Resetar configurações para padrão
  const resetToDefaults = async () => {
    const defaultSettings: UserSettingsUpdate = {
      currency: 'BRL',
      language: 'pt-BR',
      theme: 'system',
      notifications_enabled: true,
      goal_notifications: true,
      date_format: 'DD/MM/YYYY',
      timezone: 'America/Sao_Paulo'
    }

    return updateSettings(defaultSettings)
  }

  // Obter configuração específica
  const getSetting = (key: keyof UserSettings) => {
    return settings?.[key]
  }

  // Verificar se notificações estão habilitadas
  const areNotificationsEnabled = () => {
    return settings?.notifications_enabled ?? true
  }

  // Verificar se notificações de metas estão habilitadas
  const areGoalNotificationsEnabled = () => {
    return settings?.goal_notifications ?? true
  }

  // Obter tema atual
  const getCurrentTheme = () => {
    return settings?.theme ?? 'system'
  }

  // Obter moeda atual
  const getCurrentCurrency = () => {
    return settings?.currency ?? 'BRL'
  }

  // Obter idioma atual
  const getCurrentLanguage = () => {
    return settings?.language ?? 'pt-BR'
  }

  // Obter formato de data atual
  const getCurrentDateFormat = () => {
    return settings?.date_format ?? 'DD/MM/YYYY'
  }

  // Obter fuso horário atual
  const getCurrentTimezone = () => {
    return settings?.timezone ?? 'America/Sao_Paulo'
  }

  useEffect(() => {
    loadSettings()
  }, [user])

  // Escutar mudanças em tempo real
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('user_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadSettings()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateCurrency,
    updateLanguage,
    updateTheme,
    updateNotifications,
    updateGoalNotifications,
    updateDateFormat,
    updateTimezone,
    resetToDefaults,
    getSetting,
    areNotificationsEnabled,
    areGoalNotificationsEnabled,
    getCurrentTheme,
    getCurrentCurrency,
    getCurrentLanguage,
    getCurrentDateFormat,
    getCurrentTimezone,
    refreshSettings: loadSettings
  }
}