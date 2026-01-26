import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import { Modal, Form, Input, message, Select, Button, Tag, Avatar, Space, Popconfirm, DatePicker, TimePicker, Card, Divider, Row, Col } from 'antd'

import { apiService } from '../services/api'
import { 
  PlusOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

// Configurar moment para português
moment.locale('pt-br')
const localizer = momentLocalizer(moment)

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

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
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

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const selectedDate = dayjs(start)
    form.setFieldsValue({
      date: selectedDate,
      time: selectedDate
    })
    setShowModal(true)
  }

  const handleSelectEvent = (event: any) => {
    const appointment = appointments.find(apt => apt.id === event.id)
    if (appointment) {
      handleViewDetails(appointment)
    }
  }

  const getPetsByCustomer = (customerId: string) => {
    return pets.filter(pet => pet.customerId === customerId)
  }

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

  // Converter agendamentos para formato do calendário
  const events = appointments.map(appointment => {
    const statusConfig = getStatusConfig(appointment.status)
    return {
      id: appointment.id,
      title: `${appointment.serviceName} - ${appointment.customerName}`,
      start: new Date(appointment.date),
      end: new Date(new Date(appointment.date).getTime() + appointment.serviceDuration * 60000),
      resource: {
        appointment,
        statusConfig
      }
    }
  })

  // Estilizar eventos baseado no status
  const eventStyleGetter = (event: any) => {
    const { statusConfig } = event.resource
    const backgroundColor: { [key: string]: string } = {
      blue: '#1890ff',
      green: '#52c41a',
      orange: '#fa8c16',
      purple: '#722ed1',
      red: '#ff4d4f',
      gray: '#8c8c8c'
    }
    const color = backgroundColor[statusConfig.color] || '#1890ff'

    return {
      style: {
        backgroundColor: color,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  if (loading) {
    return (
      <div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/appointments')}
              className="text-gray-600 hover:text-gray-800"
            >
              Voltar para Lista
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendário de Agendamentos</h1>
              <p className="text-gray-600">Visualize seus agendamentos em formato de calendário</p>
            </div>
          </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 border-green-600"
              size="large"
            >
              Novo Agendamento
            </Button>
        </div>

        {/* Legenda de Status */}
        <Card>
          <div className="flex flex-wrap gap-4">
            <span className="text-sm font-medium text-gray-700">Legenda:</span>
            {statusOptions.map(status => (
              <div key={status.value} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ 
                    backgroundColor: {
                      blue: '#1890ff',
                      green: '#52c41a',
                      orange: '#fa8c16',
                      purple: '#722ed1',
                      red: '#ff4d4f',
                      gray: '#8c8c8c'
                    }[status.color]
                  }}
                />
                <span className="text-sm text-gray-600">{status.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Calendário */}
        <Card className="calendar-container">
          <div style={{ height: '600px', backgroundColor: '#ffffff' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              defaultView={Views.MONTH}
              messages={{
                next: 'Próximo',
                previous: 'Anterior',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Nenhum agendamento neste período',
                showMore: total => `+${total} mais`
              }}
              style={{ 
                height: '100%',
                backgroundColor: '#ffffff',
                color: '#374151'
              }}
            />
          </div>
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
                className="bg-green-600 hover:bg-green-700 border-green-600"
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
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Editar Agendamento
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
