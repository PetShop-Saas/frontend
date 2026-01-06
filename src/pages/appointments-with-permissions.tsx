import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePermissions } from '../hooks/usePermissions'
import { PermissionGate } from '../components/PermissionGate'
import { Modal, Form, Input, message, Select, Button, Table, Tag, Avatar, Space, Popconfirm, DatePicker, TimePicker, Card, Divider, Row, Col } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { apiService } from '../services/api'
import { 
  PlusOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined,
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'

const { RangePicker } = DatePicker
const { Option } = Select

interface Appointment {
  id: string
  date: string
  time: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  customerId: string
  petId: string
  serviceId: string
  customerName?: string
  petName?: string
  serviceName?: string
  customerEmail?: string
  customerPhone?: string
  servicePrice?: number
  serviceDuration?: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  customerId: string
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  isActive: boolean
}

const AppointmentsPage: React.FC = () => {
  const router = useRouter()
  const { hasPermission, canAccess } = usePermissions()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterDate, setFilterDate] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [appointmentsData, customersData, petsData, servicesData] = await Promise.all([
        apiService.getAppointments(),
        apiService.getCustomers(),
        apiService.getPets(),
        apiService.getServices()
      ])
      
      // Mapear dados dos agendamentos com informações relacionadas
      const appointmentsWithDetails = (appointmentsData as any)?.appointments?.map((appointment: any) => {
        const customer = (customersData as any)?.customers?.find((c: any) => c.id === appointment.customerId)
        const pet = (petsData as any)?.pets?.find((p: any) => p.id === appointment.petId)
        const service = (servicesData as any)?.services?.find((s: any) => s.id === appointment.serviceId)
        
        return {
          ...appointment,
          customerName: customer?.name || 'N/A',
          petName: pet?.name || 'N/A',
          serviceName: service?.name || 'N/A',
          customerEmail: customer?.email || 'N/A',
          customerPhone: customer?.phone || 'N/A',
          servicePrice: service?.price || 0,
          serviceDuration: service?.duration || 0
        }
      }) || []

      setAppointments(appointmentsWithDetails)
      setCustomers((customersData as any)?.customers || [])
      setPets((petsData as any)?.pets || [])
      setServices((servicesData as any)?.services || [])
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    if (!canAccess('appointments', 'create')) {
      message.error('Você não tem permissão para criar agendamentos')
      return
    }
    
    setEditingAppointment(null)
    form.resetFields()
    setShowModal(true)
  }

  const handleEdit = (appointment: Appointment) => {
    if (!canAccess('appointments', 'update')) {
      message.error('Você não tem permissão para editar agendamentos')
      return
    }
    
    setEditingAppointment(appointment)
    form.setFieldsValue({
      ...appointment,
      date: appointment.date ? [appointment.date] : null
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!canAccess('appointments', 'delete')) {
      message.error('Você não tem permissão para excluir agendamentos')
      return
    }
    
    try {
      await apiService.deleteAppointment(id)
      message.success('Agendamento excluído com sucesso')
      loadData()
    } catch (error) {
      message.error('Erro ao excluir agendamento')
    }
  }

  const handleViewDetails = (appointment: Appointment) => {
    if (!canAccess('appointments', 'read')) {
      message.error('Você não tem permissão para visualizar detalhes')
      return
    }
    
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      const appointmentData = {
        ...values,
        date: values.date ? values.date[0] : null
      }

      if (editingAppointment) {
        await apiService.updateAppointment(editingAppointment.id, appointmentData)
        message.success('Agendamento atualizado com sucesso')
      } else {
        await apiService.createAppointment(appointmentData)
        message.success('Agendamento criado com sucesso')
      }
      
      setShowModal(false)
      loadData()
    } catch (error) {
      message.error('Erro ao salvar agendamento')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'blue'
      case 'CONFIRMED': return 'green'
      case 'COMPLETED': return 'green'
      case 'CANCELLED': return 'red'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return <ClockCircleOutlined />
      case 'CONFIRMED': return <CheckCircleOutlined />
      case 'COMPLETED': return <CheckCircleOutlined />
      case 'CANCELLED': return <CloseCircleOutlined />
      default: return <ClockCircleOutlined />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Agendado'
      case 'CONFIRMED': return 'Confirmado'
      case 'COMPLETED': return 'Concluído'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
                         appointment.petName?.toLowerCase().includes(searchText.toLowerCase()) ||
                         appointment.serviceName?.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = filterStatus === null || appointment.status === filterStatus
    
    const matchesDate = !filterDate || 
                       (appointment.date && 
                        new Date(appointment.date) >= filterDate[0] && 
                        new Date(appointment.date) <= filterDate[1])
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string, record: Appointment) => (
        <div className="flex items-center space-x-2">
          <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">{record.customerEmail}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Pet',
      dataIndex: 'petName',
      key: 'petName',
      render: (name: string) => (
        <div className="flex items-center space-x-2">
          <Avatar size="small" icon={<HeartOutlined />} className="bg-pink-100 text-pink-600" />
          <span>{name}</span>
        </div>
      )
    },
    {
      title: 'Serviço',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (name: string, record: Appointment) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">
            R$ {record.servicePrice?.toFixed(2)} - {record.serviceDuration}min
          </div>
        </div>
      )
    },
    {
      title: 'Data/Hora',
      dataIndex: 'date',
      key: 'date',
      render: (date: string, record: Appointment) => (
        <div>
          <div className="font-medium">{new Date(date).toLocaleDateString('pt-BR')}</div>
          <div className="text-xs text-gray-500">{record.time}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: Appointment) => (
        <Space>
          <PermissionGate resource="appointments" action="read">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              className="text-green-600 hover:text-green-800"
            />
          </PermissionGate>
          
          <PermissionGate resource="appointments" action="update">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </PermissionGate>
          
          <PermissionGate resource="appointments" action="delete">
            <Popconfirm
              title="Excluir Agendamento"
              description="Tem certeza que deseja excluir este agendamento?"
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
          </PermissionGate>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agendamentos</h1>
          <p className="text-gray-600">Gerencie os agendamentos do petshop</p>
        </div>

        <Card>
          <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Buscar por cliente, pet ou serviço..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-80"
              />
              
              <Select
                placeholder="Filtrar por status"
                value={filterStatus}
                onChange={setFilterStatus}
                className="w-40"
                allowClear
              >
                <Option value="SCHEDULED">Agendado</Option>
                <Option value="CONFIRMED">Confirmado</Option>
                <Option value="COMPLETED">Concluído</Option>
                <Option value="CANCELLED">Cancelado</Option>
              </Select>

              <RangePicker
                placeholder={['Data inicial', 'Data final']}
                value={filterDate}
                onChange={setFilterDate}
                className="w-64"
              />
            </div>

            <Space>
              <PermissionGate resource="appointments" action="calendar">
                <Button
                  icon={<CalendarOutlined />}
                  onClick={() => router.push('/calendar')}
                  className="border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700 px-6 py-3"
                  style={{
                    borderColor: '#16a34a',
                    color: '#16a34a'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4'
                    e.currentTarget.style.borderColor = '#15803d'
                    e.currentTarget.style.color = '#15803d'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.borderColor = '#16a34a'
                    e.currentTarget.style.color = '#16a34a'
                  }}
                  size="large"
                >
                  Ver Calendário
                </Button>
              </PermissionGate>
              
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
              
              <PermissionGate resource="appointments" action="create">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
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
                  Novo Agendamento
                </Button>
              </PermissionGate>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredAppointments}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} agendamentos`
            }}
          />
        </Card>

        {/* Modal de Novo/Editar Agendamento */}
        <PermissionGate resource="appointments" action="create" fallback={<div />}>
          <Modal
            title={
              <div className="flex items-center space-x-2">
                <CalendarOutlined className="text-green-600" />
                <span>{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
              </div>
            }
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="mt-4"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="customerId"
                    label="Cliente"
                    rules={[{ required: true, message: 'Cliente é obrigatório' }]}
                  >
                    <Select placeholder="Selecione o cliente">
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
                    name="petId"
                    label="Pet"
                    rules={[{ required: true, message: 'Pet é obrigatório' }]}
                  >
                    <Select placeholder="Selecione o pet">
                      {pets.map(pet => (
                        <Option key={pet.id} value={pet.id}>
                          {pet.name} - {pet.species}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="serviceId"
                    label="Serviço"
                    rules={[{ required: true, message: 'Serviço é obrigatório' }]}
                  >
                    <Select placeholder="Selecione o serviço">
                      {services.filter(s => s.isActive).map(service => (
                        <Option key={service.id} value={service.id}>
                          {service.name} - R$ {service.price}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Status é obrigatório' }]}
                  >
                    <Select placeholder="Selecione o status">
                      <Option value="SCHEDULED">Agendado</Option>
                      <Option value="CONFIRMED">Confirmado</Option>
                      <Option value="COMPLETED">Concluído</Option>
                      <Option value="CANCELLED">Cancelado</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="date"
                    label="Data"
                    rules={[{ required: true, message: 'Data é obrigatória' }]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="time"
                    label="Hora"
                    rules={[{ required: true, message: 'Hora é obrigatória' }]}
                  >
                    <TimePicker className="w-full" format="HH:mm" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="notes"
                label="Observações"
              >
                <Input.TextArea rows={3} placeholder="Observações sobre o agendamento" />
              </Form.Item>

              <div className="flex justify-end space-x-2 mt-6">
                <Button onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2"
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
                  {editingAppointment ? 'Atualizar' : 'Criar'} Agendamento
                </Button>
              </div>
            </Form>
          </Modal>
        </PermissionGate>

        {/* Modal de Detalhes */}
        <PermissionGate resource="appointments" action="read" fallback={<div />}>
          <Modal
            title={
              <div className="flex items-center space-x-2">
                <CalendarOutlined className="text-green-600" />
                <span>Detalhes do Agendamento</span>
              </div>
            }
            open={showDetailsModal}
            onCancel={() => setShowDetailsModal(false)}
            footer={null}
            width={500}
          >
            {selectedAppointment && (
              <div className="mt-4">
                <div className="text-center mb-6">
                  <Avatar
                    size={80}
                    icon={<CalendarOutlined />}
                    className="bg-green-100 text-green-600 mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAppointment.serviceName}
                  </h3>
                  <p className="text-gray-600">{selectedAppointment.customerName}</p>
                </div>

                <Divider />

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <UserOutlined className="text-2xl text-blue-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">Cliente</div>
                      <div className="text-xs text-gray-600">{selectedAppointment.customerName}</div>
                      <div className="text-xs text-gray-500">{selectedAppointment.customerEmail}</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <HeartOutlined className="text-2xl text-pink-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">Pet</div>
                      <div className="text-xs text-gray-600">{selectedAppointment.petName}</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <MedicineBoxOutlined className="text-2xl text-green-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">Serviço</div>
                      <div className="text-xs text-gray-600">{selectedAppointment.serviceName}</div>
                      <div className="text-xs text-gray-500">R$ {selectedAppointment.servicePrice?.toFixed(2)}</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <CalendarOutlined className="text-2xl text-purple-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">Data/Hora</div>
                      <div className="text-xs text-gray-600">
                        {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-500">{selectedAppointment.time}</div>
                    </div>
                  </Col>
                </Row>

                {selectedAppointment.notes && (
                  <>
                    <Divider />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                      <p className="text-gray-600">{selectedAppointment.notes}</p>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 mt-6">
                  <Button onClick={() => setShowDetailsModal(false)}>
                    Fechar
                  </Button>
                  <PermissionGate resource="appointments" action="update">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setShowDetailsModal(false)
                        handleEdit(selectedAppointment)
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
                      Editar Agendamento
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            )}
          </Modal>
        </PermissionGate>
      </div>
    </div>
  )
}

export default AppointmentsPage
