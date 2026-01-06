import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService } from '../services/api'
import {
  BarChartOutlined,
  UserOutlined,
  ShopOutlined,
  HeartOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons'

interface GlobalStats {
  totalTenants: number
  activeTenants: number
  inactiveTenants: number
  totalUsers: number
  totalCustomers: number
  totalPets: number
  totalAppointments: number
  totalRevenue: number
}

interface Tenant {
  id: string
  name: string
  subdomain: string
  isActive: boolean
  createdAt: string
  stats: {
    users: number
    customers: number
    pets: number
    appointments: number
    products: number
    sales: number
  }
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [billingOverview, setBillingOverview] = useState<any | null>(null)
  const [billingRevenueStats, setBillingRevenueStats] = useState<any | null>(null)
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [showTenantModal, setShowTenantModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [newTenant, setNewTenant] = useState({ name: '', subdomain: '', isActive: true })
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [dashboardData, tenantsData, billingData, billingRevData, analyticsData] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getAllTenants(),
        apiService.getAdminBillingOverview(),
        apiService.getAdminRevenueStats(),
        apiService.getAdminAnalytics()
      ])
      
      setGlobalStats((dashboardData as any).overview)
      setBillingOverview(billingData as any)
      setBillingRevenueStats(billingRevData as any)
      setAnalytics(analyticsData as any)
      setTenants((dashboardData as any).tenantStats)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTenant = async () => {
    try {
      await apiService.createTenant(newTenant)
      setNewTenant({ name: '', subdomain: '', isActive: true })
      setShowTenantModal(false)
      loadData()
    } catch (error) {
    }
  }

  const handleUpdateTenant = async () => {
    if (!editingTenant) return
    
    try {
      await apiService.updateTenant(editingTenant.id, {
        name: editingTenant.name,
        subdomain: editingTenant.subdomain,
        isActive: editingTenant.isActive
      })
      setEditingTenant(null)
      loadData()
    } catch (error) {
    }
  }

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Tem certeza que deseja excluir este petshop? Esta ação não pode ser desfeita.')) return
    
    try {
      await apiService.deleteTenant(tenantId)
      loadData()
    } catch (error) {
    }
  }

  const handleViewTenantData = async (tenantId: string) => {
    try {
      const tenantData = await apiService.getTenantData(tenantId)
      // Aqui você pode implementar uma modal ou página para visualizar os dados
    } catch (error) {
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
          <p className="text-gray-600">Gerencie todos os petshops do sistema</p>
        </div>

        {/* Estatísticas Globais - separadas por origem */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <ShopOutlined className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Petshops</p>
                  <p className="text-2xl font-bold text-gray-900">{globalStats.totalTenants}</p>
                  <p className="text-xs text-green-600">{globalStats.activeTenants} ativos</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <UserOutlined className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{globalStats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <HeartOutlined className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pets</p>
                  <p className="text-2xl font-bold text-gray-900">{globalStats.totalPets}</p>
                </div>
              </div>
            </div>

            {/* Receita de Vendas (operacional) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <DollarOutlined className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita de Vendas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {globalStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">Soma de vendas dos petshops (sales)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Métricas de Assinatura (Billing) */}
        {billingOverview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <DollarOutlined className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita de Assinaturas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(billingOverview.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">Total pago (billing_history PAID)</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <BarChartOutlined className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">MRR (Recorrente)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(billingOverview.monthlyRecurringRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">Soma de monthlyPrice de tenants ativos</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <DollarOutlined className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assinaturas Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(billingOverview.pendingAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">Total a receber (billing_history PENDING)</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <TeamOutlined className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tenants Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{billingOverview.activeTenants}</p>
                  <p className="text-xs text-gray-500">Base para a recorrência</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Análises Mensais (últimos 12 meses) */}
        {analytics && billingRevenueStats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Análises Mensais</h2>
              <p className="text-gray-600 text-sm">Comparativo de Vendas x Assinaturas e crescimento</p>
            </div>
            <div className="p-6 overflow-x-auto">
              {(() => {
                const salesMonthly = analytics.monthlyRevenue || {}
                const billingMonthly = billingRevenueStats.monthlyRevenue || {}
                const tenantGrowth = analytics.tenantGrowth || {}
                const userGrowth = analytics.userGrowth || {}
                const appointmentTrends = analytics.appointmentTrends || {}

                const monthsSet = new Set<string>([
                  ...Object.keys(salesMonthly),
                  ...Object.keys(billingMonthly),
                  ...Object.keys(tenantGrowth),
                  ...Object.keys(userGrowth),
                  ...Object.keys(appointmentTrends)
                ])
                const months = Array.from(monthsSet)
                  .filter(m => /^\d{4}-\d{2}$/.test(m))
                  .sort()

                const formatBRL = (n: number) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

                let prevSales: number | null = null
                let prevBilling: number | null = null

                return (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                        <th title="Soma de vendas (sales.total)" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
                        <th title="Assinaturas pagas (billing_history PAID)" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assinaturas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assin. %</th>
                        <th title="Novos tenants criados no mês" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Novos Tenants</th>
                        <th title="Novos usuários criados no mês" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Novos Usuários</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agend. Totais</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concluídos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendentes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelados</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {months.map((m) => {
                        const s = Number(salesMonthly[m] || 0)
                        const b = Number(billingMonthly[m] || 0)
                        const diff = s - b
                        const salesPct = prevSales !== null && prevSales !== 0 ? ((s - prevSales) / prevSales) * 100 : null
                        const billingPct = prevBilling !== null && prevBilling !== 0 ? ((b - prevBilling) / prevBilling) * 100 : null
                        const t = Number(tenantGrowth[m] || 0)
                        const u = Number(userGrowth[m] || 0)
                        const a = appointmentTrends[m] || { total: 0, completed: 0, pending: 0, cancelled: 0 }

                        const row = (
                          <tr key={m}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatBRL(s)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatBRL(b)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatBRL(diff)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{salesPct === null ? '-' : `${salesPct.toFixed(1)}%`}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{billingPct === null ? '-' : `${billingPct.toFixed(1)}%`}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.completed}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.pending}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.cancelled}</td>
                          </tr>
                        )

                        prevSales = s
                        prevBilling = b
                        return row
                      })}
                    </tbody>
                  </table>
                )
              })()}
            </div>
          </div>
        )}

        {/* Gestão de Petshops */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gestão de Petshops</h2>
                <p className="text-gray-600">Gerencie todos os petshops cadastrados no sistema</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTenantModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <PlusOutlined className="mr-2" />
                  Novo Petshop
                </button>
                <button
                  onClick={loadData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ReloadOutlined className="mr-2" />
                  Atualizar
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Petshop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subdomínio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estatísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <ShopOutlined className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">
                            Criado em {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.subdomain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tenant.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Usuários: {tenant.stats.users}</div>
                        <div>Pets: {tenant.stats.pets}</div>
                        <div>Agendamentos: {tenant.stats.appointments}</div>
                        <div>Vendas: {tenant.stats.sales}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewTenantData(tenant.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver dados"
                        >
                          <EyeOutlined />
                        </button>
                        <button
                          onClick={() => setEditingTenant(tenant)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal para criar novo petshop */}
        {showTenantModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Petshop</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                      type="text"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Nome do petshop"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subdomínio</label>
                    <input
                      type="text"
                      value={newTenant.subdomain}
                      onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="subdominio"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTenant.isActive}
                      onChange={(e) => setNewTenant({ ...newTenant, isActive: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Ativo</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowTenantModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateTenant}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Criar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar petshop */}
        {editingTenant && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Petshop</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                      type="text"
                      value={editingTenant.name}
                      onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subdomínio</label>
                    <input
                      type="text"
                      value={editingTenant.subdomain}
                      onChange={(e) => setEditingTenant({ ...editingTenant, subdomain: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingTenant.isActive}
                      onChange={(e) => setEditingTenant({ ...editingTenant, isActive: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Ativo</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setEditingTenant(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdateTenant}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
