import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCategoriesSupabase } from './useCategoriesSupabase'
import { useTransactionsSupabase } from './useTransactionsSupabase'
import { toast } from 'sonner'

interface LocalStorageTransaction {
  id: string
  descricao: string
  valor: number
  tipo: 'RECEITA' | 'DESPESA'
  data: string
  categoriaId: string
  observacoes?: string
}

interface LocalStorageCategory {
  id: string
  nome: string
  icone: string
  cor: string
  ativa: boolean
}

export const useDataMigration = () => {
  const { user } = useAuth()
  const { createCategory } = useCategoriesSupabase()
  const { addTransaction } = useTransactionsSupabase()
  const [migrating, setMigrating] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState(0)

  const migrateFromLocalStorage = async () => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      setMigrating(true)
      setMigrationProgress(0)

      // Verificar se há dados no localStorage
      const localCategories = localStorage.getItem('categories')
      const localTransactions = localStorage.getItem('transactions')

      if (!localCategories && !localTransactions) {
        toast.info('Nenhum dado encontrado no armazenamento local')
        return
      }

      let categories: LocalStorageCategory[] = []
      let transactions: LocalStorageTransaction[] = []

      if (localCategories) {
        categories = JSON.parse(localCategories)
      }

      if (localTransactions) {
        transactions = JSON.parse(localTransactions)
      }

      const totalItems = categories.length + transactions.length
      let processedItems = 0

      // Migrar categorias primeiro
      const categoryMapping: { [oldId: string]: string } = {}

      for (const category of categories) {
        try {
          const newCategory = await createCategory({
            name: category.nome,
            icon: category.icone,
            color: category.cor,
            is_default: false
          })

          categoryMapping[category.id] = newCategory.id
          processedItems++
          setMigrationProgress((processedItems / totalItems) * 100)
        } catch (error) {
          console.error('Erro ao migrar categoria:', category.nome, error)
        }
      }

      // Migrar transações
      for (const transaction of transactions) {
        try {
          await addTransaction({
            description: transaction.descricao,
            amount: transaction.valor,
            type: transaction.tipo,
            transaction_date: transaction.data,
            category_id: categoryMapping[transaction.categoriaId] || null,
            notes: transaction.observacoes || null
          })

          processedItems++
          setMigrationProgress((processedItems / totalItems) * 100)
        } catch (error) {
          console.error('Erro ao migrar transação:', transaction.descricao, error)
        }
      }

      // Fazer backup dos dados locais antes de limpar
      const backupData = {
        categories: localCategories,
        transactions: localTransactions,
        migratedAt: new Date().toISOString()
      }

      localStorage.setItem('migration_backup', JSON.stringify(backupData))

      // Limpar dados locais após migração bem-sucedida
      localStorage.removeItem('categories')
      localStorage.removeItem('transactions')

      toast.success(`Migração concluída! ${categories.length} categorias e ${transactions.length} transações migradas.`)
    } catch (error) {
      console.error('Erro na migração:', error)
      toast.error('Erro durante a migração de dados')
      throw error
    } finally {
      setMigrating(false)
      setMigrationProgress(0)
    }
  }

  const hasLocalData = () => {
    const localCategories = localStorage.getItem('categories')
    const localTransactions = localStorage.getItem('transactions')
    return !!(localCategories || localTransactions)
  }

  const getLocalDataSummary = () => {
    const localCategories = localStorage.getItem('categories')
    const localTransactions = localStorage.getItem('transactions')

    let categoriesCount = 0
    let transactionsCount = 0

    if (localCategories) {
      try {
        categoriesCount = JSON.parse(localCategories).length
      } catch (error) {
        console.error('Erro ao contar categorias locais:', error)
      }
    }

    if (localTransactions) {
      try {
        transactionsCount = JSON.parse(localTransactions).length
      } catch (error) {
        console.error('Erro ao contar transações locais:', error)
      }
    }

    return {
      categoriesCount,
      transactionsCount,
      hasData: categoriesCount > 0 || transactionsCount > 0
    }
  }

  const restoreFromBackup = async () => {
    try {
      const backupData = localStorage.getItem('migration_backup')
      if (!backupData) {
        throw new Error('Nenhum backup encontrado')
      }

      const backup = JSON.parse(backupData)
      
      if (backup.categories) {
        localStorage.setItem('categories', backup.categories)
      }
      
      if (backup.transactions) {
        localStorage.setItem('transactions', backup.transactions)
      }

      toast.success('Dados restaurados do backup com sucesso!')
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      toast.error('Erro ao restaurar dados do backup')
      throw error
    }
  }

  return {
    migrateFromLocalStorage,
    migrating,
    migrationProgress,
    hasLocalData,
    getLocalDataSummary,
    restoreFromBackup
  }
}