import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, Table, Tag, Button, message, Descriptions, Space, Modal, Radio } from 'antd'
import { CreditCardOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { theme } from '../config/theme'


export default function Billing() {
  const [loading, setLoading] = useState(true)
  const [billingInfo, setBillingInfo] = useState<any>(null)
  const router = useRouter()
  const { user } = usePermissions()
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState<string|null>(null)

  // Valores padrões dos planos (exemplo, pode ajustar se necessário)
  const plans = [
    { key: 'BASIC', name: 'BÁSICO', price: 59, features: ['Recursos essenciais', 'Suporte Básico'] },
    { key: 'PRO', name: 'PRO', price: 129, features: ['Tudo do Básico', 'Funcionalidades Avançadas', 'Suporte Prioritário'] },
    { key: 'ENTERPRISE', name: 'ENTERPRISE', price: 229, features: ['Tudo do PRO', 'Módulos Ilimitados', 'Suporte Dedicado'] }
  ]

  // Atualizar plano
  const handleConfirmUpdatePlan = async () => {
    setPlanLoading(true)
    setPlanError(null)
    try {
      const plan = plans.find(p => p.key === selectedPlan)
      if (!plan) throw new Error('Selecione um plano')
      await apiService.updateTenantPlan(plan.key, plan.price)
      message.success('Plano atualizado com sucesso!')
      setUpdateModalOpen(false)
      setTimeout(() => loadBillingInfo(), 600)
    } catch (err: any) {
      setPlanError(err?.message || 'Erro ao atualizar plano.')
      message.error(planError || 'Ocorreu um erro!')
    } finally {
      setPlanLoading(false)
    }
  }

  // Define visual para cada plano
  const planTag = (key: string) => {
    if (key === 'BASIC') return <Tag color="blue">BÁSICO</Tag>
    if (key === 'PRO') return <Tag color="purple">PRO</Tag>
    if (key === 'ENTERPRISE') return <Tag color="gold">ENTERPRISE</Tag>
    return <Tag>{key}</Tag>
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadBillingInfo()
  }, [router])

  const loadBillingInfo = async () => {
    try {
      setLoading(true)
      const data = await apiService.getBillingInfo()
      setBillingInfo(data)
    } catch (error) {
      message.error('Erro ao carregar informações de billing')
    } finally {
      setLoading(false)
    }
  }

  const getPlanColor = (plan: string) => {
    const colors: any = {
      FREE: 'default',
      BASIC: 'blue',
      PRO: 'green',
      ENTERPRISE: 'purple'
    }
    return colors[plan] || 'default'
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      ACTIVE: 'success',
      SUSPENDED: 'error',
      CANCELLED: 'default',
      PAID: 'success',
      PENDING: 'warning',
      FAILED: 'error',
      REFUNDED: 'default'
    }
    return colors[status] || 'default'
  }

  // Mapeia planRole para label
  const mapPlanRoleToPlan = (planRole: string | undefined): string => {
    if (!planRole) return ''
    if (planRole === 'ADMIN') return 'ADMIN'
    if (planRole === 'ENTERPRISE_USER') return 'ENTERPRISE'
    if (planRole === 'PRO_USER') return 'PRO'
    if (planRole === 'BASIC_USER') return 'BASIC'
    if (planRole === 'FREE_USER') return 'FREE'
    return ''
  }

  const columns = [
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `R$ ${amount?.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Método',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod'
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Vencimento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('pt-BR') : '-'
    },
  ]

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Assinatura e Pagamentos</h1>
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            size="middle"
            style={{
              background: theme.colors.primary,
              borderColor: theme.colors.primaryDark,
              color: '#fff',
              borderRadius: theme.borderRadius.md,
              fontWeight: 600,
              letterSpacing: 0.5,
              boxShadow: theme.shadows.md,
              padding: '0 18px',
              height: 40,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = theme.colors.primaryHover}
            onMouseLeave={e => e.currentTarget.style.background = theme.colors.primary}
            onClick={() => setUpdateModalOpen(true)}
          >
            Atualizar Plano
          </Button>
        </div>

        {billingInfo && (
          <>
            <Card className="mb-6">
              <Descriptions title="Informações da Assinatura" bordered column={2}>
                {(() => {
                  const userPlan = mapPlanRoleToPlan(user?.planRole)
                  const isUserPlanPaid = userPlan && userPlan !== 'FREE' && userPlan !== ''
                  const effectivePlan = isUserPlanPaid ? userPlan : billingInfo.plan
                  return (
                    <Descriptions.Item label="Plano Atual">
                      <div>
                        <Tag color={getPlanColor(effectivePlan)}>{effectivePlan}</Tag>
                        {(isUserPlanPaid && billingInfo.plan === 'FREE') && (
                          <div style={{ marginTop: 6, color: '#6b7280', fontSize: 12 }}>
                            Conta em demonstração, com ativação de usuário no plano <b>{userPlan}</b>.
                          </div>
                        )}
                      </div>
                    </Descriptions.Item>
                  )
                })()}
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(billingInfo.billingStatus)}>
                    {billingInfo.billingStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Valor Mensal">
                  R$ {billingInfo.monthlyPrice?.toFixed(2) || '0.00'}
                </Descriptions.Item>
                <Descriptions.Item label="Próxima Cobrança">
                  {billingInfo.nextBillingDate 
                    ? new Date(billingInfo.nextBillingDate).toLocaleDateString('pt-BR')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Último Pagamento">
                  {billingInfo.lastPaymentDate 
                    ? new Date(billingInfo.lastPaymentDate).toLocaleDateString('pt-BR')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Data de Assinatura">
                  {billingInfo.subscriptionStartedAt 
                    ? new Date(billingInfo.subscriptionStartedAt).toLocaleDateString('pt-BR')
                    : '-'}
                </Descriptions.Item>
                {billingInfo.trialEndsAt && (
                  <Descriptions.Item label="Período de Teste até" span={2}>
                    {new Date(billingInfo.trialEndsAt).toLocaleDateString('pt-BR')}
                  </Descriptions.Item>
                )}
                {/* Observação de ambiente de demonstração */}
                {user?.planRole && mapPlanRoleToPlan(user?.planRole) !== 'FREE' && billingInfo.plan === 'FREE' && (
                  <Descriptions.Item span={2}>
                    <span style={{ color: '#faad14' }}>Tenant ainda está em modo demonstração (trial), mas este usuário possui ativação do plano <b>{mapPlanRoleToPlan(user?.planRole)}</b>.</span>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title="Histórico de Pagamentos">
              <Table
                dataSource={billingInfo.billingHistory}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        )}
        <Modal
          title="Escolha seu Plano"
          open={isUpdateModalOpen}
          onOk={handleConfirmUpdatePlan}
          okText={planLoading ? 'Confirmando...' : 'Confirmar Upgrade'}
          okButtonProps={{
            disabled: !selectedPlan,
            loading: planLoading,
            style: { background: theme.colors.primary, borderColor: theme.colors.primaryDark, fontWeight: 600 }
          }}
          onCancel={() => {
            setUpdateModalOpen(false)
            setSelectedPlan('')
            setPlanError(null)
          }}
          cancelText="Cancelar"
        >
          <Radio.Group
            onChange={e => setSelectedPlan(e.target.value)}
            value={selectedPlan}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {plans.map(plan => (
                <div
                  key={plan.key}
                  onClick={() => setSelectedPlan(plan.key)}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: selectedPlan===plan.key?`2px solid ${theme.colors.primary}`:'1px solid #e5e7eb',
                    background: '#fff',
                    cursor: 'pointer',
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Radio value={plan.key} />
                    <div style={{ fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {planTag(plan.key)} <span>{plan.name}</span>
                    </div>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: theme.colors.primary, fontSize: 18 }}>R$ {plan.price}</span>
                  </div>
                  <div style={{ marginTop: 8, color: '#444' }}>
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {plan.features.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Radio.Group>
          {planError && <div style={{ color: theme.colors.error, marginTop: 12 }}>{planError}</div>}
        </Modal>
      </div>
    </div>
  )
}






