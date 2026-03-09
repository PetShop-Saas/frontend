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
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Empty,
  Row,
  Col,
  Select,
  DatePicker,
  TimePicker,
  Switch,
  Divider,
  Tabs,
  Badge,
  Tooltip,
  Checkbox,
  Radio,
  InputNumber,
  Progress
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  MessageOutlined,
  SendOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GiftOutlined,
  BellOutlined,
  SettingOutlined,
  FileTextOutlined,
  TeamOutlined,
  FilterOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HeartOutlined,
  ShoppingOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker
const { TabPane } = Tabs

interface Communication {
  id: string
  type: 'APPOINTMENT_REMINDER' | 'BIRTHDAY_MESSAGE' | 'PROMOTIONAL' | 'CUSTOM'
  recipient: string
  message: string
  status: 'SENT' | 'FAILED' | 'PENDING' | 'SCHEDULED'
  scheduledAt?: string
  customerId?: string
  appointmentId?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  petName?: string
  serviceName?: string
  createdAt: string
  updatedAt: string
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  pets?: Array<{
    id: string
    name: string
    breed: string
  }>
}

interface Appointment {
  id: string
  date: string
  time: string
  petName: string
  serviceName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: string
}

interface Template {
  id: string
  name: string
  type: string
  subject: string
  content: string
  variables: string[]
  isActive: boolean
}

