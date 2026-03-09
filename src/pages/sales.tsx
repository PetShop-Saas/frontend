import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService, extractArrayFromResponse } from '../services/api'
import {
  Card,
  Button,
  Table,
  Input,
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Empty,
  Row,
  Col,
  Select,
  DatePicker
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons'
import { SALE_STATUS_OPTIONS, getTagOption, TAG_CLASS } from '../constants/tagConfig'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

interface Sale {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  totalAmount: number
  status: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  products: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterCustomer, setFilterCustomer] = useState<string | null>(null)
  const router = useRouter()
  const [form] = Form.useForm()
  const [detailsForm] = Form.useForm()

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
      const [salesData, productsData, customersData] = await Promise.all([
        apiService.getSales(),
        apiService.getProducts(),
        apiService.getCustomers()
      ])
      
      setSales(extractArrayFromResponse(salesData, ['data', 'sales']))
      setProducts(extractArrayFromResponse(productsData, ['data', 'products']))
      setCustomers(extractArrayFromResponse(customersData, ['data', 'customers']))
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await apiService.createSale(values)
      message.success('Venda criada com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao criar venda')
    }
  }

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale)
    setIsEditing(true)
    form.setFieldsValue({
      ...sale,
      date: dayjs(sale.createdAt)
    })
    setShowModal(true)
  }

  const handleUpdate = async (values: any) => {
    if (!selectedSale) return

    try {
      await apiService.updateSale(selectedSale.id, values)
      message.success('Venda atualizada com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar venda')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir esta venda?',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await apiService.deleteSale(id)
          message.success('Venda removida com sucesso!')
          loadData()
        } catch (error) {
          message.error('Erro ao remover venda')
        }
      },
    })
  }

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale)
    detailsForm.setFieldsValue(sale)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedSale(null)
    form.resetFields()
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiService.updateSale(id, { status: newStatus })
      message.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar status')
    }
  }

  const filteredSales = sales.filter(sale => {
    const name = (sale.customerName || '').toString().toLowerCase()
    const email = (sale.customerEmail || '').toString().toLowerCase()
    const term = (searchTerm || '').toString().toLowerCase()

    const matchesSearch = term === '' || name.includes(term) || email.includes(term)
    const matchesStatus = !filterStatus || sale.status === filterStatus
    const matchesCustomer = !filterCustomer || sale.customerId === filterCustomer
    return matchesSearch && matchesStatus && matchesCustomer
  })

  const statusOptions = SALE_STATUS_OPTIONS
  const getStatusConfig = (status: string) => getTagOption(SALE_STATUS_OPTIONS, status)

  const paymentMethods = [
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
    { value: 'PIX', label: 'PIX' },
    { value: 'TRANSFER', label: 'Transferência' }
  ]

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string, record: Sale) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<UserOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.customerEmail}</div>
            <div className="text-xs text-gray-400">{record.customerPhone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Produtos',
      dataIndex: 'products',
      key: 'products',
      render: (products: any[]) => (
        <div className="space-y-1">
          {products.map((product, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{product.name}</span>
              <span className="text-gray-500 ml-2">x{product.quantity}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <span className="text-lg font-bold text-green-600">
          R$ {Number(amount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status)
        return (
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="text-green-600 hover:text-green-800"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-green-600 hover:text-green-800"
          />
          <Popconfirm
            title="Tem certeza que deseja remover esta venda?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-600">Gerencie as vendas de produtos</p>
          </div>
          <div className="flex space-x-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              size="large"
              className="px-6 py-3 hover:bg-gray-50 hover:border-gray-300"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#d1d5db',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              Atualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-3"
              style={{
                backgroundColor: '#16a34a',
                borderColor: '#16a34a'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d'
                e.currentTarget.style.borderColor = '#15803d'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a'
                e.currentTarget.style.borderColor = '#16a34a'
              }}
              size="large"
            >
              Nova Venda
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="Buscar vendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined className="text-gray-400" />}
                size="large"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type={filterStatus === null ? 'primary' : 'default'}
                onClick={() => setFilterStatus(null)}
                className={filterStatus === null ? 'bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2' : 'px-6 py-2'}
                style={filterStatus === null ? {
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a'
                } : {
                  backgroundColor: '#ffffff',
                  borderColor: '#d1d5db',
                  color: '#374151'
                }}
                onMouseEnter={(e) => {
                  if (filterStatus === null) {
                    e.currentTarget.style.backgroundColor = '#15803d'
                    e.currentTarget.style.borderColor = '#15803d'
                  } else {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterStatus === null) {
                    e.currentTarget.style.backgroundColor = '#16a34a'
                    e.currentTarget.style.borderColor = '#16a34a'
                  } else {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }
                }}
              >
                Todos
              </Button>
              {statusOptions.map(option => (
                <Button
                  key={option.value}
                  type={filterStatus === option.value ? 'primary' : 'default'}
                  onClick={() => setFilterStatus(filterStatus === option.value ? null : option.value)}
                  className={filterStatus === option.value ? 'bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2' : 'px-6 py-2'}
                  style={filterStatus === option.value ? {
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a'
                  } : {
                    backgroundColor: '#ffffff',
                    borderColor: '#d1d5db',
                    color: '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (filterStatus === option.value) {
                      e.currentTarget.style.backgroundColor = '#15803d'
                      e.currentTarget.style.borderColor = '#15803d'
                    } else {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                      e.currentTarget.style.borderColor = '#9ca3af'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterStatus === option.value) {
                      e.currentTarget.style.backgroundColor = '#16a34a'
                      e.currentTarget.style.borderColor = '#16a34a'
                    } else {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                      e.currentTarget.style.borderColor = '#d1d5db'
                    }
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Sales Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredSales}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} vendas`,
            }}
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <ShoppingCartOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhuma venda encontrada</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-6">
                    {searchTerm || filterStatus ? 'Tente ajustar seus filtros.' : 'Comece criando a primeira venda.'}
                  </p>
                  {!searchTerm && !filterStatus && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setShowModal(true)}
                      size="large"
                      className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-3"
                      style={{
                        backgroundColor: '#16a34a',
                        borderColor: '#16a34a'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#15803d'
                        e.currentTarget.style.borderColor = '#15803d'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#16a34a'
                        e.currentTarget.style.borderColor = '#16a34a'
                      }}
                    >
                      Criar Primeira Venda
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </Card>

        {/* Modal de Nova/Editar Venda */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ShoppingCartOutlined className="text-green-600" />
              <span>{isEditing ? 'Editar Venda' : 'Nova Venda'}</span>
            </div>
          }
          open={showModal}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={isEditing ? handleUpdate : handleCreate}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="customerId"
                  label="Cliente"
                  rules={[{ required: true, message: 'Por favor, selecione um cliente!' }]}
                >
                  <Select placeholder="Selecione um cliente">
                    {customers.map(customer => (
                      <Option key={customer.id} value={customer.id}>
                        {customer.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paymentMethod"
                  label="Método de Pagamento"
                  rules={[{ required: true, message: 'Por favor, selecione o método de pagamento!' }]}
                >
                  <Select placeholder="Selecione o método">
                    {paymentMethods.map(method => (
                      <Option key={method.value} value={method.value}>
                        {method.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Por favor, selecione o status!' }]}
                >
                  <Select placeholder="Selecione o status">
                    {statusOptions.map(status => (
                      <Option key={status.value} value={status.value}>
                        {status.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalAmount"
                  label="Valor Total (R$)"
                  rules={[{ required: true, message: 'Por favor, insira o valor total!' }]}
                >
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value: any) => value!.replace(/R\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="productIds"
              label="Produtos"
              rules={[{ required: true, message: 'Por favor, selecione pelo menos um produto!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Selecione os produtos"
                showSearch
                optionFilterProp="children"
              >
                {products.map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.name} - R$ {Number(product.price ?? 0).toFixed(2)} (Estoque: {product.stock})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="flex justify-end space-x-2 pt-4">
              <Button onClick={handleModalClose}>
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-2"
                style={{
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#15803d'
                  e.currentTarget.style.borderColor = '#15803d'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#16a34a'
                  e.currentTarget.style.borderColor = '#16a34a'
                }}
              >
                {isEditing ? 'Atualizar' : 'Criar'} Venda
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ShoppingCartOutlined className="text-green-600" />
              <span>Detalhes da Venda</span>
            </div>
          }
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={700}
        >
          {selectedSale && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<ShoppingCartOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      Venda #{selectedSale.id.slice(-8)}
                    </h3>
                    <p className="text-gray-600">
                      {dayjs(selectedSale.createdAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cliente:</span>
                          <span className="font-medium">{selectedSale.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-green-600">
                            R$ {Number(selectedSale.totalAmount ?? 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Tag color={getStatusConfig(selectedSale.status).color} className={TAG_CLASS}>
                            {getStatusConfig(selectedSale.status).label}
                          </Tag>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pagamento:</span>
                          <span className="font-medium">
                            {paymentMethods.find(m => m.value === selectedSale.paymentMethod)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Produtos</h4>
                      <div className="space-y-1">
                        {selectedSale.products.map((product, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{product.name}</span>
                            <span>x{product.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEdit(selectedSale)
                  }}
                  className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-2"
                  style={{
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#15803d'
                    e.currentTarget.style.borderColor = '#15803d'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#16a34a'
                    e.currentTarget.style.borderColor = '#16a34a'
                  }}
                >
                  Editar Venda
                </Button>
              </div>
          </div>
        )}
        </Modal>
      </div>
    </div>
  )
}