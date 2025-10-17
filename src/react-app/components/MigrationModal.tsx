import React, { useState, useEffect } from 'react'
import { useDataMigration } from '../hooks/useDataMigration'
import { useAuth } from '../contexts/AuthContext'
import { Database, Upload, AlertTriangle, CheckCircle, X } from 'lucide-react'

const MigrationModal: React.FC = () => {
  const { user } = useAuth()
  const {
    migrateFromLocalStorage,
    migrating,
    migrationProgress,
    hasLocalData,
    getLocalDataSummary
  } = useDataMigration()

  const [showModal, setShowModal] = useState(false)
  const [dataSummary, setDataSummary] = useState({ categoriesCount: 0, transactionsCount: 0, hasData: false })

  useEffect(() => {
    if (user && hasLocalData()) {
      const summary = getLocalDataSummary()
      setDataSummary(summary)
      setShowModal(true)
    }
  }, [user])

  const handleMigrate = async () => {
    try {
      await migrateFromLocalStorage()
      setShowModal(false)
    } catch (error) {
      console.error('Erro na migração:', error)
    }
  }

  const handleSkip = () => {
    setShowModal(false)
  }

  if (!showModal || !dataSummary.hasData) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Migração de Dados
            </h2>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={migrating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-gray-700 text-sm">
                Encontramos dados salvos localmente em seu dispositivo. 
                Deseja migrar esses dados para sua conta na nuvem?
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Dados encontrados:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Categorias:</span>
                <span className="font-medium">{dataSummary.categoriesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Transações:</span>
                <span className="font-medium">{dataSummary.transactionsCount}</span>
              </div>
            </div>
          </div>

          {migrating && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Migrando dados...</span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(migrationProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${migrationProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Benefícios da migração:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Acesso aos dados em qualquer dispositivo</li>
                  <li>• Backup automático na nuvem</li>
                  <li>• Sincronização em tempo real</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            disabled={migrating}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pular por agora
          </button>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{migrating ? 'Migrando...' : 'Migrar Dados'}</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Os dados locais serão mantidos como backup após a migração
        </p>
      </div>
    </div>
  )
}

export default MigrationModal