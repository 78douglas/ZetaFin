import { toast } from 'sonner'

// Map para controlar throttle de notificações
const notificationThrottleMap = new Map<string, number>()

// Tempo de throttle em milissegundos (5 segundos)
const THROTTLE_TIME = 5000

/**
 * Exibe uma notificação de erro com throttle para evitar spam
 * @param message Mensagem da notificação
 * @param key Chave única para identificar o tipo de notificação (opcional)
 */
export const throttledErrorToast = (message: string, key?: string) => {
  const notificationKey = key || message
  const now = Date.now()
  const lastShown = notificationThrottleMap.get(notificationKey) || 0

  // Se passou tempo suficiente desde a última notificação, exibir
  if (now - lastShown >= THROTTLE_TIME) {
    toast.error(message)
    notificationThrottleMap.set(notificationKey, now)
    console.log(`🔔 Notificação exibida: ${message}`)
  } else {
    console.log(`⏭️ Notificação throttled: ${message} (última há ${now - lastShown}ms)`)
  }
}

/**
 * Exibe uma notificação de sucesso com throttle para evitar spam
 * @param message Mensagem da notificação
 * @param key Chave única para identificar o tipo de notificação (opcional)
 */
export const throttledSuccessToast = (message: string, key?: string) => {
  const notificationKey = key || message
  const now = Date.now()
  const lastShown = notificationThrottleMap.get(notificationKey) || 0

  // Se passou tempo suficiente desde a última notificação, exibir
  if (now - lastShown >= THROTTLE_TIME) {
    toast.success(message)
    notificationThrottleMap.set(notificationKey, now)
    console.log(`🔔 Notificação exibida: ${message}`)
  } else {
    console.log(`⏭️ Notificação throttled: ${message} (última há ${now - lastShown}ms)`)
  }
}

/**
 * Limpa o cache de throttle para uma chave específica
 * @param key Chave da notificação
 */
export const clearNotificationThrottle = (key: string) => {
  notificationThrottleMap.delete(key)
}

/**
 * Limpa todo o cache de throttle
 */
export const clearAllNotificationThrottle = () => {
  notificationThrottleMap.clear()
}