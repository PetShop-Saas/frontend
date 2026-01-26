import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
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
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface Appointment {
  id: string
  date: string
  status: string
  notes?: string
  customerId: string
  petId: string
  serviceId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  petName: string
  petSpecies: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  createdAt: string
  updatedAt: string
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface Pet {
  id: string
  name: string
  species: string
  customerId: string
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()
  const [detailsForm] = Form.useForm()
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
      const [appointmentsData, customersData, petsData, servicesData] = await Promise.all([
        apiService.getAppointments(),
        apiService.getCustomers(),
        apiService.getPets(),
        apiService.getServices()
      ])
      
      // Estrutura padronizada: { data, total, page, limit }
      const processedAppointments = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData as any)?.data || []
      
      // Estrutura padronizada: { data, total, page, limit }
      const processedCustomers = Array.isArray(customersData) ? customersData : (customersData as any)?.data || []
      
      // Estrutura padronizada: { data, total, page, limit }
      const processedPets = Array.isArray(petsData) ? petsData : (petsData as any)?.data || []
      
      // Estrutura padronizada: { data, total, page, limit }
      const processedServices = Array.isArray(servicesData) ? servicesData : (servicesData as any)?.data || []
      
      // Mapear agendamentos para incluir informações relacionadas
      const appointmentsWithInfo = processedAppointments.map((appointment: any) => ({
        ...appointment,
        customerName: appointment.customer?.name || 'Cliente não encontrado',
        customerEmail: appointment.customer?.email,
        customerPhone: appointment.customer?.phone,
        petName: appointment.pet?.name || 'Pet não encontrado',
        petSpecies: appointment.pet?.species || '',
        serviceName: appointment.service?.name || 'Serviço não encontrado',
        servicePrice: appointment.service?.price || 0,
        serviceDuration: appointment.service?.duration || 0,
      }))
      
      setAppointments(appointmentsWithInfo)
      setCustomers(processedCustomers)
      setPets(processedPets)
      setServices(processedServices)
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Converter data e hora para formato ISO
      const dateTime = dayjs(values.date).format('YYYY-MM-DD') + 'T' + dayjs(values.time).format('HH:mm:ss')
      
      const appointmentData = {
        ...values,
        date: dateTime,
        status: values.status || 'SCHEDULED'
      }

      if (isEditing && selectedAppointment) {
        await apiService.updateAppointment(selectedAppointment.id, appointmentData)
        message.success('Agendamento atualizado com sucesso!')
      } else {
        await apiService.createAppointment(appointmentData)
        message.success('Agendamento criado com sucesso!')
      }
      
      setShowModal(false)
      setIsEditing(false)
      setSelectedAppointment(null)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error('Erro ao salvar agendamento')
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsEditing(true)
    
    const appointmentDate = dayjs(appointment.date)
    form.setFieldsValue({
      ...appointment,
      date: appointmentDate,
      time: appointmentDate,
      customerId: appointment.customerId,
      petId: appointment.petId,
      serviceId: appointment.serviceId
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteAppointment(id)
      message.success('Agendamento excluído com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao excluir agendamento')
    }
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    detailsForm.setFieldsValue(appointment)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedAppointment(null)
    form.resetFields()
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiService.updateAppointment(id, { status: newStatus })
      message.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar status')
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || appointment.status === filterStatus
    const matchesCustomer = !filterCustomer || appointment.customerId === filterCustomer
    
    return matchesSearch && matchesStatus && matchesCustomer
  })

  const statusOptions = [
    { value: 'SCHEDULED', label: 'Agendado', color: 'blue', icon: <ClockCircleOutlined /> },
    { value: 'CONFIRMED', label: 'Confirmado', color: 'green', icon: <CheckCircleOutlined /> },
    { value: 'IN_PROGRESS', label: 'Em Andamento', color: 'orange', icon: <ClockCircleOutlined /> },
    { value: 'COMPLETED', label: 'Concluído', color: 'purple', icon: <CheckCircleOutlined /> },
    { value: 'CANCELLED', label: 'Cancelado', color: 'red', icon: <CloseCircleOutlined /> },
    { value: 'NO_SHOW', label: 'Não Compareceu', color: 'gray', icon: <CloseCircleOutlined /> }
  ]

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0]
  }

  const getPetsByCustomer = (customerId: string) => {
    return pets.filter(pet => pet.customerId === customerId)
  }

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Data/Hora',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">
            {dayjs(record.date).format('DD/MM/YYYY')}
          </div>
          <div className="text-sm text-gray-500">
            {dayjs(record.date).format('HH:mm')}
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Cliente',
      key: 'customer',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={32} 
            icon={<UserOutlined />}
            className="bg-blue-100 text-blue-600"
          />
          <div>
            <div className="font-medium text-gray-900">{record.customerName}</div>
            {record.customerPhone && (
              <div className="text-sm text-gray-500">{record.customerPhone}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Pet',
      key: 'pet',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Avatar 
            size={24} 
            icon={<HeartOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{record.petName}</div>
            <div className="text-sm text-gray-500">{record.petSpecies}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Serviço',
      key: 'service',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Avatar 
            size={24} 
            icon={<MedicineBoxOutlined />}
            className="bg-purple-100 text-purple-600"
          />
          <div>
            <div className="font-medium text-gray-900">{record.serviceName}</div>
            <div className="text-sm text-gray-500">
              R$ {record.servicePrice.toFixed(2)} • {record.serviceDuration}min
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = getStatusConfig(status)
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        )
      },
      filters: statusOptions.map(opt => ({ text: opt.label, value: opt.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
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
            title="Tem certeza que deseja excluir este agendamento?"
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600">Gerencie os agendamentos de serviços</p>
          </div>
          <div className="flex space-x-2">
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
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por cliente, pet ou serviço..."
                prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                />
            </div>
            <div className="flex gap-2">
              <Select
                placeholder="Status"
                value={filterStatus}
                onChange={setFilterStatus}
                allowClear
                size="large"
                style={{ minWidth: 120 }}
              >
                {statusOptions.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.icon} {status.label}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Cliente"
                value={filterCustomer}
                onChange={setFilterCustomer}
                allowClear
                size="large"
                style={{ minWidth: 150 }}
              >
                {customers.map(customer => (
                  <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                ))}
              </Select>
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
            </div>
          </div>
        </Card>

        {/* Appointments Table */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Agendamentos ({filteredAppointments.length})
            </h3>
          </div>
          </div>
          <Table
            columns={columns}
            dataSource={filteredAppointments}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} agendamentos`,
              position: ['bottomRight']
            }}
            scroll={{ x: 1200 }}
            className="custom-table"
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <CalendarOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhum agendamento encontrado</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-6">
                    {searchTerm || filterStatus || filterCustomer ? 'Tente ajustar seus filtros.' : 'Comece criando o primeiro agendamento.'}
                  </p>
                  {!searchTerm && !filterStatus && !filterCustomer && (
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
                      Criar Primeiro Agendamento
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </Card>

        {/* Modal de Novo/Editar Agendamento */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-green-600" />
              <span>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
            </div>
          }
          open={showModal}
          onCancel={handleModalClose}
          footer={null}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="date"
                label="Data"
                rules={[{ required: true, message: 'Data é obrigatória' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
              <Form.Item
                name="time"
                label="Horário"
                rules={[{ required: true, message: 'Horário é obrigatório' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  size="large"
                  format="HH:mm"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="customerId"
                label="Cliente"
                rules={[{ required: true, message: 'Cliente é obrigatório' }]}
              >
                <Select 
                  placeholder="Selecione o cliente"
                  size="large"
                  onChange={(value) => {
                    form.setFieldsValue({ petId: undefined })
                  }}
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} {customer.email && `(${customer.email})`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="petId"
                label="Pet"
                rules={[{ required: true, message: 'Pet é obrigatório' }]}
              >
                <Select 
                  placeholder="Selecione o pet"
                  size="large"
                  disabled={!form.getFieldValue('customerId')}
                >
                  {getPetsByCustomer(form.getFieldValue('customerId')).map(pet => (
                    <Option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="serviceId"
                label="Serviço"
                rules={[{ required: true, message: 'Serviço é obrigatório' }]}
              >
                <Select placeholder="Selecione o serviço" size="large">
                  {services.map(service => (
                    <Option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="status"
                label="Status"
              >
                <Select placeholder="Selecione o status" size="large">
                  {statusOptions.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="notes"
              label="Observações"
            >
              <TextArea
                rows={3}
                placeholder="Informações adicionais sobre o agendamento..."
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
                {isEditing ? 'Atualizar' : 'Criar'} Agendamento
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes */}
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
          width={600}
        >
          {selectedAppointment && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<CalendarOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      {dayjs(selectedAppointment.date).format('DD/MM/YYYY')}
                    </h3>
                    <p className="text-gray-600">
                      {dayjs(selectedAppointment.date).format('HH:mm')}
                    </p>
                    </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <div className="mt-1">
                        <Tag color={getStatusConfig(selectedAppointment.status).color} icon={getStatusConfig(selectedAppointment.status).icon}>
                          {getStatusConfig(selectedAppointment.status).label}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <p className="text-gray-900">{selectedAppointment.customerName}</p>
                  {selectedAppointment.customerPhone && (
                    <p className="text-sm text-gray-500">{selectedAppointment.customerPhone}</p>
                  )}
                </div>

                <div>
                  <span className="font-medium text-gray-700">Pet:</span>
                  <p className="text-gray-900">{selectedAppointment.petName} ({selectedAppointment.petSpecies})</p>
                  </div>

                <div>
                  <span className="font-medium text-gray-700">Serviço:</span>
                  <p className="text-gray-900">{selectedAppointment.serviceName}</p>
                  <p className="text-sm text-gray-500">
                    R$ {selectedAppointment.servicePrice.toFixed(2)} • {selectedAppointment.serviceDuration} minutos
                  </p>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <span className="font-medium text-gray-700">Observações:</span>
                    <p className="mt-2 text-gray-900">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              <Divider />

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </Button>
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
              </div>
          </div>
        )}
        </Modal>
    </div>
  )
}