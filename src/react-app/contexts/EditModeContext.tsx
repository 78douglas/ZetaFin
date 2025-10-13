import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

const EDIT_MODE_STORAGE_KEY = 'zetafin_edit_mode';

interface EditModeProviderProps {
  children: ReactNode;
}

export function EditModeProvider({ children }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    // Carregar estado do localStorage na inicialização
    try {
      const saved = localStorage.getItem(EDIT_MODE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Erro ao carregar modo edição do localStorage:', error);
      return false;
    }
  });

  // Salvar no localStorage sempre que o estado mudar
  useEffect(() => {
    try {
      localStorage.setItem(EDIT_MODE_STORAGE_KEY, JSON.stringify(isEditMode));
    } catch (error) {
      console.error('Erro ao salvar modo edição no localStorage:', error);
    }
  }, [isEditMode]);

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const setEditMode = (enabled: boolean) => {
    setIsEditMode(enabled);
  };

  const value: EditModeContextType = {
    isEditMode,
    toggleEditMode,
    setEditMode,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode(): EditModeContextType {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode deve ser usado dentro de um EditModeProvider');
  }
  return context;
}