import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag, Space, Statistic, Row, Col } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'
import { getStockMovementTypeOption, TAG_CLASS } from '../constants/tagConfig'

const { Option } = Select
const { TextArea } = Input

export default function StockMovements() {
  const [movements, setMovements] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [stockReport, setStockReport] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
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
      const [movs, prods, report] = await Promise.all([
        apiService.getStockMovements(),
        apiService.getProducts(),
        apiService.getStockReport()
      ])
      setMovements(movs as any)
      setProducts(prods as any)
      setStockReport(report as any)
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMovement = async (values: any) => {
    try {
      await apiService.createStockMovement(values)
      message.success('Movimentação registrada com sucesso!')
      setShowModal(false)
      form.resetFields()
      loadData()
    } catch (error: any) {
      message.error(error.message || 'Erro ao criar movimentação')
    }
  }

  const columns = [
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('pt-BR')
    },
    {
      title: 'Produto',
      dataIndex: ['product', 'name'],
      key: 'product'
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const opt = getStockMovementTypeOption(type)
        return (
          <Tag color={opt.color} icon={opt.icon} className={TAG_CLASS}>
            {opt.label}
          </Tag>
        )
      }
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number, record: any) => (
        <span style={{ color: record.type === 'ENTRY' ? 'green' : record.type === 'EXIT' ? 'red' : 'blue' }}>
          {record.type === 'ENTRY' ? '+' : record.type === 'EXIT' ? '-' : ''}{qty}
        </span>
      )
    },
    {
      title: 'Estoque Anterior',
      dataIndex: 'previousStock',
      key: 'previousStock'
    },
    {
      title: 'Estoque Novo',
      dataIndex: 'newStock',
      key: 'newStock'
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason'
    }
  ]

  const reportColumns = [
    {
      title: 'Produto',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku'
    },
    {
      title: 'Estoque Atual',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: any) => (
        <Tag color={record.needsRestock ? 'red' : 'green'}>{stock}</Tag>
      )
    },
    {
      title: 'Estoque Mínimo',
      dataIndex: 'minStock',
      key: 'minStock'
    },
    {
      title: 'Valor Unitário',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `R$ ${price.toFixed(2)}`
    },
    {
      title: 'Valor em Estoque',
      dataIndex: 'stockValue',
      key: 'stockValue',
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: any) => (
        record.needsRestock ? 
          <Tag color="red">Repor</Tag> : 
          <Tag color="green">OK</Tag>
      )
    }
  ]

  const totalStockValue = stockReport.reduce((sum, item) => sum + item.stockValue, 0)
  const lowStockCount = stockReport.filter(item => item.needsRestock).length

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Movimentações de Estoque</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowModal(true)}
          >
            Nova Movimentação
          </Button>
        </div>

        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card>
              <Statistic 
                title="Valor Total em Estoque" 
                value={totalStockValue}
                precision={2}
                prefix="R$"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="Produtos em Estoque" 
                value={stockReport.length}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="Produtos com Estoque Baixo" 
                value={lowStockCount}
                valueStyle={{ color: lowStockCount > 0 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Relatório de Estoque" className="mb-6">
          <Table
            dataSource={stockReport}
            columns={reportColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Card title="Histórico de Movimentações">
          <Table
            dataSource={movements}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          title="Registrar Movimentação"
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateMovement}>
            <Form.Item 
              name="productId" 
              label="Produto"
              rules={[{ required: true, message: 'Selecione o produto' }]}
            >
              <Select 
                placeholder="Selecione o produto"
                showSearch
                filterOption={(input, option) =>
                  ((option?.children as any) || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {products.map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.name} - Estoque: {product.stock}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              name="type" 
              label="Tipo de Movimentação"
              rules={[{ required: true, message: 'Selecione o tipo' }]}
            >
              <Select placeholder="Selecione">
                <Option value="ENTRY">Entrada</Option>
                <Option value="EXIT">Saída</Option>
                <Option value="ADJUSTMENT">Ajuste</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="quantity" 
              label="Quantidade"
              rules={[{ required: true, message: 'Digite a quantidade' }]}
            >
              <Input type="number" min={1} placeholder="Quantidade" />
            </Form.Item>

            <Form.Item name="reason" label="Motivo">
              <Input placeholder="Ex: Compra, Venda, Devolução, etc" />
            </Form.Item>

            <Form.Item name="notes" label="Observações">
              <TextArea rows={3} placeholder="Observações adicionais..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Registrar
                </Button>
                <Button onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}




