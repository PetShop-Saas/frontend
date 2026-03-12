import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  Table,
  Tag,
  Button,
  message,
  Descriptions,
  Modal,
  Radio,
  Row,
  Col,
} from 'antd'
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReloadOutlined,
  StarOutlined,
  ThunderboltOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { apiService } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import { PageSkeleton } from '../components/common/PageSkeleton'

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  FREE:       { label: 'Gratuito',   color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: <StarOutlined /> },
  BASIC:      { label: 'Básico',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: <StarOutlined /> },
  PRO:        { label: 'Pro',        color: '#047857', bg: 'rgba(4,120,87,0.1)',    icon: <ThunderboltOutlined /> },
  ENTERPRISE: { label: 'Enterprise', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', icon: <CrownOutlined /> },
  ADMIN:      { label: 'Admin',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: <CrownOutlined /> },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:    { label: 'Ativo',        color: 'success' },
  SUSPENDED: { label: 'Suspenso',     color: 'error' },
  CANCELLED: { label: 'Cancelado',    color: 'default' },
  PAID:      { label: 'Pago',         color: 'success' },
  PENDING:   { label: 'Pendente',     color: 'warning' },
  FAILED:    { label: 'Falhou',       color: 'error' },
  REFUNDED:  { label: 'Reembolsado',  color: 'default' },
}

const plans = [
  { key: 'BASIC',      name: 'BÁSICO',     price: 59,  features: ['Recursos essenciais', 'Suporte básico'] },
  { key: 'PRO',        name: 'PRO',        price: 129, features: ['Tudo do Básico', 'Funcionalidades avançadas', 'Suporte prioritário'] },
  { key: 'ENTERPRISE', name: 'ENTERPRISE', price: 229, features: ['Tudo do PRO', 'Módulos ilimitados', 'Suporte dedicado'] },
]

const mapPlanRoleToPlan = (planRole?: string): string => {
  if (!planRole) return ''
  const map: Record<string, string> = {
    ADMIN: 'ADMIN',
    ENTERPRISE_USER: 'ENTERPRISE',
    PRO_USER: 'PRO',
    BASIC_USER: 'BASIC',
    FREE_USER: 'FREE',
  }
  return map[planRole] ?? ''
}

