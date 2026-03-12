import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService } from '../services/api'
import {
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  Space,
  Popconfirm,
} from 'antd'
import {
  BarChartOutlined,
  UserOutlined,
  ShopOutlined,
  HeartOutlined,
  DollarOutlined,
  TeamOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import PageHeader from '../components/common/PageHeader'
import PageSkeleton from '../components/common/PageSkeleton'
import StatsCard from '../components/common/StatsCard'

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

  // suppress unused warning — selectedTenant reserved for future view modal
  void selectedTenant

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
      const [dashboardData, , billingData, billingRevData, analyticsData] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getAllTenants(),
        apiService.getAdminBillingOverview(),
        apiService.getAdminRevenueStats(),
        apiService.getAdminAnalytics(),
      ])

      setGlobalStats((dashboardData as any).overview)
      setBillingOverview(billingData as any)
      setBillingRevenueStats(billingRevData as any)
      setAnalytics(analyticsData as any)
      setTenants((dashboardData as any).tenantStats)
    } catch {
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
    } catch {
    }
  }

  const handleUpdateTenant = async () => {
    if (!editingTenant) return

    try {
      await apiService.updateTenant(editingTenant.id, {
        name: editingTenant.name,
        subdomain: editingTenant.subdomain,
        isActive: editingTenant.isActive,
      })
      setEditingTenant(null)
      loadData()
    } catch {
    }
  }

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      await apiService.deleteTenant(tenantId)
      loadData()
    } catch {
    }
  }

  const handleViewTenantData = async (tenantId: string) => {
    try {
      const data = await apiService.getTenantData(tenantId)
      setSelectedTenant(data as unknown as Tenant)
    } catch {
    }
  }

  const tenantColumns = [
    {
      title: 'Petshop',
      key: 'petshop',
      render: (_: unknown, record: Tenant) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShopOutlined style={{ color: '#10b981', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {record.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
              Criado em {new Date(record.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Subdomínio',
      dataIndex: 'subdomain',
      key: 'subdomain',
      render: (subdomain: string) => (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{subdomain}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>{isActive ? 'Ativo' : 'Inativo'}</Tag>
      ),
    },
    {
      title: 'Estatísticas',
      key: 'stats',
      render: (_: unknown, record: Tenant) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Usuários: {record.stats.users}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Pets: {record.stats.pets}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Agendamentos: {record.stats.appointments}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Vendas: {record.stats.sales}
          </span>
        </div>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: Tenant) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewTenantData(record.id)}
            style={{ color: 'var(--primary-color)' }}
            title="Ver dados"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setEditingTenant(record)}
            style={{ color: 'var(--primary-color)' }}
            title="Editar"
          />
          <Popconfirm
            title="Tem certeza que deseja excluir este petshop?"
            description="Esta ação não pode ser desfeita."
            onConfirm={() => handleDeleteTenant(record.id)}
            okText="Sim, excluir"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Excluir" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    background: 'var(--bg-elevated)',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    whiteSpace: 'nowrap',
    fontSize: 13,
    color: 'var(--text-primary)',
    borderTop: '1px solid var(--border-subtle)',
  }

  const modalTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const modalTitleTextStyle: React.CSSProperties = {
    fontFamily: 'var(--display-family)',
    fontWeight: 700,
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Painel Administrativo"
          subtitle="Visão geral do sistema e gestão de tenants"
          breadcrumb={[{ label: 'Admin' }]}
        />
        <div style={{ padding: '0 24px 24px' }}>
          <PageSkeleton type="dashboard" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Painel Administrativo"
        subtitle="Visão geral do sistema e gestão de tenants"
        breadcrumb={[{ label: 'Admin' }]}
        actions={
          <>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              style={{
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
              }}
            >
              Atualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowTenantModal(true)}
              style={{ height: 36, borderRadius: 8, fontWeight: 600 }}
            >
              Novo Petshop
            </Button>
          </>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        {/* Estatísticas Globais */}
        {globalStats && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Total Petshops"
                value={globalStats.totalTenants}
                icon={<ShopOutlined />}
                iconColor="#2563eb"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Total Usuários"
                value={globalStats.totalUsers}
                icon={<UserOutlined />}
                iconColor="#059669"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Total Pets"
                value={globalStats.totalPets}
                icon={<HeartOutlined />}
                iconColor="#7c3aed"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Receita de Vendas"
                value={`R$ ${globalStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={<DollarOutlined />}
                iconColor="#d97706"
              />
            </Col>
          </Row>
        )}

        {/* Métricas de Assinatura (Billing) */}
        {billingOverview && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Receita de Assinaturas"
                value={`R$ ${(billingOverview.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={<DollarOutlined />}
                iconColor="#d97706"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="MRR (Recorrente)"
                value={`R$ ${(billingOverview.monthlyRecurringRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={<BarChartOutlined />}
                iconColor="#2563eb"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Assinaturas Pendentes"
                value={`R$ ${(billingOverview.pendingAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={<DollarOutlined />}
                iconColor="#dc2626"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Tenants Ativos"
                value={billingOverview.activeTenants}
                icon={<TeamOutlined />}
                iconColor="#059669"
              />
            </Col>
          </Row>
        )}

        {/* Análises Mensais */}
        {analytics && billingRevenueStats && (
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 24,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--display-family)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Análises Mensais
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Comparativo de Vendas x Assinaturas e crescimento
              </p>
            </div>
            <div style={{ padding: 20, overflowX: 'auto' }}>
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
                  ...Object.keys(appointmentTrends),
                ])
                const months = Array.from(monthsSet)
                  .filter((m) => /^\d{4}-\d{2}$/.test(m))
                  .sort()

                const formatBRL = (n: number) =>
                  `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

                let prevSales: number | null = null
                let prevBilling: number | null = null

                return (
                  <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Mês</th>
                        <th title="Soma de vendas (sales.total)" style={thStyle}>Vendas</th>
                        <th title="Assinaturas pagas (billing_history PAID)" style={thStyle}>Assinaturas</th>
                        <th style={thStyle}>Diferença</th>
                        <th style={thStyle}>Vendas %</th>
                        <th style={thStyle}>Assin. %</th>
                        <th title="Novos tenants criados no mês" style={thStyle}>Novos Tenants</th>
                        <th title="Novos usuários criados no mês" style={thStyle}>Novos Usuários</th>
                        <th style={thStyle}>Agend. Totais</th>
                        <th style={thStyle}>Concluídos</th>
                        <th style={thStyle}>Pendentes</th>
                        <th style={thStyle}>Cancelados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {months.map((m) => {
                        const s = Number(salesMonthly[m] || 0)
                        const b = Number(billingMonthly[m] || 0)
                        const diff = s - b
                        const salesPct =
                          prevSales !== null && prevSales !== 0
                            ? ((s - prevSales) / prevSales) * 100
                            : null
                        const billingPct =
                          prevBilling !== null && prevBilling !== 0
                            ? ((b - prevBilling) / prevBilling) * 100
                            : null
                        const t = Number(tenantGrowth[m] || 0)
                        const u = Number(userGrowth[m] || 0)
                        const a = appointmentTrends[m] || {
                          total: 0,
                          completed: 0,
                          pending: 0,
                          cancelled: 0,
                        }

                        const row = (
                          <tr key={m}>
                            <td style={tdStyle}>{m}</td>
                            <td style={tdStyle}>{formatBRL(s)}</td>
                            <td style={tdStyle}>{formatBRL(b)}</td>
                            <td style={tdStyle}>{formatBRL(diff)}</td>
                            <td style={tdStyle}>
                              {salesPct === null ? '-' : `${salesPct.toFixed(1)}%`}
                            </td>
                            <td style={tdStyle}>
                              {billingPct === null ? '-' : `${billingPct.toFixed(1)}%`}
                            </td>
                            <td style={tdStyle}>{t}</td>
                            <td style={tdStyle}>{u}</td>
                            <td style={tdStyle}>{a.total}</td>
                            <td style={tdStyle}>{a.completed}</td>
                            <td style={tdStyle}>{a.pending}</td>
                            <td style={tdStyle}>{a.cancelled}</td>
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
        <div style={{ marginBottom: 16 }}>
          <h2
            style={{
              fontFamily: 'var(--display-family)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Gestão de Petshops
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Gerencie todos os petshops cadastrados no sistema
          </p>
        </div>

        <div
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <Table
            columns={tenantColumns}
            dataSource={tenants}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>

      {/* Modal: Novo Petshop */}
      <Modal
        title={
          <span style={modalTitleStyle}>
            <ShopOutlined style={{ color: 'var(--primary-color)' }} />
            <span style={modalTitleTextStyle}>Novo Petshop</span>
          </span>
        }
        open={showTenantModal}
        onOk={handleCreateTenant}
        onCancel={() => setShowTenantModal(false)}
        okText="Criar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item label="Nome">
            <Input
              value={newTenant.name}
              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              placeholder="Nome do petshop"
            />
          </Form.Item>
          <Form.Item label="Subdomínio">
            <Input
              value={newTenant.subdomain}
              onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
              placeholder="subdominio"
            />
          </Form.Item>
          <Form.Item label="Status">
            <Switch
              checked={newTenant.isActive}
              onChange={(checked) => setNewTenant({ ...newTenant, isActive: checked })}
              checkedChildren="Ativo"
              unCheckedChildren="Inativo"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Editar Petshop */}
      <Modal
        title={
          <span style={modalTitleStyle}>
            <EditOutlined style={{ color: 'var(--primary-color)' }} />
            <span style={modalTitleTextStyle}>Editar Petshop</span>
          </span>
        }
        open={!!editingTenant}
        onOk={handleUpdateTenant}
        onCancel={() => setEditingTenant(null)}
        okText="Salvar"
        cancelText="Cancelar"
      >
        {editingTenant && (
          <Form layout="vertical" style={{ marginTop: 8 }}>
            <Form.Item label="Nome">
              <Input
                value={editingTenant.name}
                onChange={(e) =>
                  setEditingTenant({ ...editingTenant, name: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Subdomínio">
              <Input
                value={editingTenant.subdomain}
                onChange={(e) =>
                  setEditingTenant({ ...editingTenant, subdomain: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Status">
              <Switch
                checked={editingTenant.isActive}
                onChange={(checked) =>
                  setEditingTenant({ ...editingTenant, isActive: checked })
                }
                checkedChildren="Ativo"
                unCheckedChildren="Inativo"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}
