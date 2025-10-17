import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { useDatabase } from '@/react-app/hooks/useDatabase';

interface SessionData {
  userId: string;
  email: string;
  lastActivity: string;
  sessionId: string;
}

interface StorageOptions {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
}

export const useSessionPersistence = () => {
  const { user } = useAuth();
  const { supabase } = useDatabase();
  
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const SESSION_KEY = 'zetafin_session';
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas

  // Gerar ID único para a sessão
  const generateSessionId = useCallback(() => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Salvar dados da sessão em múltiplos storages
  const saveSessionData = useCallback(async (
    data: SessionData, 
    options: StorageOptions = { localStorage: true, sessionStorage: true, indexedDB: true }
  ) => {
    const sessionString = JSON.stringify(data);

    try {
      // localStorage
      if (options.localStorage) {
        localStorage.setItem(SESSION_KEY, sessionString);
      }

      // sessionStorage
      if (options.sessionStorage) {
        sessionStorage.setItem(SESSION_KEY, sessionString);
      }

      // IndexedDB
      if (options.indexedDB) {
        await saveToIndexedDB(SESSION_KEY, data);
      }

      setSessionData(data);
      console.log('Dados da sessão salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados da sessão:', error);
    }
  }, []);

  // Carregar dados da sessão de múltiplos storages
  const loadSessionData = useCallback(async (): Promise<SessionData | null> => {
    try {
      // Tentar carregar do localStorage primeiro
      let sessionString = localStorage.getItem(SESSION_KEY);
      
      // Se não encontrar, tentar sessionStorage
      if (!sessionString) {
        sessionString = sessionStorage.getItem(SESSION_KEY);
      }

      // Se não encontrar, tentar IndexedDB
      if (!sessionString) {
        const indexedDBData = await loadFromIndexedDB(SESSION_KEY);
        if (indexedDBData) {
          return indexedDBData as SessionData;
        }
      }

      if (sessionString) {
        const data = JSON.parse(sessionString) as SessionData;
        setSessionData(data);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Erro ao carregar dados da sessão:', error);
      return null;
    }
  }, []);

  // Limpar dados da sessão de todos os storages
  const clearSessionData = useCallback(async () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      await deleteFromIndexedDB(SESSION_KEY);
      
      setSessionData(null);
      setIsSessionValid(false);
      console.log('Dados da sessão limpos');
    } catch (error) {
      console.error('Erro ao limpar dados da sessão:', error);
    }
  }, []);

  // Validar se a sessão ainda é válida
  const validateSession = useCallback(async (data: SessionData): Promise<boolean> => {
    try {
      // Verificar se a sessão não expirou
      const lastActivity = new Date(data.lastActivity);
      const now = new Date();
      const timeDiff = now.getTime() - lastActivity.getTime();

      if (timeDiff > SESSION_TIMEOUT) {
        console.log('Sessão expirada por tempo');
        return false;
      }

      // Verificar se o usuário ainda existe no banco
      if (supabase) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', data.userId)
          .single();

        if (error || !userData) {
          console.log('Usuário não encontrado no banco');
          return false;
        }

        // Verificar se o email ainda é o mesmo
        if (userData.email !== data.email) {
          console.log('Email do usuário mudou');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  }, [supabase]);

  // Atualizar atividade da sessão
  const updateSessionActivity = useCallback(async () => {
    if (!sessionData) return;

    const updatedData = {
      ...sessionData,
      lastActivity: new Date().toISOString()
    };

    await saveSessionData(updatedData);
  }, [sessionData, saveSessionData]);

  // Inicializar sessão para usuário logado
  const initializeSession = useCallback(async () => {
    if (!user) return;

    const newSessionData: SessionData = {
      userId: user.id,
      email: user.email || '',
      lastActivity: new Date().toISOString(),
      sessionId: generateSessionId()
    };

    await saveSessionData(newSessionData);
    setIsSessionValid(true);
  }, [user, generateSessionId, saveSessionData]);

  // Recuperar sessão existente
  const recoverSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await loadSessionData();
      
      if (data) {
        const isValid = await validateSession(data);
        
        if (isValid) {
          setIsSessionValid(true);
          await updateSessionActivity();
          console.log('Sessão recuperada com sucesso');
        } else {
          await clearSessionData();
          console.log('Sessão inválida, dados limpos');
        }
      }
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error);
      await clearSessionData();
    } finally {
      setIsLoading(false);
    }
  }, [loadSessionData, validateSession, updateSessionActivity, clearSessionData]);

  // Funções auxiliares para IndexedDB
  const saveToIndexedDB = useCallback((key: string, data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ZetaFinDB', 1);

      request.onerror = () => reject(request.error);

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
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, []);

  const loadFromIndexedDB = useCallback((key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ZetaFinDB', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sessions'], 'readonly');
        const store = transaction.objectStore('sessions');
        
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }, []);

  const deleteFromIndexedDB = useCallback((key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ZetaFinDB', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
        
        store.delete(key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, []);

  // Monitorar mudanças no usuário
  useEffect(() => {
    if (user && !sessionData) {
      initializeSession();
    } else if (!user && sessionData) {
      clearSessionData();
    }
  }, [user, sessionData, initializeSession, clearSessionData]);

  // Atualizar atividade periodicamente
  useEffect(() => {
    if (!isSessionValid) return;

    const interval = setInterval(() => {
      updateSessionActivity();
    }, 5 * 60 * 1000); // Atualizar a cada 5 minutos

    return () => clearInterval(interval);
  }, [isSessionValid, updateSessionActivity]);

  // Monitorar visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSessionValid) {
        updateSessionActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSessionValid, updateSessionActivity]);

  // Recuperar sessão na inicialização
  useEffect(() => {
    if (!user) {
      recoverSession();
    }
  }, [user, recoverSession]);

  return {
    isSessionValid,
    sessionData,
    isLoading,
    saveSessionData,
    loadSessionData,
    clearSessionData,
    validateSession,
    updateSessionActivity,
    initializeSession,
    recoverSession
  };
};