export default function Billing() {
  const [loading, setLoading] = useState(true)
  const [billingInfo, setBillingInfo] = useState<any>(null)
  const router = useRouter()
  const { user } = usePermissions()
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadBillingInfo()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBillingInfo = async () => {
    try {
      setLoading(true)
      const data = await apiService.getBillingInfo()
      setBillingInfo(data)
    } catch {
      message.error('Erro ao carregar informações de billing')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmUpdatePlan = async () => {
    setPlanLoading(true)
    setPlanError(null)
    try {
      const plan = plans.find(p => p.key === selectedPlan)
      if (!plan) throw new Error('Selecione um plano')
      await apiService.updateTenantPlan(plan.key, plan.price)
      message.success('Plano atualizado com sucesso!')
      setUpdateModalOpen(false)
      setSelectedPlan('')
      setTimeout(() => loadBillingInfo(), 600)
    } catch (err: any) {
      const msg = err?.message || 'Erro ao atualizar plano'
      setPlanError(msg)
      message.error(msg)
    } finally {
      setPlanLoading(false)
    }
  }

  const columns = [
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ClockCircleOutlined style={{ fontSize: 11 }} />
          {new Date(date).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>
          R$ {(amount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const cfg = STATUS_CONFIG[status]
        return (
          <Tag color={cfg?.color ?? 'default'} style={{ fontWeight: 600, fontSize: 11 }}>
            {cfg?.label ?? status}
          </Tag>
        )
      },
    },
    {
      title: 'Método',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{method}</span>
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{desc}</span>
      ),
    },
    {
      title: 'Vencimento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => (
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          {date ? new Date(date).toLocaleDateString('pt-BR') : '—'}
        </span>
      ),
    },
  ]

  if (loading) return <PageSkeleton />

  const userPlan = mapPlanRoleToPlan(user?.planRole)
  const isUserPlanPaid = userPlan && userPlan !== 'FREE' && userPlan !== ''
  const effectivePlan = isUserPlanPaid ? userPlan : billingInfo?.plan
  const planCfg = PLAN_CONFIG[effectivePlan] ?? PLAN_CONFIG.FREE

  return (
    <div>
      <PageHeader
        title="Assinatura e Pagamentos"
        subtitle="Gerencie seu plano, faturamento e histórico de pagamentos"
        breadcrumb={[{ label: 'Assinatura' }]}
        actions={
          <>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadBillingInfo}
              loading={loading}
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
              icon={<CreditCardOutlined />}
              onClick={() => setUpdateModalOpen(true)}
              style={{
                height: 36,
                borderRadius: 8,
                background: 'var(--primary-color)',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Atualizar Plano
            </Button>
          </>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        {billingInfo ? (
          <>
            {/* Resumo do Plano */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} md={8}>
                <div style={{
                  padding: '20px',
                  borderRadius: 14,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, ${planCfg.color}, ${planCfg.color}88)`,
                    borderRadius: '14px 14px 0 0',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 11,
                      background: planCfg.bg, color: planCfg.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {planCfg.icon}
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--display-family)', lineHeight: 1 }}>
                    {planCfg.label}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>
                    Plano Atual
                  </div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div style={{
                  padding: '20px',
                  borderRadius: 14,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, #3b82f6, #3b82f688)',
                    borderRadius: '14px 14px 0 0',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 11,
                      background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      <CheckCircleOutlined />
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--display-family)', lineHeight: 1 }}>
                    {STATUS_CONFIG[billingInfo.billingStatus]?.label ?? billingInfo.billingStatus}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>
                    Status da Assinatura
                  </div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div style={{
                  padding: '20px',
                  borderRadius: 14,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, #047857, #10b981)',
                    borderRadius: '14px 14px 0 0',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 11,
                      background: 'rgba(4,120,87,0.1)', color: '#047857',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      <DollarOutlined />
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--display-family)', lineHeight: 1 }}>
                    R$ {(billingInfo.monthlyPrice ?? 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>
                    Valor Mensal
                  </div>
                </div>
              </Col>
            </Row>

            {/* Detalhes da Assinatura */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
                  <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
                    Detalhes da Assinatura
                  </span>
                </div>
              }
              style={{ marginBottom: 24 }}
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Plano Atual">
                  <div>
                    {planCfg && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        color: planCfg.color,
                        background: planCfg.bg,
                      }}>
                        {planCfg.icon} {planCfg.label}
                      </span>
                    )}
                    {isUserPlanPaid && billingInfo.plan === 'FREE' && (
                      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                        Conta em demonstração, com ativação do plano <strong>{userPlan}</strong>.
                      </div>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={STATUS_CONFIG[billingInfo.billingStatus]?.color ?? 'default'} style={{ fontWeight: 600 }}>
                    {STATUS_CONFIG[billingInfo.billingStatus]?.label ?? billingInfo.billingStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Próxima Cobrança">
                  {billingInfo.nextBillingDate
                    ? new Date(billingInfo.nextBillingDate).toLocaleDateString('pt-BR')
                    : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Último Pagamento">
                  {billingInfo.lastPaymentDate
                    ? new Date(billingInfo.lastPaymentDate).toLocaleDateString('pt-BR')
                    : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Assinatura Iniciada">
                  {billingInfo.subscriptionStartedAt
                    ? new Date(billingInfo.subscriptionStartedAt).toLocaleDateString('pt-BR')
                    : '—'}
                </Descriptions.Item>
                {billingInfo.trialEndsAt && (
                  <Descriptions.Item label="Trial até">
                    {new Date(billingInfo.trialEndsAt).toLocaleDateString('pt-BR')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Histórico de Pagamentos */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
                  <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
                    Histórico de Pagamentos
                  </span>
                </div>
              }
            >
              <Table
                dataSource={billingInfo.billingHistory ?? []}
                columns={columns}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t: number) => `${t} registros` }}
                locale={{
                  emptyText: (
                    <EmptyState
                      icon={<DollarOutlined style={{ fontSize: 28 }} />}
                      title="Sem histórico de pagamentos"
                      description="Os pagamentos realizados aparecerão aqui"
                      compact
                    />
                  ),
                }}
              />
            </Card>
          </>
        ) : (
          <EmptyState
            title="Sem informações de billing"
            description="Não foi possível carregar as informações de assinatura"
            actionLabel="Tentar novamente"
            onAction={loadBillingInfo}
          />
        )}
      </div>

      {/* Modal: Atualizar Plano */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCardOutlined style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
              Escolha seu Plano
            </span>
          </div>
        }
        open={isUpdateModalOpen}
        onOk={handleConfirmUpdatePlan}
        okText={planLoading ? 'Confirmando...' : 'Confirmar Upgrade'}
        okButtonProps={{
          disabled: !selectedPlan,
          loading: planLoading,
          style: { background: 'var(--primary-color)', border: 'none', fontWeight: 600 },
        }}
        onCancel={() => {
          setUpdateModalOpen(false)
          setSelectedPlan('')
          setPlanError(null)
        }}
        cancelText="Cancelar"
        width={520}
      >
        <Radio.Group
          onChange={e => setSelectedPlan(e.target.value)}
          value={selectedPlan}
          style={{ width: '100%', marginTop: 16 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {plans.map(plan => {
              const cfg = PLAN_CONFIG[plan.key]
              const isSelected = selectedPlan === plan.key
              return (
                <div
                  key={plan.key}
                  onClick={() => setSelectedPlan(plan.key)}
                  style={{
                    borderRadius: 10,
                    border: isSelected
                      ? `2px solid var(--primary-color)`
                      : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(4,120,87,0.04)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    padding: '12px 16px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Radio value={plan.key} />
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: cfg?.bg, color: cfg?.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                    }}>
                      {cfg?.icon}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--display-family)' }}>
                      {plan.name}
                    </span>
                    <span style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--primary-color)', fontSize: 18, fontFamily: 'var(--display-family)' }}>
                      R$ {plan.price}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>/mês</span>
                    </span>
                  </div>
                  <ul style={{ paddingLeft: 54, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ fontSize: 12, color: 'var(--text-secondary)', listStyle: 'none' }}>
                        <CheckCircleOutlined style={{ color: '#10b981', marginRight: 6, fontSize: 11 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </Radio.Group>
        {planError && (
          <p style={{ color: 'var(--error-color)', fontSize: 13, marginTop: 12 }}>{planError}</p>
        )}
      </Modal>
    </div>
  )
}