export default function Communications() {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterCustomer, setFilterCustomer] = useState<string | null>(null)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([])
  const [messageText, setMessageText] = useState('')
  const [subject, setSubject] = useState('')
  const [scheduledDate, setScheduledDate] = useState<dayjs.Dayjs | null>(null)
  const [scheduledTime, setScheduledTime] = useState<dayjs.Dayjs | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('history')
  const router = useRouter()
  const [form] = Form.useForm()
  const [templateForm] = Form.useForm()
  const [scheduleForm] = Form.useForm()

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
      const [communicationsData, customersData, appointmentsData] = await Promise.all([
        apiService.getCommunicationHistory(),
        apiService.getCustomers(),
        apiService.getAppointments()
      ])
      
      setCommunications(extractArrayFromResponse(communicationsData, ['data', 'communications']))
      setCustomers(extractArrayFromResponse(customersData, ['data', 'customers']))
      setAppointments(extractArrayFromResponse(appointmentsData, ['data', 'appointments']))
      
      // Carregar estatísticas
      const startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD')
      const endDate = dayjs().format('YYYY-MM-DD')
      const statsData = await apiService.getCommunicationStats(startDate, endDate)
      setStats(statsData)
      
      // Carregar templates (simulado por enquanto)
      setTemplates([
        {
          id: '1',
          name: 'Lembrete de Agendamento',
          type: 'APPOINTMENT_REMINDER',
          subject: 'Lembrete: Agendamento do seu pet',
          content: 'Olá {customerName}! Lembramos que seu pet {petName} tem agendamento para {serviceName} em {date} às {time}.',
          variables: ['customerName', 'petName', 'serviceName', 'date', 'time'],
          isActive: true
        },
        {
          id: '2',
          name: 'Mensagem de Aniversário',
          type: 'BIRTHDAY_MESSAGE',
          subject: 'Feliz Aniversário!',
          content: 'Parabéns {customerName}! Hoje é o aniversário do seu pet {petName}. Que tal agendar um banho especial?',
          variables: ['customerName', 'petName'],
          isActive: true
        },
        {
          id: '3',
          name: 'Promoção de Banho',
          type: 'PROMOTIONAL',
          subject: 'Promoção Especial - Banho e Tosa',
          content: 'Olá {customerName}! Temos uma promoção especial de 20% de desconto em banho e tosa para o {petName}. Válido até o final do mês!',
          variables: ['customerName', 'petName'],
          isActive: true
        }
      ])
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSendPromotional = async (values: any) => {
    try {
      await apiService.sendPromotionalMessage(selectedCustomers, messageText)
      message.success('Mensagens promocionais enviadas com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao enviar mensagens promocionais')
    }
  }

  const handleSendBirthdayMessage = async (customerId: string) => {
    try {
      await apiService.sendBirthdayMessage(customerId)
      message.success('Mensagem de aniversário enviada!')
      loadData()
    } catch (error) {
      message.error('Erro ao enviar mensagem de aniversário')
    }
  }

  const handleSendAppointmentReminder = async (appointmentId: string) => {
    try {
      await apiService.sendAppointmentReminder(appointmentId)
      message.success('Lembrete de agendamento enviado!')
      loadData()
    } catch (error) {
      message.error('Erro ao enviar lembrete')
    }
  }

  const handleScheduleMessage = async (values: any) => {
    try {
      // Simular agendamento de mensagem
      message.success('Mensagem agendada com sucesso!')
      setShowScheduleModal(false)
      scheduleForm.resetFields()
      loadData()
    } catch (error) {
      message.error('Erro ao agendar mensagem')
    }
  }

  const handleViewDetails = (communication: Communication) => {
    setSelectedCommunication(communication)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setShowTemplateModal(false)
    setShowScheduleModal(false)
    setShowDetailsModal(false)
    setIsEditing(false)
    setSelectedCommunication(null)
    setSelectedTemplate(null)
    form.resetFields()
    templateForm.resetFields()
    scheduleForm.resetFields()
    setSelectedCustomers([])
    setSelectedAppointments([])
    setMessageText('')
    setSubject('')
    setScheduledDate(null)
    setScheduledTime(null)
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setMessageText(template.content)
    setSubject(template.subject)
  }

  const handleCustomerSegmentChange = (value: string) => {
    switch (value) {
      case 'all':
        setSelectedCustomers(customers.map(c => c.id))
        break
      case 'with_email':
        setSelectedCustomers(customers.filter(c => c.email).map(c => c.id))
        break
      case 'with_phone':
        setSelectedCustomers(customers.filter(c => c.phone).map(c => c.id))
        break
      case 'with_pets':
        setSelectedCustomers(customers.filter(c => c.pets && c.pets.length > 0).map(c => c.id))
        break
      default:
        setSelectedCustomers([])
    }
  }

  const filteredCommunications = communications.filter(communication => {
    const matchesSearch = communication.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         communication.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         communication.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !filterType || communication.type === filterType
    const matchesStatus = !filterStatus || communication.status === filterStatus
    const matchesCustomer = !filterCustomer || communication.customerId === filterCustomer
    
    return matchesSearch && matchesType && matchesStatus && matchesCustomer
  })

  const typeOptions = [
    { value: 'APPOINTMENT_REMINDER', label: 'Lembrete de Agendamento', color: 'blue', icon: <BellOutlined /> },
    { value: 'BIRTHDAY_MESSAGE', label: 'Mensagem de Aniversário', color: 'green', icon: <GiftOutlined /> },
    { value: 'PROMOTIONAL', label: 'Promocional', color: 'purple', icon: <ShoppingOutlined /> },
    { value: 'CUSTOM', label: 'Personalizada', color: 'orange', icon: <FileTextOutlined /> }
  ]

  const statusOptions = [
    { value: 'SENT', label: 'Enviada', color: 'green', icon: <CheckCircleOutlined /> },
    { value: 'FAILED', label: 'Falhou', color: 'red', icon: <CloseCircleOutlined /> },
    { value: 'PENDING', label: 'Pendente', color: 'orange', icon: <ClockCircleOutlined /> },
    { value: 'SCHEDULED', label: 'Agendada', color: 'blue', icon: <CalendarOutlined /> }
  ]

  const getTypeConfig = (type: string) => {
    return typeOptions.find(opt => opt.value === type) || typeOptions[0]
  }

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0]
  }

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config = getTypeConfig(type)
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Destinatário',
      dataIndex: 'recipient',
      key: 'recipient',
      render: (recipient: string, record: Communication) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<UserOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{recipient}</div>
            {record.customerName && (
              <div className="text-sm text-gray-500">{record.customerName}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Mensagem',
      dataIndex: 'message',
      key: 'message',
      render: (message: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate">{message}</p>
        </div>
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
          <Popconfirm
            title="Tem certeza que deseja remover esta comunicação?"
            onConfirm={() => {
              message.info('Funcionalidade de remoção será implementada')
            }}
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
            <h1 className="text-2xl font-bold text-gray-900">Comunicação</h1>
            <p className="text-gray-600">Gerencie a comunicação com seus clientes</p>
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
              icon={<CalendarOutlined />}
              onClick={() => setShowScheduleModal(true)}
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
              Agendar
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
              Nova Campanha
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <MessageOutlined className="text-3xl text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
                  <div className="text-sm text-gray-600">Total Enviadas</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <CheckCircleOutlined className="text-3xl text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{stats.sent || 0}</div>
                  <div className="text-sm text-gray-600">Enviadas</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <CloseCircleOutlined className="text-3xl text-red-600 mb-2" />
                  <div className="text-2xl font-bold text-red-600">{stats.failed || 0}</div>
                  <div className="text-sm text-gray-600">Falharam</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <ExclamationCircleOutlined className="text-3xl text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tabs */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Histórico" key="history">
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Search
                      placeholder="Buscar comunicações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      prefix={<SearchOutlined className="text-gray-400" />}
                      size="large"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type={filterType === null ? 'primary' : 'default'}
                      onClick={() => setFilterType(null)}
                      className={filterType === null ? 'bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2' : 'px-6 py-2'}
                      style={filterType === null ? {
                        backgroundColor: '#16a34a',
                        borderColor: '#16a34a'
                      } : {
                        backgroundColor: '#ffffff',
                        borderColor: '#d1d5db',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => {
                        if (filterType === null) {
                          e.currentTarget.style.backgroundColor = '#15803d'
                          e.currentTarget.style.borderColor = '#15803d'
                        } else {
                          e.currentTarget.style.backgroundColor = '#f9fafb'
                          e.currentTarget.style.borderColor = '#9ca3af'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (filterType === null) {
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
                    {typeOptions.map(option => (
                      <Button
                        key={option.value}
                        type={filterType === option.value ? 'primary' : 'default'}
                        onClick={() => setFilterType(filterType === option.value ? null : option.value)}
                        className={filterType === option.value ? 'bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2' : 'px-6 py-2'}
                        style={filterType === option.value ? {
                          backgroundColor: '#16a34a',
                          borderColor: '#16a34a'
                        } : {
                          backgroundColor: '#ffffff',
                          borderColor: '#d1d5db',
                          color: '#374151'
                        }}
                        onMouseEnter={(e) => {
                          if (filterType === option.value) {
                            e.currentTarget.style.backgroundColor = '#15803d'
                            e.currentTarget.style.borderColor = '#15803d'
                          } else {
                            e.currentTarget.style.backgroundColor = '#f9fafb'
                            e.currentTarget.style.borderColor = '#9ca3af'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (filterType === option.value) {
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
              </div>

              {/* Communications Table */}
              <Table
                columns={columns}
                dataSource={filteredCommunications}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} comunicações`,
                }}
                locale={{
                  emptyText: (
                    <div className="text-center py-12">
                      <MessageOutlined className="text-6xl text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhuma comunicação encontrada</h3>
                      <p className="mt-2 text-sm text-gray-500 mb-6">
                        {searchTerm || filterType ? 'Tente ajustar seus filtros.' : 'Comece enviando mensagens para seus clientes.'}
                      </p>
                      {!searchTerm && !filterType && (
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
                          Criar Primeira Comunicação
                        </Button>
                      )}
                    </div>
                  )
                }}
              />
            </TabPane>

            <TabPane tab="Clientes" key="customers">
              <div className="space-y-4">
                {customers.map((customer) => (
                  <Card key={customer.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar 
                          size={50} 
                          icon={<UserOutlined />}
                          className="bg-green-100 text-green-600"
                        />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            {customer.email && (
                              <div className="flex items-center space-x-2">
                                <MailOutlined className="text-gray-400" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center space-x-2">
                                <PhoneOutlined className="text-gray-400" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.pets && customer.pets.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <HeartOutlined className="text-gray-400" />
                                <span>{customer.pets.length} pet(s)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          icon={<GiftOutlined />}
                          onClick={() => handleSendBirthdayMessage(customer.id)}
                          className="border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700 px-6 py-2"
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
                        >
                          Aniversário
                        </Button>
                        <Button
                          icon={<MessageOutlined />}
                          onClick={() => {
                            setSelectedCustomers([customer.id])
                            setShowModal(true)
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
                          Mensagem
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabPane>

            <TabPane tab="Agendamentos" key="appointments">
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar 
                          size={50} 
                          icon={<CalendarOutlined />}
                          className="bg-green-100 text-green-600"
                        />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.petName} - {appointment.serviceName}
                          </h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center space-x-2">
                              <CalendarOutlined className="text-gray-400" />
                              <span>{dayjs(appointment.date).format('DD/MM/YYYY')} às {appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <UserOutlined className="text-gray-400" />
                              <span>{appointment.customerName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MailOutlined className="text-gray-400" />
                              <span>{appointment.customerEmail}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Tag color={appointment.status === 'CONFIRMED' ? 'green' : 'orange'}>
                          {appointment.status}
                        </Tag>
                        <Button
                          icon={<BellOutlined />}
                          onClick={() => handleSendAppointmentReminder(appointment.id)}
                          className="border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700 px-6 py-2"
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
                        >
                          Lembrete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabPane>

            <TabPane tab="Templates" key="templates">
              <div className="flex justify-end mb-4">
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setShowTemplateModal(true)}
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
                  Novo Template
                </Button>
              </div>
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                          <Tag color={template.isActive ? 'green' : 'red'}>
                            {template.isActive ? 'Ativo' : 'Inativo'}
                          </Tag>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Assunto:</strong> {template.subject}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Conteúdo:</strong> {template.content}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Variáveis:</span>
                          {template.variables.map((variable, index) => (
                            <Tag key={index}>{variable}</Tag>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => {
                            setSelectedTemplate(template)
                            setShowTemplateModal(true)
                          }}
                          className="text-green-600 hover:text-green-800"
                        />
                        <Button
                          icon={<SendOutlined />}
                          onClick={() => handleTemplateSelect(template)}
                          className="text-green-600 hover:text-green-800"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabPane>
          </Tabs>
        </Card>

        {/* Modal de Nova Campanha */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <MessageOutlined className="text-green-600" />
              <span>Nova Campanha</span>
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
            onFinish={handleSendPromotional}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Tipo de Campanha"
                  rules={[{ required: true, message: 'Por favor, selecione o tipo!' }]}
                >
                  <Select placeholder="Selecione o tipo">
                    {typeOptions.map(type => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="segment"
                  label="Segmentação"
                >
                  <Select 
                    placeholder="Selecionar segmento"
                    onChange={handleCustomerSegmentChange}
                  >
                    <Option value="all">Todos os clientes</Option>
                    <Option value="with_email">Clientes com email</Option>
                    <Option value="with_phone">Clientes com telefone</Option>
                    <Option value="with_pets">Clientes com pets</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="customers"
              label="Clientes Selecionados"
            >
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {customers.map((customer) => (
                  <label key={customer.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCustomers([...selectedCustomers, customer.id])
                        } else {
                          setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id))
                        }
                      }}
                    />
                    <span className="text-sm text-gray-900">{customer.name}</span>
                    {customer.email && (
                      <span className="text-xs text-gray-500">({customer.email})</span>
                    )}
                  </label>
                ))}
              </div>
            </Form.Item>

            <Form.Item
              name="subject"
              label="Assunto"
              rules={[{ required: true, message: 'Por favor, insira o assunto!' }]}
            >
              <Input 
                placeholder="Assunto da mensagem"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="message"
              label="Mensagem"
              rules={[{ required: true, message: 'Por favor, insira a mensagem!' }]}
            >
              <TextArea 
                placeholder="Digite sua mensagem..."
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
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
                Enviar ({selectedCustomers.length} clientes)
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal de Agendamento */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-green-600" />
              <span>Agendar Mensagem</span>
            </div>
          }
          open={showScheduleModal}
          onCancel={handleModalClose}
          footer={null}
          width={600}
        >
          <Form
            form={scheduleForm}
            layout="vertical"
            onFinish={handleScheduleMessage}
            className="mt-4"
          >
            <Form.Item
              name="customers"
              label="Clientes"
              rules={[{ required: true, message: 'Por favor, selecione os clientes!' }]}
            >
              <Select 
                mode="multiple"
                placeholder="Selecionar clientes"
                onChange={setSelectedCustomers}
              >
                {customers.map(customer => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Data"
                  rules={[{ required: true, message: 'Por favor, selecione a data!' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    value={scheduledDate}
                    onChange={setScheduledDate}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="time"
                  label="Hora"
                  rules={[{ required: true, message: 'Por favor, selecione a hora!' }]}
                >
                  <TimePicker 
                    style={{ width: '100%' }}
                    format="HH:mm"
                    value={scheduledTime}
                    onChange={setScheduledTime}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="message"
              label="Mensagem"
              rules={[{ required: true, message: 'Por favor, insira a mensagem!' }]}
            >
              <TextArea 
                placeholder="Digite sua mensagem..."
                rows={4}
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
                Agendar Mensagem
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <MessageOutlined className="text-green-600" />
              <span>Detalhes da Comunicação</span>
            </div>
          }
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={600}
        >
          {selectedCommunication && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<MessageOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      {getTypeConfig(selectedCommunication.type).label}
                    </h3>
                    <p className="text-gray-600">
                      {dayjs(selectedCommunication.createdAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Destinatário:</span>
                          <span className="font-medium">{selectedCommunication.recipient}</span>
                        </div>
                        {selectedCommunication.customerName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cliente:</span>
                            <span className="font-medium">{selectedCommunication.customerName}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Tag color={getStatusConfig(selectedCommunication.status).color}>
                            {getStatusConfig(selectedCommunication.status).label}
                          </Tag>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Mensagem</h4>
                      <p className="text-sm text-gray-600">{selectedCommunication.message}</p>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </Button>
              </div>
          </div>
        )}
        </Modal>
      </div>
    </div>
  )
}