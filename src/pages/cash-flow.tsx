import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag, Space, Statistic, Row, Col, Popconfirm } from 'antd'
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'

import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

export default function CashFlow() {
  const [entries, setEntries] = useState<any[]>([])
  const [balance, setBalance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [dateRange, setDateRange] = useState<any>([dayjs().subtract(30, 'days'), dayjs()])
  const [form] = Form.useForm()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [router, dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      const [entriesData, balanceData] = await Promise.all([
        apiService.getCashFlowEntries({
          startDate: dateRange[0]?.format('YYYY-MM-DD'),
          endDate: dateRange[1]?.format('YYYY-MM-DD')
        }),
        apiService.getCashFlowBalance(
          dateRange[0]?.format('YYYY-MM-DD'),
          dateRange[1]?.format('YYYY-MM-DD')
        )
      ])
      setEntries(entriesData as any)
      setBalance(balanceData as any)
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEntry = async (values: any) => {
    try {
      // Validar que aporte inicial deve ser do tipo INCOME
      if (values.category === 'CAPITAL_INITIAL' && values.type !== 'INCOME') {
        message.warning('Aporte inicial deve ser do tipo Entrada')
        form.setFieldsValue({ type: 'INCOME' })
        return
      }

      // Enviar data no formato ISO para preservar a data exata
      const entryData: any = {
        type: values.type,
        category: values.category,
        amount: values.amount,
        description: values.description,
        paymentMethod: values.paymentMethod,
        date: values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
      }

      // Adicionar referência apenas se existir
      if (values.reference) {
        entryData.reference = values.reference;
      }
      if (values.referenceType) {
        entryData.referenceType = values.referenceType;
      }

      await apiService.createCashFlowEntry(entryData)
      
      const categoryName = values.category === 'CAPITAL_INITIAL' 
        ? 'Aporte inicial registrado' 
        : 'Lançamento registrado com sucesso!'
      
      message.success(categoryName)
      setShowModal(false)
      form.resetFields()
      // Recarregar dados após criar
      await loadData()
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao criar lançamento'
      message.error(errorMessage)
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir este lançamento?',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await apiService.deleteCashFlowEntry(id)
          message.success('Lançamento excluído!')
          loadData()
        } catch (error) {
          message.error('Erro ao excluir lançamento')
        }
      },
    })
  }

  const getTypeColor = (type: string) => type === 'INCOME' ? 'green' : 'red'

  const columns = [
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag 
          color={getTypeColor(type)} 
          icon={type === 'INCOME' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        >
          {type === 'INCOME' ? 'Entrada' : 'Saída'}
        </Tag>
      )
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const categoryMap: Record<string, string> = {
          'CAPITAL_INITIAL': 'Aporte Inicial',
          'SALE': 'Venda',
          'PURCHASE': 'Compra',
          'SALARY': 'Salário',
          'RENT': 'Aluguel',
          'UTILITIES': 'Contas',
          'OTHER': 'Outro',
        };
        return categoryMap[category] || category;
      }
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <span style={{ color: record.type === 'INCOME' ? 'green' : 'red', fontWeight: 'bold' }}>
          {record.type === 'INCOME' ? '+' : '-'} R$ {amount.toFixed(2)}
        </span>
      )
    },
    {
      title: 'Método Pagamento',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod'
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: any) => (
        <Button 
          type="link" 
          danger 
          onClick={() => handleDelete(record.id)}
        >
          Excluir
        </Button>
      )
    }
  ]

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowModal(true)}
            >
              Novo Lançamento
            </Button>
          </Space>
        </div>

        {balance && (
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Total de Entradas" 
                  value={balance.totalIncome}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Total de Saídas" 
                  value={balance.totalExpense}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Saldo" 
                  value={balance.balance}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: balance.balance >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Card title="Lançamentos">
          <Table
            dataSource={entries}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20 }}
          />
        </Card>

        <Modal
          title="Novo Lançamento"
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateEntry}>
            <Form.Item 
              name="type" 
              label="Tipo"
              rules={[{ required: true, message: 'Selecione o tipo' }]}
            >
              <Select 
                placeholder="Selecione"
                onChange={(value) => {
                  const category = form.getFieldValue('category')
                  if (category === 'CAPITAL_INITIAL' && value !== 'INCOME') {
                    message.warning('Aporte inicial deve ser do tipo Entrada')
                    form.setFieldsValue({ type: 'INCOME' })
                  }
                }}
              >
                <Option value="INCOME">Entrada</Option>
                <Option value="EXPENSE">Saída</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="category" 
              label="Categoria"
              rules={[{ required: true, message: 'Selecione a categoria' }]}
            >
              <Select 
                placeholder="Selecione"
                onChange={(value) => {
                  if (value === 'CAPITAL_INITIAL') {
                    form.setFieldsValue({ type: 'INCOME' })
                  }
                }}
              >
                <Option value="CAPITAL_INITIAL">Aporte Inicial</Option>
                <Option value="SALE">Venda</Option>
                <Option value="PURCHASE">Compra</Option>
                <Option value="SALARY">Salário</Option>
                <Option value="RENT">Aluguel</Option>
                <Option value="UTILITIES">Contas (Água, Luz, etc)</Option>
                <Option value="OTHER">Outro</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="amount" 
              label="Valor"
              rules={[{ required: true, message: 'Digite o valor' }]}
            >
              <Input 
                type="number" 
                step="0.01" 
                min={0}
                prefix="R$" 
                placeholder="0.00" 
              />
            </Form.Item>

            <Form.Item 
              name="paymentMethod" 
              label="Método de Pagamento"
            >
              <Select placeholder="Selecione">
                <Option value="CASH">Dinheiro</Option>
                <Option value="CREDIT_CARD">Cartão de Crédito</Option>
                <Option value="DEBIT_CARD">Cartão de Débito</Option>
                <Option value="PIX">PIX</Option>
                <Option value="TRANSFER">Transferência</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="date" 
              label="Data"
              rules={[{ required: true, message: 'Selecione a data' }]}
              initialValue={dayjs()}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="description" label="Descrição">
              <TextArea rows={3} placeholder="Descrição do lançamento..." />
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




