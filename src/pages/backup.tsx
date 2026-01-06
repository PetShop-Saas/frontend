import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { SaveOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'

interface Backup {
  filename: string
  size: number
  createdAt: string
  modifiedAt: string
}

interface BackupResult {
  success: boolean
  filename?: string
  filepath?: string
  size?: number
  recordCount?: any
  error?: string
}

export default function Backup() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadBackups()
  }, [router])

  const loadBackups = async () => {
    try {
      const data = await apiService.getBackups()
      setBackups(data as any)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setCreating(true)
      const result = await apiService.createBackup()
      if ((result as any).success) {
        alert(`Backup criado com sucesso!\nArquivo: ${(result as any).filename}\nTamanho: ${((result as any).size / 1024).toFixed(2)} KB`)
        await loadBackups()
      } else {
        alert('Erro ao criar backup')
      }
    } catch (error) {
      alert('Erro ao criar backup')
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      alert('Selecione um arquivo de backup')
      return
    }

    if (!confirm('ATENÇÃO: Esta ação irá substituir todos os dados atuais. Tem certeza que deseja continuar?')) {
      return
    }

    try {
      setRestoring(true)
      const text = await selectedFile.text()
      const backupData = JSON.parse(text)
      
      const result = await apiService.restoreBackup(backupData)
      if ((result as any).success) {
        alert('Backup restaurado com sucesso!')
        setSelectedFile(null)
      } else {
        alert('Erro ao restaurar backup')
      }
    } catch (error) {
      alert('Erro ao restaurar backup')
    } finally {
      setRestoring(false)
    }
  }

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm('Tem certeza que deseja excluir este backup?')) {
      return
    }

    try {
      const result = await apiService.deleteBackup(filename)
      if ((result as any).success) {
        alert('Backup excluído com sucesso!')
        await loadBackups()
      } else {
        alert('Erro ao excluir backup')
      }
    } catch (error) {
      alert('Erro ao excluir backup')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backup e Restore</h1>
            <p className="text-gray-600">Gerencie os backups dos seus dados</p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {creating ? 'Criando...' : 'Criar Backup'}
          </button>
        </div>

        {/* Criar Backup */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Backup</h2>
          <p className="text-gray-600 mb-4">
            Crie um backup completo de todos os seus dados. O backup incluirá clientes, pets, agendamentos, produtos, vendas e todas as outras informações.
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {creating ? 'Criando Backup...' : 'Criar Backup Agora'}
          </button>
        </div>

        {/* Restaurar Backup */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Restaurar Backup</h2>
          <p className="text-gray-600 mb-4">
            <strong>ATENÇÃO:</strong> Restaurar um backup irá substituir todos os dados atuais. Esta ação não pode ser desfeita.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Arquivo de Backup
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={handleRestoreBackup}
              disabled={restoring || !selectedFile}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {restoring ? 'Restaurando...' : 'Restaurar Backup'}
            </button>
          </div>
        </div>

        {/* Lista de Backups */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Backups Disponíveis</h2>
          </div>
          {backups.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4"><SaveOutlined /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum backup
              </h3>
              <p className="text-gray-500">
                Crie seu primeiro backup para proteger seus dados
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {backups.map((backup) => (
                <div key={backup.filename} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {backup.filename}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-gray-500">Tamanho</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatFileSize(backup.size)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Criado em</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(backup.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Modificado em</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(backup.modifiedAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteBackup(backup.filename)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações Importantes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Informações Importantes
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Faça backups regularmente para proteger seus dados</li>
            <li>• Os backups são salvos localmente no servidor</li>
            <li>• Restaurar um backup substitui todos os dados atuais</li>
            <li>• Mantenha cópias dos backups em local seguro</li>
            <li>• Teste a restauração em ambiente de desenvolvimento antes de usar em produção</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
