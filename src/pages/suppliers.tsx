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
  Switch,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Empty,
  Row,
  Col
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { ACTIVE_INACTIVE_OPTIONS, getTagOption, TAG_CLASS } from '../constants/tagConfig'

const { Search } = Input

interface Supplier {
  id: string
  name: string
  contact?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
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
      const suppliersData = await apiService.getSuppliers()
      setSuppliers(extractArrayFromResponse<Supplier>(suppliersData, ['data', 'suppliers']))
    } catch (error) {
      message.error('Erro ao carregar fornecedores')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await apiService.createSupplier(values)
      message.success('Fornecedor criado com sucesso!')
      await loadData()
      handleModalClose()
    } catch (error) {
      message.error('Erro ao criar fornecedor')
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsEditing(true)
    form.setFieldsValue(supplier)
    setShowModal(true)
  }

  const handleUpdate = async (values: any) => {
    if (!selectedSupplier) return

    try {
      await apiService.updateSupplier(selectedSupplier.id, values)
      message.success('Fornecedor atualizado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar fornecedor')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir este fornecedor?',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await apiService.deleteSupplier(id)
          message.success('Fornecedor removido com sucesso!')
          loadData()
        } catch (error) {
          message.error('Erro ao remover fornecedor')
        }
      },
    })
  }

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    detailsForm.setFieldsValue(supplier)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedSupplier(null)
    form.resetFields()
  }

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      await apiService.updateSupplier(id, { isActive: newStatus })
      message.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar status')
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && supplier.isActive) ||
                         (filterStatus === 'inactive' && !supplier.isActive)
    
    return matchesSearch && matchesStatus
  })

  const statusOptions = ACTIVE_INACTIVE_OPTIONS
  const getStatusConfig = (isActive: boolean) => getTagOption(ACTIVE_INACTIVE_OPTIONS, isActive ? 'active' : 'inactive')

  const columns = [
    {
      title: 'Fornecedor',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Supplier) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<ShopOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            {record.contact && (
              <div className="text-sm text-gray-500">{record.contact}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Contato',
      key: 'contact',
      render: (_: any, record: Supplier) => (
        <div className="space-y-1">
          {record.email && (
            <div className="flex items-center space-x-2 text-sm">
              <MailOutlined className="text-gray-400" />
              <span className="text-gray-600">{record.email}</span>
            </div>
          )}
          {record.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <PhoneOutlined className="text-gray-400" />
              <span className="text-gray-600">{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Endereço',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        address ? (
          <div className="flex items-center space-x-2 text-sm">
            <EnvironmentOutlined className="text-gray-400" />
            <span className="text-gray-600">{address}</span>
      </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => {
        const config = getStatusConfig(isActive)
        return (
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
            {config.label}
          </Tag>
        )
      },
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
            title="Tem certeza que deseja remover este fornecedor?"
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
            <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-600">Gerencie seus fornecedores</p>
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
            Novo Fornecedor
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="Buscar fornecedores..."
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

        {/* Suppliers Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredSuppliers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} fornecedores`,
            }}
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <ShopOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhum fornecedor encontrado</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-6">
                    {searchTerm || filterStatus ? 'Tente ajustar seus filtros.' : 'Comece adicionando o primeiro fornecedor.'}
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
                      Adicionar Primeiro Fornecedor
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </Card>

        {/* Modal de Novo/Editar Fornecedor */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ShopOutlined className="text-green-600" />
              <span>{isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</span>
        </div>
          }
          open={showModal}
          onCancel={handleModalClose}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={isEditing ? handleUpdate : handleCreate}
            className="mt-4"
          >
            <Form.Item
              name="name"
              label="Nome do Fornecedor"
              rules={[{ required: true, message: 'Por favor, insira o nome do fornecedor!' }]}
            >
              <Input placeholder="Ex: Distribuidora Pet" />
            </Form.Item>

            <Form.Item
              name="contact"
              label="Nome do Contato"
            >
              <Input placeholder="Nome da pessoa responsável" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: 'email', message: 'Por favor, insira um email válido!' }
                  ]}
                >
                  <Input placeholder="contato@fornecedor.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Telefone"
                >
                  <Input placeholder="(11) 99999-9999" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Endereço"
            >
              <Input.TextArea 
                placeholder="Endereço completo do fornecedor"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch 
                checkedChildren="Ativo" 
                unCheckedChildren="Inativo"
                defaultChecked
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
                {isEditing ? 'Atualizar' : 'Criar'} Fornecedor
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ShopOutlined className="text-green-600" />
              <span>Detalhes do Fornecedor</span>
            </div>
          }
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={600}
        >
          {selectedSupplier && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<ShopOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedSupplier.name}
                        </h3>
                    {selectedSupplier.contact && (
                      <p className="text-gray-600">
                        Contato: {selectedSupplier.contact}
                      </p>
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações de Contato</h4>
                      <div className="space-y-2">
                        {selectedSupplier.email && (
                          <div className="flex items-center space-x-2">
                            <MailOutlined className="text-gray-400" />
                            <span className="text-sm">{selectedSupplier.email}</span>
                      </div>
                        )}
                        {selectedSupplier.phone && (
                          <div className="flex items-center space-x-2">
                            <PhoneOutlined className="text-gray-400" />
                            <span className="text-sm">{selectedSupplier.phone}</span>
                          </div>
                        )}
                        {selectedSupplier.address && (
                          <div className="flex items-start space-x-2">
                            <EnvironmentOutlined className="text-gray-400 mt-1" />
                            <span className="text-sm">{selectedSupplier.address}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Tag color={selectedSupplier.isActive ? 'green' : 'red'} className={TAG_CLASS}>
                            {selectedSupplier.isActive ? 'Ativo' : 'Inativo'}
                          </Tag>
                        </div>
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
                    handleEdit(selectedSupplier)
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
                  Editar Fornecedor
                </Button>
            </div>
          </div>
        )}
        </Modal>
      </div>
    </div>
  )
}