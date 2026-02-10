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
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Empty,
  Row,
  Col,
  Select,
  Switch,
  Divider,
  Tabs,
  Badge,
  Tooltip,
  List,
  Typography,
  Alert,
  Progress,
  Timeline,
  Drawer
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SettingOutlined,
  FilterOutlined,
  MoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  TeamOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ClearOutlined,
  ReadOutlined,
  NotificationOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  TAG_CLASS,
  getTagOption,
  NOTIFICATION_TYPE_OPTIONS,
  NOTIFICATION_CATEGORY_OPTIONS,
  NOTIFICATION_PRIORITY_OPTIONS
} from '../constants/tagConfig'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs
const { Text, Title } = Typography

function stripEmoji(str: string): string {
  if (typeof str !== 'string') return str
  return str
    .replace(/[\u2600-\u26FF\u2700-\u27BF\u2300-\u23FF\u2B50\u231A\u231B\u25AA-\u25FE\u2934\u2935\u2194-\u2199\u2139\u23E9-\u23F3]/g, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  isRead: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: 'SYSTEM' | 'APPOINTMENT' | 'SALE' | 'STOCK' | 'CUSTOMER' | 'MEDICAL' | 'COMMUNICATION'
  actionUrl?: string
  actionText?: string
  createdAt: string
  updatedAt: string
}

interface NotificationStats {
  total: number
  unread: number
  read: number
  byType: {
    INFO: number
    WARNING: number
    ERROR: number
    SUCCESS: number
  }
  byCategory: {
    SYSTEM: number
    APPOINTMENT: number
    SALE: number
    STOCK: number
    CUSTOMER: number
    MEDICAL: number
    COMMUNICATION: number
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()
  const [form] = Form.useForm()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [notificationsData, unreadCount] = await Promise.all([
        apiService.getNotifications(),
        apiService.getUnreadCount()
      ])
      
      // Verificar se é um array direto ou objeto com propriedade
      const notificationsArray = Array.isArray(notificationsData) ? notificationsData : (notificationsData as any)?.notifications || []
      setNotifications(notificationsArray)
      
      // Calcular estatísticas
      const calculatedStats = calculateStats(notificationsArray)
      setStats(calculatedStats)
    } catch (error) {
      message.error('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (notifications: Notification[]): NotificationStats => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.isRead).length
    const read = notifications.filter(n => n.isRead).length

    const byType = {
      INFO: notifications.filter(n => n.type === 'INFO').length,
      WARNING: notifications.filter(n => n.type === 'WARNING').length,
      ERROR: notifications.filter(n => n.type === 'ERROR').length,
      SUCCESS: notifications.filter(n => n.type === 'SUCCESS').length
    }

    const byCategory = {
      SYSTEM: notifications.filter(n => n.category === 'SYSTEM').length,
      APPOINTMENT: notifications.filter(n => n.category === 'APPOINTMENT').length,
      SALE: notifications.filter(n => n.category === 'SALE').length,
      STOCK: notifications.filter(n => n.category === 'STOCK').length,
      CUSTOMER: notifications.filter(n => n.category === 'CUSTOMER').length,
      MEDICAL: notifications.filter(n => n.category === 'MEDICAL').length,
      COMMUNICATION: notifications.filter(n => n.category === 'COMMUNICATION').length
    }

    return { total, unread, read, byType, byCategory }
  }

  const handleCreate = async (values: any) => {
    try {
      // Simular criação de notificação
      message.success('Notificação criada com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao criar notificação')
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id)
      message.success('Notificação marcada como lida!')
      loadData()
    } catch (error) {
      message.error('Erro ao marcar notificação como lida')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead()
      message.success('Todas as notificações foram marcadas como lidas!')
      loadData()
    } catch (error) {
      message.error('Erro ao marcar todas como lidas')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteNotification(id)
      message.success('Notificação removida com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao remover notificação')
    }
  }

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowDetailsDrawer(true)
    
    // Marcar como lida automaticamente
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedNotification(null)
    form.resetFields()
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !filterType || notification.type === filterType
    const matchesCategory = !filterCategory || notification.category === filterCategory
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'read' && notification.isRead) ||
                         (filterStatus === 'unread' && !notification.isRead)
    const matchesPriority = !filterPriority || notification.priority === filterPriority
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesPriority
  })

  const typeOptions = NOTIFICATION_TYPE_OPTIONS
  const categoryOptions = NOTIFICATION_CATEGORY_OPTIONS
  const priorityOptions = NOTIFICATION_PRIORITY_OPTIONS
  const getTypeConfig = (type: string) => getTagOption(NOTIFICATION_TYPE_OPTIONS, type)
  const getCategoryConfig = (category: string) => getTagOption(NOTIFICATION_CATEGORY_OPTIONS, category)
  const getPriorityConfig = (priority: string) => getTagOption(NOTIFICATION_PRIORITY_OPTIONS, priority)

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string, record: Notification) => (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${record.isRead ? 'bg-gray-300' : 'bg-green-500'}`} />
          {getTypeConfig(type).icon}
          <Tag color={getTypeConfig(type).color} className={TAG_CLASS}>{getTypeConfig(type).label}</Tag>
        </div>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Notification) => (
        <div className="flex items-center space-x-2">
          <Text strong={!record.isRead} className={record.isRead ? 'text-gray-500' : 'text-gray-900'}>
            {stripEmoji(title)}
          </Text>
          {!record.isRead && <Badge status="processing" />}
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const config = getCategoryConfig(category)
        return (
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Prioridade',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const config = getPriorityConfig(priority)
        return (
          <Tag color={config.color} className={TAG_CLASS}>
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
          <Tooltip title="Ver detalhes">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
          {!record.isRead && (
            <Tooltip title="Marcar como lida">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleMarkAsRead(record.id)}
                className="text-green-600 hover:text-green-800"
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Tem certeza que deseja remover esta notificação?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Remover">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-red-600 hover:text-red-800"
              />
            </Tooltip>
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
            <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
            <p className="text-gray-600">Gerencie suas notificações do sistema</p>
          </div>
          <div className="flex space-x-2">
            <Button
              icon={<ClearOutlined />}
              onClick={handleMarkAllAsRead}
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
              Marcar Todas como Lidas
            </Button>
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
              Nova Notificação
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <BellOutlined className="text-3xl text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <NotificationOutlined className="text-3xl text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                  <div className="text-sm text-gray-600">Não Lidas</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <ReadOutlined className="text-3xl text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{stats.read}</div>
                  <div className="text-sm text-gray-600">Lidas</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <ExclamationCircleOutlined className="text-3xl text-red-600 mb-2" />
                  <div className="text-2xl font-bold text-red-600">{stats.byType.ERROR}</div>
                  <div className="text-sm text-gray-600">Erros</div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tabs */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Todas" key="all">
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Search
                      placeholder="Buscar notificações..."
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

              {/* Notifications Table */}
              <Table
                columns={columns}
                dataSource={filteredNotifications}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} notificações`,
                }}
                locale={{
                  emptyText: (
                    <div className="text-center py-12">
                      <BellOutlined className="text-6xl text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhuma notificação encontrada</h3>
                      <p className="mt-2 text-sm text-gray-500 mb-6">
                        {searchTerm || filterType ? 'Tente ajustar seus filtros.' : 'Você está em dia com suas notificações!'}
              </p>
            </div>
                  )
                }}
              />
            </TabPane>

            <TabPane tab="Não Lidas" key="unread">
              <div className="space-y-4">
                {notifications.filter(n => !n.isRead).map((notification) => (
                  <Card key={notification.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <Avatar 
                          size={40} 
                          icon={getTypeConfig(notification.type).icon}
                          className="bg-green-100 text-green-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Text strong className="text-gray-900">{stripEmoji(notification.title)}</Text>
                            <Tag color={getTypeConfig(notification.type).color} className={TAG_CLASS}>
                              {getTypeConfig(notification.type).label}
                            </Tag>
                            <Tag color={getCategoryConfig(notification.category).color} className={TAG_CLASS}>
                              {getCategoryConfig(notification.category).label}
                            </Tag>
                          </div>
                          <Text className="text-gray-600 mb-2 block">{stripEmoji(notification.message)}</Text>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                            <Tag color={getPriorityConfig(notification.priority).color} className={TAG_CLASS}>
                              {getPriorityConfig(notification.priority).label}
                            </Tag>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetails(notification)}
                          className="text-green-600 hover:text-green-800"
                        />
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-green-600 hover:text-green-800"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                {notifications.filter(n => !n.isRead).length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircleOutlined className="text-6xl text-green-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mt-4">Todas as notificações foram lidas!</h3>
                    <p className="mt-2 text-sm text-gray-500">Você está em dia com suas notificações.</p>
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane tab="Por Categoria" key="category">
              <div className="space-y-6">
                {categoryOptions.map(category => {
                  const categoryNotifications = notifications.filter(n => n.category === category.value)
                  return (
                    <Card key={category.value} title={
                        <div className="flex items-center space-x-2">
                        {category.icon}
                        <span>{category.label}</span>
                        <Badge count={categoryNotifications.length} />
                      </div>
                    }>
                      <div className="space-y-3">
                        {categoryNotifications.slice(0, 5).map((notification) => (
                          <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-green-500'}`} />
                              <div>
                                <Text strong={!notification.isRead} className={notification.isRead ? 'text-gray-500' : 'text-gray-900'}>
                            {notification.title}
                                </Text>
                                <div className="text-sm text-gray-500">{dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetails(notification)}
                                className="text-green-600 hover:text-green-800"
                                size="small"
                              />
                          {!notification.isRead && (
                                <Button
                                  icon={<CheckCircleOutlined />}
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-green-600 hover:text-green-800"
                                  size="small"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                        {categoryNotifications.length > 5 && (
                          <div className="text-center">
                            <Button type="link" className="text-green-600">
                              Ver mais {categoryNotifications.length - 5} notificações
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </TabPane>

            <TabPane tab="Timeline" key="timeline">
              <Timeline>
                {notifications.slice(0, 20).map((notification) => (
                  <Timeline.Item
                    key={notification.id}
                    color={getTypeConfig(notification.type).color}
                    dot={getTypeConfig(notification.type).icon}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Text strong={!notification.isRead} className={notification.isRead ? 'text-gray-500' : 'text-gray-900'}>
                          {notification.title}
                        </Text>
                        <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetails(notification)}
                          className="text-green-600 hover:text-green-800"
                          size="small"
                        />
                        {!notification.isRead && (
                          <Button
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-green-600 hover:text-green-800"
                            size="small"
                          />
                        )}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        </Card>

        {/* Modal de Nova Notificação */}
        <Modal
          title={
                    <div className="flex items-center space-x-2">
              <BellOutlined className="text-green-600" />
              <span>Nova Notificação</span>
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
            onFinish={handleCreate}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Tipo"
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
                  name="category"
                  label="Categoria"
                  rules={[{ required: true, message: 'Por favor, selecione a categoria!' }]}
                >
                  <Select placeholder="Selecione a categoria">
                    {categoryOptions.map(category => (
                      <Option key={category.value} value={category.value}>
                        {category.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="priority"
              label="Prioridade"
              rules={[{ required: true, message: 'Por favor, selecione a prioridade!' }]}
            >
              <Select placeholder="Selecione a prioridade">
                {priorityOptions.map(priority => (
                  <Option key={priority.value} value={priority.value}>
                    {priority.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="Título"
              rules={[{ required: true, message: 'Por favor, insira o título!' }]}
            >
              <Input placeholder="Título da notificação" />
            </Form.Item>

            <Form.Item
              name="message"
              label="Mensagem"
              rules={[{ required: true, message: 'Por favor, insira a mensagem!' }]}
            >
              <TextArea 
                placeholder="Mensagem da notificação"
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
                Criar Notificação
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Drawer de Detalhes */}
        <Drawer
          title={
            <div className="flex items-center space-x-2">
              <BellOutlined className="text-green-600" />
              <span>Detalhes da Notificação</span>
            </div>
          }
          placement="right"
          onClose={() => setShowDetailsDrawer(false)}
          open={showDetailsDrawer}
          width={500}
        >
          {selectedNotification && (
            <div className="space-y-6">
              <div className="text-center">
                <Avatar 
                  size={80} 
                  icon={getTypeConfig(selectedNotification.type).icon}
                  className="bg-green-100 text-green-600 mb-4"
                />
                <Title level={3} className="text-gray-900">
                  {stripEmoji(selectedNotification.title)}
                </Title>
                <div className="flex justify-center flex-wrap gap-2 mb-4">
                  <Tag color={getTypeConfig(selectedNotification.type).color} className={TAG_CLASS}>
                    {getTypeConfig(selectedNotification.type).label}
                  </Tag>
                  <Tag color={getCategoryConfig(selectedNotification.category).color} className={TAG_CLASS}>
                    {getCategoryConfig(selectedNotification.category).label}
                  </Tag>
                  <Tag color={getPriorityConfig(selectedNotification.priority).color} className={TAG_CLASS}>
                    {getPriorityConfig(selectedNotification.priority).label}
                  </Tag>
                </div>
              </div>

              <Divider />

              <div>
                <Title level={5} className="text-gray-900 mb-2">Mensagem</Title>
                <Text className="text-gray-600">{stripEmoji(selectedNotification.message)}</Text>
              </div>

              <div>
                <Title level={5} className="text-gray-900 mb-2">Informações</Title>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Tag color={selectedNotification.isRead ? 'green' : 'orange'} className={TAG_CLASS}>
                      {selectedNotification.isRead ? 'Lida' : 'Não Lida'}
                    </Tag>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criada em:</span>
                    <span className="text-gray-900">{dayjs(selectedNotification.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Atualizada em:</span>
                    <span className="text-gray-900">{dayjs(selectedNotification.updatedAt).format('DD/MM/YYYY HH:mm')}</span>
                  </div>
                </div>
              </div>

              {selectedNotification.actionUrl && (
                <div>
                  <Title level={5} className="text-gray-900 mb-2">Ação</Title>
                  <Button
                    type="primary"
                    href={selectedNotification.actionUrl}
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
                    {selectedNotification.actionText || 'Ver Detalhes'}
                  </Button>
            </div>
          )}

              <Divider />

              <div className="flex justify-end space-x-2">
                {!selectedNotification.isRead && (
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id)
                      setShowDetailsDrawer(false)
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
                    Marcar como Lida
                  </Button>
                )}
                <Button onClick={() => setShowDetailsDrawer(false)}>
                  Fechar
                </Button>
              </div>
        </div>
        )}
        </Drawer>
      </div>
    </div>
  )
}