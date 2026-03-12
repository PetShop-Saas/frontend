import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Table,
  Button,
  message,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Tag,
  Switch,
  Tabs,
  Alert,
  Popconfirm,
  Tooltip,
} from 'antd'
import {
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { apiService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import PageSkeleton from '../components/common/PageSkeleton'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

const { Option } = Select

interface PlanPricing {
  id: string
  plan: string
  price: number
  currency: string
  isActive: boolean
  validFrom: string
  validUntil?: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface Promotion {
  id: string
  name: string
  description?: string
  code?: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  planPricingId?: string
  planPricing?: { plan: string }
  minMonths?: number
  maxMonths?: number
  validFrom: string
  validUntil?: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  createdAt: string
  updatedAt: string
}

export default function PricingManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [planPricings, setPlanPricings] = useState<PlanPricing[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [activeTab, setActiveTab] = useState('prices')

  const [priceModalVisible, setPriceModalVisible] = useState(false)
  const [promotionModalVisible, setPromotionModalVisible] = useState(false)
  const [editingPrice, setEditingPrice] = useState<PlanPricing | null>(null)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  const [priceForm] = Form.useForm()
  const [promotionForm] = Form.useForm()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (!token || !user) {
      message.error('Você precisa estar logado para acessar esta página')
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(user)
      const isAdmin = userData.role === 'ADMIN' || userData.planRole === 'ADMIN'

      if (!isAdmin) {
        message.error('Acesso negado. Apenas administradores podem acessar esta página.')
        router.push('/')
        return
      }
    } catch {
      message.error('Erro ao verificar permissões')
      router.push('/login')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pricingsData, promotionsData] = await Promise.all([
        apiService.getAllPlanPricings(),
        apiService.getAllPromotions(),
      ])
      setPlanPricings(pricingsData as PlanPricing[])
      setPromotions(promotionsData as Promotion[])
    } catch (error: unknown) {
      message.error((error as { message?: string })?.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrice = () => {
    setEditingPrice(null)
    priceForm.resetFields()
    setPriceModalVisible(true)
  }

  const handleEditPrice = (price: PlanPricing) => {
    setEditingPrice(price)
    priceForm.setFieldsValue({
      plan: price.plan,
      price: price.price,
      currency: price.currency,
      validFrom: price.validFrom ? dayjs(price.validFrom) : undefined,
      validUntil: price.validUntil ? dayjs(price.validUntil) : undefined,
      description: price.description,
      isActive: price.isActive,
    })
    setPriceModalVisible(true)
  }

  const handleSavePrice = async () => {
    try {
      const values = await priceForm.validateFields()
      const data = {
        plan: values.plan,
        price: values.price,
        currency: values.currency || 'BRL',
        validFrom: values.validFrom ? values.validFrom.toISOString() : undefined,
        validUntil: values.validUntil ? values.validUntil.toISOString() : undefined,
        description: values.description,
        isActive: editingPrice ? values.isActive : true,
      }

      if (editingPrice) {
        await apiService.updatePlanPricing(editingPrice.id, data)
        message.success('Preço atualizado com sucesso!')
      } else {
        await apiService.createPlanPricing(data)
        message.success('Preço criado com sucesso!')
      }

      setPriceModalVisible(false)
      loadData()
    } catch (error: unknown) {
      message.error((error as { message?: string })?.message || 'Erro ao salvar preço')
    }
  }

  const handleDeletePrice = async (id: string) => {
    try {
      await apiService.deletePlanPricing(id)
      message.success('Preço removido com sucesso!')
      loadData()
    } catch (error: unknown) {
      message.error((error as { message?: string })?.message || 'Erro ao remover preço')
    }
  }

  const handleCreatePromotion = () => {
    setEditingPromotion(null)
    promotionForm.resetFields()
    setPromotionModalVisible(true)
  }

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    promotionForm.setFieldsValue({
      name: promotion.name,
      description: promotion.description,
      code: promotion.code,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      planPricingId: promotion.planPricingId,
      minMonths: promotion.minMonths,
      maxMonths: promotion.maxMonths,
      validFrom: promotion.validFrom ? dayjs(promotion.validFrom) : undefined,
      validUntil: promotion.validUntil ? dayjs(promotion.validUntil) : undefined,
      usageLimit: promotion.usageLimit,
      isActive: promotion.isActive,
    })
    setPromotionModalVisible(true)
  }

  const handleSavePromotion = async () => {
    try {
      const values = await promotionForm.validateFields()
      const data = {
        name: values.name,
        description: values.description,
        code: values.code || undefined,
        discountType: values.discountType,
        discountValue: values.discountValue,
        planPricingId: values.planPricingId || undefined,
        minMonths: values.minMonths,
        maxMonths: values.maxMonths || undefined,
        validFrom: values.validFrom.toISOString(),
        validUntil: values.validUntil ? values.validUntil.toISOString() : undefined,
        usageLimit: values.usageLimit || undefined,
        isActive: editingPromotion ? values.isActive : true,
      }

      if (editingPromotion) {
        await apiService.updatePromotion(editingPromotion.id, data)
        message.success('Promoção atualizada com sucesso!')
      } else {
        await apiService.createPromotion(data)
        message.success('Promoção criada com sucesso!')
      }

      setPromotionModalVisible(false)
      loadData()
    } catch (error: unknown) {
      message.error((error as { message?: string })?.message || 'Erro ao salvar promoção')
    }
  }

  const handleDeletePromotion = async (id: string) => {
    try {
      await apiService.deletePromotion(id)
      message.success('Promoção removida com sucesso!')
      loadData()
    } catch (error: unknown) {
      message.error((error as { message?: string })?.message || 'Erro ao remover promoção')
    }
  }

  const planColors: Record<string, string> = {
    BASIC: 'blue',
    PRO: 'purple',
    ENTERPRISE: 'gold',
  }

  const tableWrapperStyle: React.CSSProperties = {
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
  }

  const priceColumns = [
    {
      title: 'Plano',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => (
        <Tag color={planColors[plan] || 'default'}>{plan}</Tag>
      ),
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: PlanPricing) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: record.currency || 'BRL',
          }).format(price)}
        </span>
      ),
    },
    {
      title: 'Válido de',
      dataIndex: 'validFrom',
      key: 'validFrom',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Válido até',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date?: string) =>
        date ? (
          dayjs(date).format('DD/MM/YYYY')
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>Sem expiração</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Ativo</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">Inativo</Tag>
        ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: PlanPricing) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditPrice(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja remover este preço?"
            onConfirm={() => handleDeletePrice(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Remover">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const promotionColumns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Promotion) => (
        <Space>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
          {record.code && (
            <Tag icon={<TagOutlined />} color="blue">{record.code}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Desconto',
      dataIndex: 'discountValue',
      key: 'discount',
      render: (value: number, record: Promotion) => {
        if (record.discountType === 'PERCENTAGE') {
          return (
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}%</span>
          )
        }
        return (
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
          </span>
        )
      },
    },
    {
      title: 'Plano',
      dataIndex: 'planPricing',
      key: 'plan',
      render: (planPricing?: { plan: string }) => {
        if (!planPricing) {
          return <Tag color="default">Todos os planos</Tag>
        }
        return <Tag color={planColors[planPricing.plan] || 'default'}>{planPricing.plan}</Tag>
      },
    },
    {
      title: 'Válido de',
      dataIndex: 'validFrom',
      key: 'validFrom',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Válido até',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date?: string) =>
        date ? (
          dayjs(date).format('DD/MM/YYYY')
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>Sem expiração</span>
        ),
    },
    {
      title: 'Usos',
      key: 'usage',
      render: (_: unknown, record: Promotion) =>
        !record.usageLimit ? (
          <span style={{ color: 'var(--text-secondary)' }}>{record.usageCount} / ∞</span>
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>{record.usageCount} / {record.usageLimit}</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Ativa</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">Inativa</Tag>
        ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, record: Promotion) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditPromotion(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja remover esta promoção?"
            onConfirm={() => handleDeletePromotion(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Remover">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Gestão de Preços"
          subtitle="Configure preços e promoções dos planos"
          breadcrumb={[{ label: 'Gestão de Preços' }]}
        />
        <div style={{ padding: '0 24px 24px' }}>
          <PageSkeleton type="table" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Gestão de Preços"
        subtitle="Configure preços e promoções dos planos"
        breadcrumb={[{ label: 'Gestão de Preços' }]}
        actions={
          <>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreatePrice}
              style={{ height: 36, borderRadius: 8, fontWeight: 600 }}
            >
              Novo Preço
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreatePromotion}
              style={{ height: 36, borderRadius: 8, fontWeight: 600 }}
            >
              Nova Promoção
            </Button>
          </>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        <Alert
          message="Importante"
          description="As promoções aplicam-se apenas a novas assinaturas. Assinaturas existentes mantêm o preço original da data da transação."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'prices',
              label: 'Preços dos Planos',
              children: (
                <div style={tableWrapperStyle}>
                  <Table
                    columns={priceColumns}
                    dataSource={planPricings}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              ),
            },
            {
              key: 'promotions',
              label: 'Promoções',
              children: (
                <div style={tableWrapperStyle}>
                  <Table
                    columns={promotionColumns}
                    dataSource={promotions}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal de Preço */}
      <Modal
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarOutlined style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
              {editingPrice ? 'Editar Preço' : 'Novo Preço'}
            </span>
          </span>
        }
        open={priceModalVisible}
        onOk={handleSavePrice}
        onCancel={() => setPriceModalVisible(false)}
        width={600}
      >
        <Form form={priceForm} layout="vertical">
          <Form.Item
            name="plan"
            label="Plano"
            rules={[{ required: true, message: 'Selecione um plano' }]}
          >
            <Select placeholder="Selecione o plano">
              <Option value="BASIC">BASIC</Option>
              <Option value="PRO">PRO</Option>
              <Option value="ENTERPRISE">ENTERPRISE</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Preço (R$)"
            rules={[{ required: true, message: 'Informe o preço' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => (value ?? '').replace(/R\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item name="currency" label="Moeda" initialValue="BRL">
            <Select>
              <Option value="BRL">BRL (Real Brasileiro)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="validFrom"
            label="Válido a partir de"
            rules={[{ required: true, message: 'Informe a data de início' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="validUntil" label="Válido até (opcional)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Descrição (opcional)">
            <Input.TextArea rows={3} />
          </Form.Item>

          {editingPrice && (
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal de Promoção */}
      <Modal
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TagOutlined style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
              {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
            </span>
          </span>
        }
        open={promotionModalVisible}
        onOk={handleSavePromotion}
        onCancel={() => setPromotionModalVisible(false)}
        width={700}
      >
        <Form form={promotionForm} layout="vertical">
          <Form.Item
            name="name"
            label="Nome da Promoção"
            rules={[{ required: true, message: 'Informe o nome da promoção' }]}
          >
            <Input placeholder="Ex: Black Friday 2024" />
          </Form.Item>

          <Form.Item name="description" label="Descrição (opcional)">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="code" label="Código da Promoção (opcional)">
            <Input placeholder="Ex: BLACKFRIDAY2024" />
          </Form.Item>

          <Form.Item
            name="discountType"
            label="Tipo de Desconto"
            rules={[{ required: true, message: 'Selecione o tipo de desconto' }]}
          >
            <Select>
              <Option value="PERCENTAGE">Percentual (%)</Option>
              <Option value="FIXED_AMOUNT">Valor Fixo (R$)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discountValue"
            label="Valor do Desconto"
            rules={[{ required: true, message: 'Informe o valor do desconto' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>

          <Form.Item name="planPricingId" label="Aplicar a um plano específico (opcional)">
            <Select
              placeholder="Deixe em branco para aplicar a todos os planos"
              allowClear
            >
              {planPricings
                .filter((p) => p.isActive)
                .map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.plan} -{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: p.currency || 'BRL',
                    }).format(p.price)}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="minMonths" label="Mínimo de meses de assinatura" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="maxMonths" label="Máximo de meses (opcional)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="validFrom"
            label="Válido a partir de"
            rules={[{ required: true, message: 'Informe a data de início' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="validUntil" label="Válido até (opcional)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="usageLimit" label="Limite de usos (opcional)">
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Deixe em branco para ilimitado"
            />
          </Form.Item>

          {editingPromotion && (
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Ativa" unCheckedChildren="Inativa" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
