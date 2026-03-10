import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Card, Button, Modal, Form, InputNumber, Input, message,
  Table, Tag, Space, Tabs, Statistic, Row, Col, Spin, Alert
} from 'antd'
import {
  QrcodeOutlined, CreditCardOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'

const { TabPane } = Tabs

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
      // Inicia polling de status a cada 5s
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

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'orange', label: 'Pendente' },
      PAID: { color: 'green', label: 'Pago' },
      EXPIRED: { color: 'red', label: 'Expirado' },
      OVERDUE: { color: 'red', label: 'Vencido' },
      CANCELLED: { color: 'default', label: 'Cancelado' }
    }
    const info = map[status] ?? { color: 'default', label: status }
    return <Tag color={info.color}>{info.label}</Tag>
  }

  const billingColumns = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `R$ ${(v / 100).toFixed(2).replace('.', ',')}`
    },
    {
      title: 'Vencimento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => getStatusTag(s)
    },
    {
      title: 'Link',
      key: 'link',
      render: (_: any, record: Billing) =>
        record.paymentUrl ? (
          <a href={record.paymentUrl} target="_blank" rel="noreferrer">
            <Button size="small">Abrir</Button>
          </a>
        ) : '-'
    }
  ]

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Pagamentos</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>
            Gerencie cobranças via PIX e links de pagamento (AbacatePay)
          </p>
        </div>

        <Tabs defaultActiveKey="pix">
          <TabPane tab={<span><QrcodeOutlined /> PIX</span>} key="pix">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={pixResult ? 12 : 24}>
                <Card
                  title="Gerar QR Code PIX"
                  extra={
                    <Button
                      type="primary"
                      icon={<QrcodeOutlined />}
                      style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                      onClick={() => setShowPixModal(true)}
                    >
                      Novo PIX
                    </Button>
                  }
                >
                  {!pixResult ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                      <QrcodeOutlined style={{ fontSize: 48, color: '#d1d5db' }} />
                      <p style={{ marginTop: 16 }}>Clique em "Novo PIX" para gerar um QR Code de pagamento</p>
                    </div>
                  ) : (
                    <Space direction="vertical" size="middle" style={{ width: '100%', alignItems: 'center' }}>
                      {pixResult.status === 'PAID' && (
                        <Alert
                          message="Pagamento confirmado!"
                          type="success"
                          showIcon
                          icon={<CheckCircleOutlined />}
                        />
                      )}
                      {pixResult.status === 'EXPIRED' && (
                        <Alert message="QR Code expirado" type="error" showIcon />
                      )}
                      {pixResult.status === 'PENDING' && (
                        <Alert
                          message="Aguardando pagamento..."
                          type="info"
                          showIcon
                          icon={<ClockCircleOutlined />}
                        />
                      )}
                      {pixResult.qrCodeImage && (
                        <img
                          src={pixResult.qrCodeImage}
                          alt="QR Code PIX"
                          style={{ width: 200, height: 200, border: '1px solid #e5e7eb', borderRadius: 8 }}
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
                        >
                          Verificar Status
                        </Button>
                        <Button onClick={() => {
                          setPixResult(null)
                          if (pollingRef.current) clearInterval(pollingRef.current)
                        }}>
                          Limpar
                        </Button>
                      </Space>
                    </Space>
                  )}
                </Card>
              </Col>
              {pixResult && (
                <Col xs={24} lg={12}>
                  <Card title="Detalhes">
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Statistic
                        title="Valor"
                        value={pixResult.amount / 100}
                        prefix="R$"
                        precision={2}
                        valueStyle={{ color: '#059669' }}
                      />
                      {pixResult.description && (
                        <div><strong>Descrição:</strong> {pixResult.description}</div>
                      )}
                      {pixResult.expiresAt && (
                        <div>
                          <strong>Expira em:</strong>{' '}
                          {new Date(pixResult.expiresAt).toLocaleString('pt-BR')}
                        </div>
                      )}
                      <div><strong>Status:</strong> {getStatusTag(pixResult.status)}</div>
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
          </TabPane>

          <TabPane tab={<span><CreditCardOutlined /> Cobranças</span>} key="billings">
            <Card
              title="Cobranças / Links de Pagamento"
              extra={
                <Button
                  type="primary"
                  icon={<CreditCardOutlined />}
                  style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                  onClick={() => setShowBillingModal(true)}
                >
                  Nova Cobrança
                </Button>
              }
            >
              <Table
                columns={billingColumns}
                dataSource={billings}
                rowKey="id"
                loading={loading}
                locale={{ emptyText: 'Nenhuma cobrança criada' }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Space>

      {/* Modal PIX */}
      <Modal
        title="Gerar QR Code PIX"
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
              <Button onClick={() => setShowPixModal(false)}>Cancelar</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={pixLoading}
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                Gerar QR Code
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cobrança */}
      <Modal
        title="Nova Cobrança"
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
              <Button onClick={() => setShowBillingModal(false)}>Cancelar</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={billingLoading}
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                Criar Cobrança
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
