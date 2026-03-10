import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Card, Table, Button, Modal, Form, InputNumber, Select,
  message, Tag, Space, Statistic, Row, Col, Popconfirm, Badge
} from 'antd'
import {
  PlusOutlined, WarningOutlined, ExclamationCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'

const { Option } = Select

interface StockAlert {
  id: string
  productId: string
  minStock: number
  currentStock: number
  isActive: boolean
  product: {
    id: string
    name: string
    sku?: string
    unit?: string
  }
}

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<StockAlert | null>(null)
  const [form] = Form.useForm()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [alertsResult, productsResult] = await Promise.allSettled([
        apiService.getStockAlerts(),
        apiService.getProducts()
      ])
      if (alertsResult.status === 'fulfilled') setAlerts(alertsResult.value as any)
      if (productsResult.status === 'fulfilled') {
        const pd = productsResult.value as any
        setProducts(Array.isArray(pd) ? pd : pd?.data ?? [])
      }
    } catch {
      message.error('Erro ao carregar alertas de estoque')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingAlert) {
        await apiService.updateStockAlert(editingAlert.id, { minStock: values.minStock })
        message.success('Alerta atualizado com sucesso!')
      } else {
        await apiService.createStockAlert({
          productId: values.productId,
          minStock: values.minStock,
          currentStock: products.find(p => p.id === values.productId)?.stock ?? 0
        })
        message.success('Alerta criado com sucesso!')
      }
      setShowModal(false)
      setEditingAlert(null)
      form.resetFields()
      loadData()
    } catch {
      message.error('Erro ao salvar alerta')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteStockAlert(id)
      message.success('Alerta removido!')
      loadData()
    } catch {
      message.error('Erro ao remover alerta')
    }
  }

  const handleEdit = (alert: StockAlert) => {
    setEditingAlert(alert)
    form.setFieldsValue({ productId: alert.productId, minStock: alert.minStock })
    setShowModal(true)
  }

  const getStatusTag = (alert: StockAlert) => {
    if (alert.currentStock === 0)
      return <Tag color="red" icon={<ExclamationCircleOutlined />}>Sem estoque</Tag>
    if (alert.currentStock <= alert.minStock)
      return <Tag color="orange" icon={<WarningOutlined />}>Estoque baixo</Tag>
    return <Tag color="green" icon={<CheckCircleOutlined />}>OK</Tag>
  }

  const criticalAlerts = alerts.filter(a => a.currentStock === 0)
  const lowAlerts = alerts.filter(a => a.currentStock > 0 && a.currentStock <= a.minStock)

  const columns = [
    {
      title: 'Produto',
      key: 'product',
      render: (_: any, record: StockAlert) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.product?.name}</div>
          {record.product?.sku && (
            <div style={{ color: '#6b7280', fontSize: 12 }}>SKU: {record.product.sku}</div>
          )}
        </div>
      )
    },
    {
      title: 'Estoque Atual',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (val: number, record: StockAlert) => (
        <span style={{ color: val <= record.minStock ? '#ef4444' : '#059669', fontWeight: 600 }}>
          {val} {record.product?.unit ?? 'UN'}
        </span>
      )
    },
    {
      title: 'Estoque Mínimo',
      dataIndex: 'minStock',
      key: 'minStock',
      render: (val: number, record: StockAlert) => `${val} ${record.product?.unit ?? 'UN'}`
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: StockAlert) => getStatusTag(record)
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: StockAlert) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>Editar</Button>
          <Popconfirm
            title="Remover este alerta?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button size="small" danger>Remover</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Alertas de Estoque</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>
            Monitore produtos com estoque abaixo do mínimo configurado
          </p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Total de Alertas" value={alerts.length} valueStyle={{ color: '#374151' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Sem Estoque"
                value={criticalAlerts.length}
                valueStyle={{ color: '#ef4444' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Estoque Baixo"
                value={lowAlerts.length}
                valueStyle={{ color: '#f97316' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: '#f97316' }} />
              <span>Alertas Configurados</span>
              {criticalAlerts.length + lowAlerts.length > 0 && (
                <Badge count={criticalAlerts.length + lowAlerts.length} color="#ef4444" />
              )}
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              onClick={() => { setEditingAlert(null); form.resetFields(); setShowModal(true) }}
            >
              Novo Alerta
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={alerts}
            rowKey="id"
            loading={loading}
            locale={{ emptyText: 'Nenhum alerta configurado' }}
          />
        </Card>
      </Space>

      <Modal
        title={editingAlert ? 'Editar Alerta' : 'Novo Alerta de Estoque'}
        open={showModal}
        onCancel={() => { setShowModal(false); setEditingAlert(null); form.resetFields() }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingAlert ? (
            <Form.Item
              name="productId"
              label="Produto"
              rules={[{ required: true, message: 'Selecione um produto' }]}
            >
              <Select
                showSearch
                placeholder="Selecione um produto"
                optionFilterProp="children"
              >
                {products
                  .filter(p => !alerts.some(a => a.productId === p.id))
                  .map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item label="Produto">
              <span style={{ fontWeight: 500 }}>{editingAlert.product.name}</span>
            </Form.Item>
          )}
          <Form.Item
            name="minStock"
            label="Estoque Mínimo"
            rules={[{ required: true, message: 'Informe o estoque mínimo' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Ex: 10" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setShowModal(false); setEditingAlert(null); form.resetFields() }}>
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                {editingAlert ? 'Atualizar' : 'Criar Alerta'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
