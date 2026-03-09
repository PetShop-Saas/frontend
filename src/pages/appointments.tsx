import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Modal, Form, Input, message, Select, Button, Table, Tag, Avatar, Space, Popconfirm, Card, Divider, Row, Col } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { apiService, extractArrayFromResponse } from '../services/api'
import { AppointmentForm } from '../components/appointments/AppointmentForm'
import { AppointmentFilters } from '../components/appointments/AppointmentFilters'
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
import { APPOINTMENT_STATUS_OPTIONS, getTagOption, TAG_CLASS } from '../constants/tagConfig'

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
      
      const processedAppointments = extractArrayFromResponse<Record<string, unknown>>(appointmentsData, ['data', 'appointments'])
      const processedCustomers = extractArrayFromResponse<Customer>(customersData, ['data', 'customers'])
      const processedPets = extractArrayFromResponse<Pet>(petsData, ['data', 'pets'])
      const processedServices = extractArrayFromResponse<Service>(servicesData, ['data', 'services'])
      
      const appointmentsWithInfo = processedAppointments.map((appointment) => {
        const a = appointment as { customer?: { name?: string; email?: string; phone?: string }; pet?: { name?: string; species?: string }; service?: { name?: string; price?: number; duration?: number } }
        return {
        ...(appointment as object),
        customerName: a.customer?.name || 'Cliente não encontrado',
        customerEmail: a.customer?.email,
        customerPhone: a.customer?.phone,
        petName: a.pet?.name || 'Pet não encontrado',
        petSpecies: a.pet?.species || '',
        serviceName: a.service?.name || 'Serviço não encontrado',
        servicePrice: a.service?.price || 0,
        serviceDuration: a.service?.duration || 0,
      }
      })
      
      setAppointments(appointmentsWithInfo as Appointment[])
      setCustomers(processedCustomers)
      setPets(processedPets)
      setServices(processedServices)
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: { date?: string; customerId: string; petId: string; serviceId: string; status?: string; notes?: string }) => {
    try {
      const appointmentData = {
        date: values.date || '',
        customerId: values.customerId,
        petId: values.petId,
        serviceId: values.serviceId,
        status: values.status || 'SCHEDULED',
        notes: values.notes,
      }

      if (isEditing && selectedAppointment) {
        await apiService.updateAppointment(selectedAppointment.id, appointmentData)
        message.success('Agendamento atualizado com sucesso!')
      } else {
        await apiService.createAppointment(appointmentData)
        message.success('Agendamento criado com sucesso!')
      }
      
      handleModalClose()
      loadData()
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Erro ao salvar agendamento')
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsEditing(true)
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
    const term = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      (appointment.customerName?.toLowerCase().includes(term)) ||
      (appointment.petName?.toLowerCase().includes(term)) ||
      (appointment.serviceName?.toLowerCase().includes(term))
    const matchesStatus = !filterStatus || appointment.status === filterStatus
    const matchesCustomer = !filterCustomer || appointment.customerId === filterCustomer
    return matchesSearch && matchesStatus && matchesCustomer
  })

  const statusOptions = APPOINTMENT_STATUS_OPTIONS
  const getStatusConfig = (status: string) => getTagOption(APPOINTMENT_STATUS_OPTIONS, status)

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Data/Hora',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.date ? dayjs(record.date).format('DD/MM/YYYY') : '-'}
          </div>
          <div className="text-sm text-gray-500">
            {record.date ? dayjs(record.date).format('HH:mm') : '-'}
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.date || 0).unix() - dayjs(b.date || 0).unix(),
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
              R$ {(record.servicePrice ?? 0).toFixed(2)} • {record.serviceDuration ?? 0}min
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
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
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

        {/* Modal de Novo/Editar Agendamento - usa componente AppointmentForm */}
        <AppointmentForm
          visible={showModal}
          onCancel={handleModalClose}
          onSubmit={handleSubmit}
          customers={customers}
          pets={pets}
          services={services}
          initialValues={isEditing && selectedAppointment ? {
            dateTime: dayjs(selectedAppointment.date),
            customerId: selectedAppointment.customerId,
            petId: selectedAppointment.petId,
            serviceId: selectedAppointment.serviceId,
            status: selectedAppointment.status,
            notes: selectedAppointment.notes,
          } : undefined}
          isEditing={isEditing}
        />

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
                      {selectedAppointment.date ? dayjs(selectedAppointment.date).format('DD/MM/YYYY') : '-'}
                    </h3>
                    <p className="text-gray-600">
                      {selectedAppointment.date ? dayjs(selectedAppointment.date).format('HH:mm') : '-'}
                    </p>
                    </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <div className="mt-1">
                        <Tag color={getStatusConfig(selectedAppointment.status).color} icon={getStatusConfig(selectedAppointment.status).icon} className={TAG_CLASS}>
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