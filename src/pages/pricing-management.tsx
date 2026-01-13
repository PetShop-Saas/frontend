import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
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
  Divider,
  Tabs,
  Typography,
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
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

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
  
  // Modals
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
    } catch (error) {
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
    } catch (error: any) {
      message.error(error?.message || 'Erro ao carregar dados')
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
    } catch (error: any) {
      message.error(error?.message || 'Erro ao salvar preço')
    }
  }

  const handleDeletePrice = async (id: string) => {
    try {
      await apiService.deletePlanPricing(id)
      message.success('Preço removido com sucesso!')
      loadData()
    } catch (error: any) {
      message.error(error?.message || 'Erro ao remover preço')
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
    } catch (error: any) {
      message.error(error?.message || 'Erro ao salvar promoção')
    }
  }

  const handleDeletePromotion = async (id: string) => {
    try {
      await apiService.deletePromotion(id)
      message.success('Promoção removida com sucesso!')
      loadData()
    } catch (error: any) {
      message.error(error?.message || 'Erro ao remover promoção')
    }
  }

  const priceColumns = [
    {
      title: 'Plano',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => {
        const colors: Record<string, string> = {
          BASIC: 'blue',
          PRO: 'purple',
          ENTERPRISE: 'gold',
        }
        return <Tag color={colors[plan] || 'default'}>{plan}</Tag>
      },
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: PlanPricing) => (
        <Text strong>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: record.currency || 'BRL',
          }).format(price)}
        </Text>
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
      render: (date?: string) => date ? dayjs(date).format('DD/MM/YYYY') : <Text type="secondary">Sem expiração</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Ativo</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">Inativo</Tag>
        )
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: PlanPricing) => (
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
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
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
          <Text strong>{name}</Text>
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
          return <Text strong>{value}%</Text>
        }
        return (
          <Text strong>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(value)}
          </Text>
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
        const colors: Record<string, string> = {
          BASIC: 'blue',
          PRO: 'purple',
          ENTERPRISE: 'gold',
        }
        return <Tag color={colors[planPricing.plan] || 'default'}>{planPricing.plan}</Tag>
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
      render: (date?: string) => date ? dayjs(date).format('DD/MM/YYYY') : <Text type="secondary">Sem expiração</Text>,
    },
    {
      title: 'Usos',
      key: 'usage',
      render: (_: any, record: Promotion) => {
        if (!record.usageLimit) {
          return <Text>{record.usageCount} / ∞</Text>
        }
        return <Text>{record.usageCount} / {record.usageLimit}</Text>
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Ativa</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">Inativa</Tag>
        )
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Promotion) => (
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
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="p-6">
        <div className="mb-6">
          <Title level={2}>Gerenciamento de Preços e Promoções</Title>
          <Text type="secondary">
            Gerencie os preços dos planos e crie promoções para atrair novos clientes.
            As promoções não afetam assinaturas já em andamento.
          </Text>
        </div>

        <Alert
          message="Importante"
          description="As promoções aplicam-se apenas a novas assinaturas. Assinaturas existentes mantêm o preço original da data da transação."
          type="info"
          showIcon
          className="mb-4"
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'prices',
              label: 'Preços dos Planos',
              children: (
                <Card
                  title="Preços dos Planos"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreatePrice}
                    >
                      Novo Preço
                    </Button>
                  }
                >
                  <Table
                    columns={priceColumns}
                    dataSource={planPricings}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              ),
            },
            {
              key: 'promotions',
              label: 'Promoções',
              children: (
                <Card
                  title="Promoções"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreatePromotion}
                    >
                      Nova Promoção
                    </Button>
                  }
                >
                  <Table
                    columns={promotionColumns}
                    dataSource={promotions}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              ),
            },
          ]}
        />
      </div>

      {/* Modal de Preço */}
      <Modal
        title={editingPrice ? 'Editar Preço' : 'Novo Preço'}
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
              parser={(value: any) => value!.replace(/R\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Moeda"
            initialValue="BRL"
          >
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

          <Form.Item
            name="validUntil"
            label="Válido até (opcional)"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descrição (opcional)"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          {editingPrice && (
            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal de Promoção */}
      <Modal
        title={editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
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

          <Form.Item
            name="description"
            label="Descrição (opcional)"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="code"
            label="Código da Promoção (opcional)"
          >
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
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="planPricingId"
            label="Aplicar a um plano específico (opcional)"
          >
            <Select
              placeholder="Deixe em branco para aplicar a todos os planos"
              allowClear
            >
              {planPricings
                .filter((p) => p.isActive)
                .map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.plan} - {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: p.currency || 'BRL',
                    }).format(p.price)}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="minMonths"
            label="Mínimo de meses de assinatura"
            initialValue={1}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxMonths"
            label="Máximo de meses (opcional)"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="validFrom"
            label="Válido a partir de"
            rules={[{ required: true, message: 'Informe a data de início' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="validUntil"
            label="Válido até (opcional)"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="usageLimit"
            label="Limite de usos (opcional)"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Deixe em branco para ilimitado" />
          </Form.Item>

          {editingPromotion && (
            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Ativa" unCheckedChildren="Inativa" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

