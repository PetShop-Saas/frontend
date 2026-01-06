import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, Table, Tag, Button, message, Statistic, Row, Col, Modal, Select } from 'antd'
import { DollarOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'


const { Option } = Select

export default function AdminBilling() {
  const [overview, setOverview] = useState<any>(null)
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [revenueStats, setRevenueStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
      const [overviewData, pendingData, revenueData] = await Promise.all([
        apiService.getAdminBillingOverview(),
        apiService.getAdminPendingPayments(),
        apiService.getAdminRevenueStats()
      ])
      setOverview(overviewData as any)
      setPendingPayments(pendingData as any)
      setRevenueStats(revenueData as any)
    } catch (error) {
      message.error('Erro ao carregar dados de billing')
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendTenant = async (tenantId: string, tenantName: string) => {
    Modal.confirm({
      title: 'Suspender Tenant',
      content: `Tem certeza que deseja suspender "${tenantName}"? O acesso será bloqueado.`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Sim, suspender',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiService.suspendTenant(tenantId)
          message.success('Tenant suspendido!')
          loadData()
        } catch (error) {
          message.error('Erro ao suspender tenant')
        }
      }
    })
  }

  const handleActivateTenant = async (tenantId: string, tenantName: string) => {
    try {
      await apiService.activateTenant(tenantId)
      message.success(`Tenant "${tenantName}" reativado!`)
      loadData()
    } catch (error) {
      message.error('Erro ao reativar tenant')
    }
  }

  const columns = [
    {
      title: 'Tenant',
      dataIndex: ['tenant', 'name'],
      key: 'tenant'
    },
    {
      title: 'Subdomínio',
      dataIndex: ['tenant', 'subdomain'],
      key: 'subdomain'
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `R$ ${amount.toFixed(2)}`
    },
    {
      title: 'Vencimento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => {
        const dueDate = new Date(date)
        const isOverdue = dueDate < new Date()
        return (
          <span style={{ color: isOverdue ? 'red' : 'inherit' }}>
            {dueDate.toLocaleDateString('pt-BR')}
            {isOverdue && <Tag color="red" className="ml-2">Vencido</Tag>}
          </span>
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'PENDING' ? 'orange' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Contato',
      key: 'contact',
      render: (record: any) => (
        <div>
          <div>{record.tenant.contactEmail}</div>
          <div className="text-xs text-gray-500">{record.tenant.contactPhone}</div>
        </div>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: any) => (
        <Button 
          type="link" 
          danger
          onClick={() => handleSuspendTenant(record.tenant.id, record.tenant.name)}
        >
          Suspender
        </Button>
      )
    }
  ]

  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestão de Billing - Admin</h1>

        {overview && (
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Total de Tenants" 
                  value={overview.totalTenants}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Tenants Ativos" 
                  value={overview.activeTenants}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Tenants Suspensos" 
                  value={overview.suspendedTenants}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="MRR (Receita Recorrente)" 
                  value={overview.monthlyRecurringRevenue}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {overview && (
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Receita Total (Pago)" 
                  value={overview.totalRevenue}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Pendente de Pagamento" 
                  value={overview.pendingAmount}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <div className="mb-4">
                  <h3 className="text-sm text-gray-600 mb-2">Tenants por Plano</h3>
                </div>
                {overview.tenantsByPlan && Object.entries(overview.tenantsByPlan).map(([plan, count]: any) => (
                  <div key={plan} className="flex justify-between mb-1">
                    <Tag color={plan === 'FREE' ? 'default' : plan === 'BASIC' ? 'blue' : plan === 'PRO' ? 'green' : 'purple'}>
                      {plan}
                    </Tag>
                    <span>{count}</span>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        )}

        <Card title="Pagamentos Pendentes" className="mb-6">
          <Table
            dataSource={pendingPayments}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {revenueStats && (() => {
          const monthly = revenueStats.monthlyRevenue || {}
          const months = Object.keys(monthly)
            .filter(m => /^\d{4}-\d{2}$/.test(m))
            .sort()
          const values = months.map(m => Number(monthly[m] || 0))
          const maxVal = Math.max(1, ...values)
          const width = 700
          const height = 240
          const padding = 30
          const xStep = months.length > 1 ? (width - padding * 2) / (months.length - 1) : 0
          const points = values.map((v, i) => {
            const x = padding + i * xStep
            const y = height - padding - (v / maxVal) * (height - padding * 2)
            return `${x},${y}`
          }).join(' ')

          let prev: number | null = null
          let cumulative = 0

          return (
          <Card title="Receitas Mensais (Últimos 12 meses)">
              {/* Gráfico de Linha: Assinaturas Pagas por Mês */}
              <div className="mb-6 overflow-x-auto">
                <svg width={width} height={height} style={{ background: '#fff' }}>
                  {/* Eixo X */}
                  <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
                  {/* Eixo Y */}
                  <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
                  {/* Linha */}
                  {points && (
                    <polyline fill="none" stroke="#1890ff" strokeWidth="2" points={points} />
                  )}
                  {/* Pontos */}
                  {values.map((v, i) => {
                    const x = padding + i * xStep
                    const y = height - padding - (v / maxVal) * (height - padding * 2)
                    return <circle key={i} cx={x} cy={y} r={3} fill="#1890ff" />
                  })}
                  {/* Labels de eixo Y (máximo) */}
                  <text x={padding} y={padding - 8} fill="#6b7280" fontSize="10">{`R$ ${maxVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</text>
                  {/* Labels de meses (X) */}
                  {months.map((m, i) => {
                    const x = padding + i * xStep
                    return (
                      <text key={m} x={x} y={height - padding + 14} fill="#6b7280" fontSize="10" textAnchor="middle">
                        {new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'short' })}
                      </text>
                    )
                  })}
                </svg>
              </div>

              {/* Tabela detalhada com crescimento */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crescimento MoM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {months.map((m) => {
                      const v = Number(monthly[m] || 0)
                      const mom = prev && prev !== 0 ? ((v - prev) / prev) * 100 : null
                      cumulative += v
                      const row = (
                        <tr key={m}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mom === null ? '-' : `${mom.toFixed(1)}%`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`R$ ${cumulative.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
                        </tr>
                      )
                      prev = v
                      return row
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card size="small">
                  <Statistic 
                    title="Receita Total (12m)" 
                    value={values.reduce((a, b) => a + b, 0)}
                    precision={2}
                    prefix="R$"
                  />
                </Card>
                <Card size="small">
              <Statistic 
                    title="Média Mensal (12m)" 
                value={revenueStats.averageMonthly}
                precision={2}
                prefix="R$"
              />
                </Card>
                <Card size="small">
                  <Statistic 
                    title="Maior Mês" 
                    value={Math.max(...values, 0)}
                    precision={2}
                    prefix="R$"
                  />
                </Card>
            </div>
          </Card>
          )
        })()}
      </div>
    </div>
  )
}




