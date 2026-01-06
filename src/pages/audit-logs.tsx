import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FileTextOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  details?: string
  ipAddress?: string
  userAgent?: string
  user: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

interface LogStats {
  total: number
  byAction: { [key: string]: number }
  byEntity: { [key: string]: number }
  byUser: { [key: string]: number }
  daily: { [key: string]: number }
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEntity, setFilterEntity] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Definir datas padrão (últimos 30 dias)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])

    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [logsData, statsData] = await Promise.all([
        apiService.getAuditLogs({
          entity: filterEntity || undefined,
          action: filterAction || undefined,
          userId: filterUser || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: currentPage,
          limit: 20
        }),
        apiService.getAuditLogStats(startDate, endDate)
      ])
      setLogs((logsData as any).logs)
      setTotalPages((logsData as any).totalPages)
      setStats(statsData as any)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentPage, filterEntity, filterAction, filterUser, startDate, endDate])

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE': return 'Criar'
      case 'UPDATE': return 'Atualizar'
      case 'DELETE': return 'Excluir'
      case 'LOGIN': return 'Login'
      case 'LOGOUT': return 'Logout'
      default: return action
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'LOGIN': return 'bg-purple-100 text-purple-800'
      case 'LOGOUT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityLabel = (entity: string) => {
    switch (entity) {
      case 'Customer': return 'Cliente'
      case 'Pet': return 'Pet'
      case 'Appointment': return 'Agendamento'
      case 'Product': return 'Produto'
      case 'Sale': return 'Venda'
      case 'User': return 'Usuário'
      default: return entity
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
            <p className="text-gray-600">Monitore todas as atividades do sistema</p>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Logs</h3>
              <p className="text-3xl font-bold text-green-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ações Mais Comuns</h3>
              <div className="space-y-1">
                {Object.entries(stats.byAction)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([action, count]) => (
                    <div key={action} className="flex justify-between text-sm">
                      <span>{getActionLabel(action)}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Entidades Mais Acessadas</h3>
              <div className="space-y-1">
                {Object.entries(stats.byEntity)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([entity, count]) => (
                    <div key={entity} className="flex justify-between text-sm">
                      <span>{getEntityLabel(entity)}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Atividade Diária</h3>
              <div className="space-y-1">
                {Object.entries(stats.daily)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 3)
                  .map(([date, count]) => (
                    <div key={date} className="flex justify-between text-sm">
                      <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entidade
              </label>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas</option>
                <option value="Customer">Cliente</option>
                <option value="Pet">Pet</option>
                <option value="Appointment">Agendamento</option>
                <option value="Product">Produto</option>
                <option value="Sale">Venda</option>
                <option value="User">Usuário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas</option>
                <option value="CREATE">Criar</option>
                <option value="UPDATE">Atualizar</option>
                <option value="DELETE">Excluir</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadData}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Filtrar
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterEntity('')
                  setFilterAction('')
                  setFilterUser('')
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="bg-white rounded-lg shadow-sm">
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4"><FileTextOutlined /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum log encontrado
              </h3>
              <p className="text-gray-500">
                Nenhuma atividade registrada no período selecionado
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {getEntityLabel(log.entity)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ID: {log.entityId}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-gray-500">Usuário</p>
                          <p className="text-sm font-medium text-gray-900">
                            {log.user.name} ({log.user.email})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Data/Hora</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(log.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {log.details && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-500">Detalhes</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {log.details}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.ipAddress && (
                          <div>
                            <p className="text-sm text-gray-500">IP</p>
                            <p className="text-sm font-medium text-gray-900">
                              {log.ipAddress}
                            </p>
                          </div>
                        )}
                        {log.userAgent && (
                          <div>
                            <p className="text-sm text-gray-500">User Agent</p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {log.userAgent}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
