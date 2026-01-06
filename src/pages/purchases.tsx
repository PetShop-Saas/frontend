import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService } from '../services/api'
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
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  DollarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

interface Purchase {
  id: string
  date: string
  total: number
  status: string
  notes?: string
  supplierId: string
  supplierName: string
  supplierEmail: string
  supplierPhone: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
}

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
}

interface Product {
  id: string
  name: string
  price: number
}

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterSupplier, setFilterSupplier] = useState<string | null>(null)
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
      const [purchasesData, suppliersData, productsData] = await Promise.all([
        apiService.getPurchases(),
        apiService.getSuppliers(),
        apiService.getProducts()
      ])
      
      // Verificar se é um array direto ou objeto com propriedade
      const purchasesArray = Array.isArray(purchasesData) ? purchasesData : (purchasesData as any)?.purchases || []
      const suppliersArray = Array.isArray(suppliersData) ? suppliersData : (suppliersData as any)?.suppliers || []
      const productsArray = Array.isArray(productsData) ? productsData : (productsData as any)?.products || []
      
      setPurchases(purchasesArray)
      setSuppliers(suppliersArray)
      setProducts(productsArray)
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await apiService.createPurchase(values)
      message.success('Compra criada com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao criar compra')
    }
  }

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    setIsEditing(true)
    form.setFieldsValue({
      ...purchase,
      date: dayjs(purchase.date)
    })
    setShowModal(true)
  }

  const handleUpdate = async (values: any) => {
    if (!selectedPurchase) return

    try {
      await apiService.updatePurchase(selectedPurchase.id, values)
      message.success('Compra atualizada com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar compra')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir esta compra?',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await apiService.deletePurchase(id)
          message.success('Compra removida com sucesso!')
          loadData()
        } catch (error) {
          message.error('Erro ao remover compra')
        }
      },
    })
  }

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    detailsForm.setFieldsValue(purchase)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedPurchase(null)
    form.resetFields()
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiService.updatePurchaseStatus(id, newStatus)
      message.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar status')
    }
  }

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplierEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || purchase.status === filterStatus
    const matchesSupplier = !filterSupplier || purchase.supplierId === filterSupplier
    
    return matchesSearch && matchesStatus && matchesSupplier
  })

  const statusOptions = [
    { value: 'PENDING', label: 'Pendente', color: 'orange', icon: <ClockCircleOutlined /> },
    { value: 'RECEIVED', label: 'Recebida', color: 'green', icon: <CheckCircleOutlined /> },
    { value: 'CANCELLED', label: 'Cancelada', color: 'red', icon: <CloseCircleOutlined /> }
  ]

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0]
  }

  const columns = [
    {
      title: 'Fornecedor',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text: string, record: Purchase) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<ShopOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.supplierEmail}</div>
            <div className="text-xs text-gray-400">{record.supplierPhone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Produtos',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{item.productName}</span>
              <span className="text-gray-500 ml-2">x{item.quantity}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <span className="text-lg font-bold text-green-600">
          R$ {total.toFixed(2)}
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
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
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
            title="Tem certeza que deseja remover esta compra?"
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
            <h1 className="text-2xl font-bold text-gray-900">Compras</h1>
            <p className="text-gray-600">Gerencie as compras de produtos</p>
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
              Nova Compra
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="Buscar compras..."
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

        {/* Purchases Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredPurchases}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} compras`,
            }}
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <ShoppingOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhuma compra encontrada</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-6">
                    {searchTerm || filterStatus ? 'Tente ajustar seus filtros.' : 'Comece criando a primeira compra.'}
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
                      Criar Primeira Compra
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </Card>

        {/* Modal de Nova/Editar Compra */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ShoppingOutlined className="text-green-600" />
              <span>{isEditing ? 'Editar Compra' : 'Nova Compra'}</span>
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
                  name="supplierId"
                  label="Fornecedor"
                  rules={[{ required: true, message: 'Por favor, selecione um fornecedor!' }]}
                >
                  <Select placeholder="Selecione um fornecedor">
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Data da Compra"
                  rules={[{ required: true, message: 'Por favor, selecione a data!' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
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
                  name="total"
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
              name="notes"
              label="Observações"
            >
              <Input.TextArea 
                placeholder="Observações sobre a compra (opcional)"
                rows={3}
              />
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
                {isEditing ? 'Atualizar' : 'Criar'} Compra
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ShoppingOutlined className="text-green-600" />
              <span>Detalhes da Compra</span>
            </div>
          }
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={700}
        >
          {selectedPurchase && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<ShoppingOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      Compra #{selectedPurchase.id.slice(-8)}
                    </h3>
                    <p className="text-gray-600">
                      {dayjs(selectedPurchase.date).format('DD/MM/YYYY')}
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fornecedor:</span>
                          <span className="font-medium">{selectedPurchase.supplierName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-green-600">
                            R$ {selectedPurchase.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Tag color={getStatusConfig(selectedPurchase.status).color}>
                            {getStatusConfig(selectedPurchase.status).label}
                          </Tag>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Produtos</h4>
                      <div className="space-y-1">
                        {selectedPurchase.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedPurchase.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                        <p className="text-sm text-gray-600">{selectedPurchase.notes}</p>
                      </div>
                    )}
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
                    handleEdit(selectedPurchase)
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
                  Editar Compra
                </Button>
              </div>
          </div>
        )}
        </Modal>
      </div>
    </div>
  )
}