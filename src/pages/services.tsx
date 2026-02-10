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
  Switch,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Empty,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { ACTIVE_INACTIVE_OPTIONS, getTagOption, TAG_CLASS } from '../constants/tagConfig'

const { Search } = Input

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
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
      const servicesData = await apiService.getServices()
      
      // Estrutura padronizada: { data, total, page, limit }
      const servicesArray = Array.isArray(servicesData) ? servicesData : (servicesData as any)?.data || []
      setServices(servicesArray)
    } catch (error) {
      message.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await apiService.createService(values)
      message.success('Serviço criado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao criar serviço')
    }
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setIsEditing(true)
    form.setFieldsValue(service)
    setShowModal(true)
  }

  const handleUpdate = async (values: any) => {
    if (!selectedService) return

    try {
      await apiService.updateService(selectedService.id, values)
      message.success('Serviço atualizado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar serviço')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir este serviço?',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await apiService.deleteService(id)
          message.success('Serviço removido com sucesso!')
          loadData()
        } catch (error) {
          message.error('Erro ao remover serviço')
        }
      },
    })
  }

  const handleViewDetails = (service: Service) => {
    setSelectedService(service)
    detailsForm.setFieldsValue(service)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedService(null)
    form.resetFields()
  }

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      await apiService.updateService(id, { isActive: newStatus })
      message.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar status')
    }
  }

  const filteredServices = services.filter(service => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      (service.name?.toLowerCase().includes(term)) ||
      (service.description?.toLowerCase().includes(term))
    const matchesStatus = !filterStatus ||
      (filterStatus === 'active' && service.isActive) ||
      (filterStatus === 'inactive' && !service.isActive)
    return matchesSearch && matchesStatus
  })

  const statusOptions = ACTIVE_INACTIVE_OPTIONS
  const getStatusConfig = (isActive: boolean) => getTagOption(ACTIVE_INACTIVE_OPTIONS, isActive ? 'active' : 'inactive')

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<SettingOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            {record.description && (
              <div className="text-sm text-gray-500">{record.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span className="text-lg font-bold text-green-600">
          R$ {(price ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Duração',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => (
        <span className="text-gray-900">{duration ? `${duration} min` : '-'}</span>
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
            title="Tem certeza que deseja remover este serviço?"
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
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
            <p className="text-gray-600">Gerencie os serviços oferecidos</p>
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
            Novo Serviço
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Search
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined className="text-gray-400" />}
                size="large"
            />
          </div>
            <div className="flex gap-2">
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

        {/* Services Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredServices}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} serviços`,
            }}
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <SettingOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhum serviço encontrado</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-6">
                    {searchTerm || filterStatus ? 'Tente ajustar seus filtros.' : 'Comece criando o primeiro serviço.'}
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
                      Criar Primeiro Serviço
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </Card>

        {/* Modal de Novo/Editar Serviço */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <SettingOutlined className="text-green-600" />
              <span>{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</span>
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
              label="Nome do Serviço"
              rules={[{ required: true, message: 'Por favor, insira o nome do serviço!' }]}
            >
              <Input placeholder="Ex: Banho e Tosa" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Descrição"
            >
              <Input.TextArea 
                placeholder="Descrição do serviço (opcional)"
                rows={3}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Preço (R$)"
                  rules={[{ required: true, message: 'Por favor, insira o preço!' }]}
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
              <Col span={12}>
                <Form.Item
                  name="duration"
                  label="Duração (minutos)"
                  rules={[{ required: true, message: 'Por favor, insira a duração!' }]}
                >
                  <InputNumber
                    placeholder="60"
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

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
                {isEditing ? 'Atualizar' : 'Criar'} Serviço
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <SettingOutlined className="text-green-600" />
              <span>Detalhes do Serviço</span>
            </div>
          }
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={600}
        >
          {selectedService && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<SettingOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedService.name}
                    </h3>
                    <p className="text-gray-600">
                      {selectedService.description || 'Sem descrição'}
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preço:</span>
                          <span className="font-bold text-green-600">
                            R$ {(selectedService.price ?? 0).toFixed(2)}
                          </span>
                    </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duração:</span>
                          <span className="font-medium">
                            {selectedService.duration ? `${selectedService.duration} min` : '-'}
                          </span>
                </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Tag color={selectedService.isActive ? 'green' : 'red'} className={TAG_CLASS}>
                            {selectedService.isActive ? 'Ativo' : 'Inativo'}
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
                    handleEdit(selectedService)
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
                  Editar Serviço
                </Button>
              </div>
          </div>
        )}
        </Modal>
    </div>
  )
}