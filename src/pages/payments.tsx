import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
  Table,
  Space,
  Tabs,
  Alert,
  Row,
  Col
} from 'antd'
import {
  QrcodeOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import PageSkeleton from '../components/common/PageSkeleton'
import EmptyState from '../components/common/EmptyState'

interface PixPayment {
  id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'EXPIRED'
  qrCode?: string
  qrCodeImage?: string
  expiresAt?: string
  description?: string
  createdAt: string
}

interface Billing {
  id: string
  amount: number
  description: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate?: string
  paymentUrl?: string
  createdAt: string
}

const statusBadgeMap: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: 'rgba(251,146,60,0.12)',  color: '#ea6c00', label: 'Pendente' },
  PAID:      { bg: 'rgba(16,185,129,0.12)',  color: '#059669', label: 'Pago' },
  EXPIRED:   { bg: 'rgba(239,68,68,0.12)',   color: '#dc2626', label: 'Expirado' },
  OVERDUE:   { bg: 'rgba(239,68,68,0.12)',   color: '#dc2626', label: 'Vencido' },
  CANCELLED: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', label: 'Cancelado' },
}

function StatusBadge({ status }: { status: string }) {
  const info = statusBadgeMap[status] ?? { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', label: status }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: info.bg,
      color: info.color,
      border: `1px solid ${info.color}33`,
    }}>
      {info.label}
    </span>
  )
}

