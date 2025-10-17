import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { toast } from 'sonner';

interface SessionData {
  userId: string;
  email: string;
  name: string;
  coupleData?: any;
  lastActivity: string;
  sessionId: string;
  tabId: string;
}

interface StorageConfig {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
}

const STORAGE_KEYS = {
  SESSION: 'zetafin_session',
  COUPLE_DATA: 'zetafin_couple_data',
  LAST_ACTIVITY: 'zetafin_last_activity',
  SESSION_ID: 'zetafin_session_id',
  TAB_ID: 'zetafin_tab_id'
};

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minuto
const SYNC_INTERVAL = 5 * 1000; // 5 segundos

export const useSessionPersistence = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sessionValid, setSessionValid] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageConfig>({
    localStorage: false,
    sessionStorage: false,
    indexedDB: false
  });

  const sessionIdRef = useRef<string>('');
  const tabIdRef = useRef<string>('');
  const activityTimerRef = useRef<NodeJS.Timeout>();
  const syncTimerRef = useRef<NodeJS.Timeout>();

  // Gerar IDs únicos
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Verificar suporte aos tipos de armazenamento
  const checkStorageSupport = useCallback(() => {
    const status: StorageConfig = {
      localStorage: false,
      sessionStorage: false,
      indexedDB: false
    };

    // Testar localStorage
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      status.localStorage = true;
    } catch (e) {
      console.warn('localStorage não disponível:', e);
    }

    // Testar sessionStorage
    try {
      const testKey = '__test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      status.sessionStorage = true;
    } catch (e) {
      console.warn('sessionStorage não disponível:', e);
    }

    // Testar IndexedDB
    try {
      status.indexedDB = 'indexedDB' in window;
    } catch (e) {
      console.warn('IndexedDB não disponível:', e);
    }

    setStorageStatus(status);
    return status;
  }, []);

  // Salvar dados no localStorage
  const saveToLocalStorage = useCallback((key: string, data: any) => {
    if (!storageStatus.localStorage) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      return false;
    }
  }, [storageStatus.localStorage]);

  // Carregar dados do localStorage
  const loadFromLocalStorage = useCallback((key: string) => {
    if (!storageStatus.localStorage) return null;
    
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return null;
    }
  }, [storageStatus.localStorage]);

  // Salvar dados no sessionStorage
  const saveToSessionStorage = useCallback((key: string, data: any) => {
    if (!storageStatus.sessionStorage) return false;
    
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no sessionStorage:', error);
      return false;
    }
  }, [storageStatus.sessionStorage]);

  // Carregar dados do sessionStorage
  const loadFromSessionStorage = useCallback((key: string) => {
    if (!storageStatus.sessionStorage) return null;
    
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar do sessionStorage:', error);
      return null;
    }
  }, [storageStatus.sessionStorage]);

  // Salvar dados no IndexedDB
  const saveToIndexedDB = useCallback(async (key: string, data: any) => {
    if (!storageStatus.indexedDB) return false;

    try {
      return new Promise((resolve) => {
        const request = indexedDB.open('ZetaFinDB', 1);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('sessions')) {
            db.createObjectStore('sessions');
          }
        };
        
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['sessions'], 'readwrite');
          const store = transaction.objectStore('sessions');
          
          store.put(data, key);
          
          transaction.oncomplete = () => {
            db.close();
            resolve(true);
          };
          
          transaction.onerror = () => {
            db.close();
            resolve(false);
          };
        };
        
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Erro ao salvar no IndexedDB:', error);
      return false;
    }
  }, [storageStatus.indexedDB]);

  // Carregar dados do IndexedDB
  const loadFromIndexedDB = useCallback(async (key: string) => {
    if (!storageStatus.indexedDB) return null;

    try {
      return new Promise((resolve) => {
        const request = indexedDB.open('ZetaFinDB', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          
          if (!db.objectStoreNames.contains('sessions')) {
            db.close();
            resolve(null);
            return;
          }
          
          const transaction = db.transaction(['sessions'], 'readonly');
          const store = transaction.objectStore('sessions');
          const getRequest = store.get(key);
          
          getRequest.onsuccess = () => {
            db.close();
            resolve(getRequest.result || null);
          };
          
          getRequest.onerror = () => {
            db.close();
            resolve(null);
          };
        };
        
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Erro ao carregar do IndexedDB:', error);
      return null;
    }
  }, [storageStatus.indexedDB]);

  // Salvar sessão em múltiplos locais
  const saveSession = useCallback(async (sessionData: SessionData) => {
    const promises = [];

    // localStorage (persistente entre sessões)
    if (storageStatus.localStorage) {
      promises.push(Promise.resolve(saveToLocalStorage(STORAGE_KEYS.SESSION, sessionData)));
    }

    // sessionStorage (apenas para a sessão atual)
    if (storageStatus.sessionStorage) {
      promises.push(Promise.resolve(saveToSessionStorage(STORAGE_KEYS.SESSION, sessionData)));
    }

    // IndexedDB (backup robusto)
    if (storageStatus.indexedDB) {
      promises.push(saveToIndexedDB(STORAGE_KEYS.SESSION, sessionData));
    }

    try {
      await Promise.all(promises);
      setLastSync(new Date());
      return true;
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      return false;
    }
  }, [storageStatus, saveToLocalStorage, saveToSessionStorage, saveToIndexedDB]);

  // Carregar sessão de múltiplos locais
  const loadSession = useCallback(async (): Promise<SessionData | null> => {
    // Tentar carregar do sessionStorage primeiro (mais rápido)
    let sessionData = loadFromSessionStorage(STORAGE_KEYS.SESSION);
    
    if (sessionData) {
      return sessionData;
    }

    // Tentar localStorage
    sessionData = loadFromLocalStorage(STORAGE_KEYS.SESSION);
    
    if (sessionData) {
      // Restaurar no sessionStorage para próximas consultas
      saveToSessionStorage(STORAGE_KEYS.SESSION, sessionData);
      return sessionData;
    }

    // Tentar IndexedDB como último recurso
    if (storageStatus.indexedDB) {
      sessionData = await loadFromIndexedDB(STORAGE_KEYS.SESSION);
      
      if (sessionData) {
        // Restaurar em outros storages
        saveToLocalStorage(STORAGE_KEYS.SESSION, sessionData);
        saveToSessionStorage(STORAGE_KEYS.SESSION, sessionData);
        return sessionData;
      }
    }

    return null;
  }, [storageStatus, loadFromLocalStorage, loadFromSessionStorage, loadFromIndexedDB, saveToLocalStorage, saveToSessionStorage]);

  // Limpar sessão de todos os locais
  const clearSession = useCallback(async () => {
    try {
      // localStorage
      if (storageStatus.localStorage) {
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      }

      // sessionStorage
      if (storageStatus.sessionStorage) {
        Object.values(STORAGE_KEYS).forEach(key => {
          sessionStorage.removeItem(key);
        });
      }

      // IndexedDB
      if (storageStatus.indexedDB) {
        const request = indexedDB.open('ZetaFinDB', 1);
        request.onsuccess = () => {
          const db = request.result;
          if (db.objectStoreNames.contains('sessions')) {
            const transaction = db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            store.clear();
          }
          db.close();
        };
      }

      setSessionValid(false);
      setLastSync(null);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  }, [storageStatus]);

  // Verificar se a sessão é válida
  const validateSession = useCallback(async (sessionData: SessionData): Promise<boolean> => {
    if (!sessionData || !sessionData.userId) {
      return false;
    }

    // Verificar timeout
    const lastActivity = new Date(sessionData.lastActivity);
    const now = new Date();
    const timeDiff = now.getTime() - lastActivity.getTime();

    if (timeDiff > SESSION_TIMEOUT) {
      console.log('Sessão expirada por timeout');
      return false;
    }

    // Verificar se o usuário ainda existe no Supabase
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', sessionData.userId)
        .single();

      if (error || !data) {
        console.log('Usuário não encontrado no banco:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  }, []);

  // Atualizar atividade da sessão
  const updateActivity = useCallback(async () => {
    if (!user?.id) return;

    const sessionData: SessionData = {
      userId: user.id,
      email: user.email || '',
      name: user.name || '',
      coupleData: user.couple_data,
      lastActivity: new Date().toISOString(),
      sessionId: sessionIdRef.current,
      tabId: tabIdRef.current
    };

    await saveSession(sessionData);
  }, [user, saveSession]);

  // Recuperar sessão
  const recoverSession = useCallback(async (): Promise<boolean> => {
    try {
      const sessionData = await loadSession();
      
      if (!sessionData) {
        console.log('Nenhuma sessão encontrada para recuperar');
        return false;
      }

      const isValid = await validateSession(sessionData);
      
      if (!isValid) {
        console.log('Sessão inválida, limpando dados');
        await clearSession();
        return false;
      }

      // Atualizar atividade
      await updateActivity();
      setSessionValid(true);
      
      console.log('Sessão recuperada com sucesso');
      toast.success('Sessão recuperada com sucesso!');
      
      return true;
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error);
      return false;
    }
  }, [loadSession, validateSession, clearSession, updateActivity]);

  // Inicializar sessão
  const initializeSession = useCallback(async () => {
    if (!user?.id) return;

    // Gerar IDs únicos para esta sessão
    sessionIdRef.current = generateId();
    tabIdRef.current = generateId();

    // Salvar dados da sessão
    await updateActivity();
    setSessionValid(true);

    // Configurar timer de atividade
    if (activityTimerRef.current) {
      clearInterval(activityTimerRef.current);
    }
    
    activityTimerRef.current = setInterval(updateActivity, ACTIVITY_CHECK_INTERVAL);

    // Configurar timer de sincronização
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
    }
    
    syncTimerRef.current = setInterval(async () => {
      if (isOnline) {
        await updateActivity();
      }
    }, SYNC_INTERVAL);

  }, [user, updateActivity, isOnline]);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Conexão restaurada');
      
      // Tentar recuperar sessão quando voltar online
      if (user?.id) {
        recoverSession();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Conexão perdida');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, recoverSession]);

  // Monitorar mudanças de aba/janela
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        // Aba ficou visível, verificar sessão
        recoverSession();
      }
    };

    const handleBeforeUnload = () => {
      // Salvar estado antes de fechar
      if (user?.id) {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, recoverSession, updateActivity]);

  // Inicializar quando o usuário estiver disponível
  useEffect(() => {
    checkStorageSupport();
    
    if (user?.id) {
      initializeSession();
    } else {
      clearSession();
    }

    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [user, checkStorageSupport, initializeSession, clearSession]);

  return {
    // Estados
    isOnline,
    sessionValid,
    lastSync,
    storageStatus,

    // Funções principais
    saveSession,
    loadSession,
    clearSession,
    recoverSession,
    updateActivity,
    validateSession,

    // Informações da sessão
    sessionId: sessionIdRef.current,
    tabId: tabIdRef.current
  };
};