export default function Payments() {
  const [billings, setBillings] = useState<Billing[]>([])
  const [loading, setLoading] = useState(true)
  const [showPixModal, setShowPixModal] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [pixResult, setPixResult] = useState<PixPayment | null>(null)
  const [pixLoading, setPixLoading] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [pixStatusLoading, setPixStatusLoading] = useState(false)
  const [pixForm] = Form.useForm()
  const [billingForm] = Form.useForm()
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadBillings()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [router])

  const loadBillings = async () => {
    try {
      setLoading(true)
      const data = await apiService.listAbacateBillings()
      setBillings(Array.isArray(data) ? data : (data as any)?.billings ?? [])
    } catch {
      // billings não críticos, não exibe erro bloqueante
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePix = async (values: any) => {
    try {
      setPixLoading(true)
      const result = await apiService.createAbacatePixQrCode({
        amount: values.amount,
        description: values.description,
        expiresIn: 3600
      }) as any
      setPixResult(result)
      pixForm.resetFields()
      setShowPixModal(false)
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = setInterval(() => checkPixStatus(result.id), 5000)
    } catch {
      message.error('Erro ao gerar QR Code PIX. Verifique se o módulo AbacatePay está configurado.')
    } finally {
      setPixLoading(false)
    }
  }

  const checkPixStatus = async (id: string) => {
    try {
      setPixStatusLoading(true)
      const status = await apiService.getAbacatePixStatus(id) as any
      if (status?.status === 'PAID') {
        message.success('Pagamento PIX confirmado!')
        if (pollingRef.current) clearInterval(pollingRef.current)
        setPixResult(prev => prev ? { ...prev, status: 'PAID' } : prev)
      } else if (status?.status === 'EXPIRED') {
        if (pollingRef.current) clearInterval(pollingRef.current)
        setPixResult(prev => prev ? { ...prev, status: 'EXPIRED' } : prev)
      }
    } catch {
      // silencia erros de polling
    } finally {
      setPixStatusLoading(false)
    }
  }

  const handleCreateBilling = async (values: any) => {
    try {
      setBillingLoading(true)
      await apiService.createAbacateBilling({
        amount: values.amount,
        description: values.description,
        dueDate: values.dueDate
      })
      message.success('Cobrança criada com sucesso!')
      setShowBillingModal(false)
      billingForm.resetFields()
      loadBillings()
    } catch {
      message.error('Erro ao criar cobrança.')
    } finally {
      setBillingLoading(false)
    }
  }

  const billingColumns = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (v: string) => (
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => (
        <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>
          R$ {(v / 100).toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      title: 'Vencimento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (d: string) => (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {d ? new Date(d).toLocaleDateString('pt-BR') : '-'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <StatusBadge status={s} />,
    },
    {
      title: 'Link',
      key: 'link',
      render: (_: any, record: Billing) =>
        record.paymentUrl ? (
          <a href={record.paymentUrl} target="_blank" rel="noreferrer">
            <Button
              size="small"
              style={{
                height: 28,
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
                fontSize: 12,
              }}
            >
              Abrir
            </Button>
          </a>
        ) : (
          <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>—</span>
        ),
    },
  ]

  const pixTabContent = (
    <Row gutter={[16, 16]} style={{ marginTop: 0 }}>
      <Col xs={24} lg={pixResult ? 12 : 24}>
        <Card
          bodyStyle={{ padding: 20 }}
          style={{
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Gerar QR Code PIX
            </h3>
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => setShowPixModal(true)}
            >
              Novo PIX
            </Button>
          </div>

          {!pixResult ? (
            <EmptyState
              icon={<QrcodeOutlined style={{ fontSize: 32 }} />}
              title="Nenhum QR Code gerado"
              description='Clique em "Novo PIX" para gerar um QR Code de pagamento'
            />
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%', alignItems: 'center' }}>
              {pixResult.status === 'PAID' && (
                <Alert
                  message="Pagamento confirmado!"
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  style={{ width: '100%' }}
                />
              )}
              {pixResult.status === 'EXPIRED' && (
                <Alert
                  message="QR Code expirado"
                  type="error"
                  showIcon
                  style={{ width: '100%' }}
                />
              )}
              {pixResult.status === 'PENDING' && (
                <Alert
                  message="Aguardando pagamento..."
                  type="info"
                  showIcon
                  icon={<ClockCircleOutlined />}
                  style={{ width: '100%' }}
                />
              )}
              {pixResult.qrCodeImage && (
                <img
                  src={pixResult.qrCodeImage}
                  alt="QR Code PIX"
                  style={{
                    width: 200,
                    height: 200,
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                  }}
                />
              )}
              {pixResult.qrCode && (
                <Input.TextArea
                  value={pixResult.qrCode}
                  readOnly
                  rows={3}
                  style={{ fontSize: 11 }}
                />
              )}
              <Space>
                <Button
                  icon={<ReloadOutlined spin={pixStatusLoading} />}
                  onClick={() => checkPixStatus(pixResult.id)}
                  disabled={pixResult.status !== 'PENDING'}
                  style={{
                    height: 36,
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-surface)',
                  }}
                >
                  Verificar Status
                </Button>
                <Button
                  onClick={() => {
                    setPixResult(null)
                    if (pollingRef.current) clearInterval(pollingRef.current)
                  }}
                  style={{
                    height: 36,
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-surface)',
                  }}
                >
                  Limpar
                </Button>
              </Space>
            </Space>
          )}
        </Card>
      </Col>

      {pixResult && (
        <Col xs={24} lg={12}>
          <Card
            bodyStyle={{ padding: 20 }}
            style={{
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              Detalhes
            </h3>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Valor</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#059669', margin: 0, fontFamily: 'var(--display-family)' }}>
                  R$ {(pixResult.amount / 100).toFixed(2).replace('.', ',')}
                </p>
              </div>
              {pixResult.description && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Descrição:</strong> {pixResult.description}
                </div>
              )}
              {pixResult.expiresAt && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Expira em:</strong>{' '}
                  {new Date(pixResult.expiresAt).toLocaleString('pt-BR')}
                </div>
              )}
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Status:</strong>
                <StatusBadge status={pixResult.status} />
              </div>
            </Space>
          </Card>
        </Col>
      )}
    </Row>
  )

  const billingsTabContent = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowBillingModal(true)}
        >
          Nova Cobrança
        </Button>
      </div>
      <div style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <Table
          columns={billingColumns}
          dataSource={billings}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <EmptyState
                icon={<CreditCardOutlined style={{ fontSize: 28 }} />}
                title="Nenhuma cobrança criada"
                description="Crie uma cobrança para começar a receber pagamentos"
                compact
              />
            ),
          }}
        />
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Pagamentos"
        subtitle="Gerencie cobranças e pagamentos PIX"
        breadcrumb={[{ label: 'Pagamentos' }]}
        actions={
          <>
            <Button
              icon={<QrcodeOutlined />}
              onClick={() => setShowPixModal(true)}
              style={{
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
              }}
            >
              Gerar PIX
            </Button>
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              onClick={() => setShowBillingModal(true)}
            >
              Nova Cobrança
            </Button>
          </>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        <Tabs
          defaultActiveKey="pix"
          items={[
            {
              key: 'pix',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <QrcodeOutlined /> PIX
                </span>
              ),
              children: pixTabContent,
            },
            {
              key: 'billings',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCardOutlined /> Cobranças
                </span>
              ),
              children: billingsTabContent,
            },
          ]}
        />
      </div>

      {/* Modal PIX */}
      <Modal
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 700 }}>
            <QrcodeOutlined style={{ color: 'var(--primary-color)' }} />
            Gerar QR Code PIX
          </span>
        }
        open={showPixModal}
        onCancel={() => setShowPixModal(false)}
        footer={null}
      >
        <Form form={pixForm} layout="vertical" onFinish={handleCreatePix}>
          <Form.Item
            name="amount"
            label="Valor (em centavos)"
            rules={[{ required: true, message: 'Informe o valor' }]}
            extra="Ex: 5000 = R$ 50,00"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ex: 5000" />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input placeholder="Ex: Banho e tosa - Rex" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => setShowPixModal(false)}
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-surface)',
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={pixLoading}>
                Gerar QR Code
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cobrança */}
      <Modal
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 700 }}>
            <CreditCardOutlined style={{ color: 'var(--primary-color)' }} />
            Nova Cobrança
          </span>
        }
        open={showBillingModal}
        onCancel={() => setShowBillingModal(false)}
        footer={null}
      >
        <Form form={billingForm} layout="vertical" onFinish={handleCreateBilling}>
          <Form.Item
            name="amount"
            label="Valor (em centavos)"
            rules={[{ required: true, message: 'Informe o valor' }]}
            extra="Ex: 5000 = R$ 50,00"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ex: 5000" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Descrição"
            rules={[{ required: true, message: 'Informe a descrição' }]}
          >
            <Input placeholder="Ex: Consulta veterinária" />
          </Form.Item>
          <Form.Item name="dueDate" label="Data de Vencimento">
            <Input type="date" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => setShowBillingModal(false)}
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-surface)',
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={billingLoading}>
                Criar Cobrança
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
