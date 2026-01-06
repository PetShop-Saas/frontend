import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePermissions } from '../hooks/usePermissions'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Tabs,
  Avatar,
  Switch,
  Checkbox,
  Alert,
  Typography,
  Badge,
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  SafetyOutlined,
  LockOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'

const { Option } = Select
const { TabPane } = Tabs
const { Title, Text } = Typography

// Lista de itens da sidebar disponíveis, organizados por categoria
const groupedSidebarItems = [
  {
    category: 'PRINCIPAL',
    items: [
      { key: '/dashboard', label: 'Dashboard', icon: 'DashboardOutlined' },
    ],
  },
  {
    category: 'OPERAÇÕES',
    items: [
      { key: '/customers', label: 'Clientes', icon: 'UserOutlined' },
      { key: '/pets', label: 'Pets', icon: 'HeartOutlined' },
      { key: '/appointments', label: 'Agendamentos', icon: 'CalendarOutlined' },
      { key: '/calendar', label: 'Calendário', icon: 'CalendarOutlined' },
      { key: '/services', label: 'Serviços', icon: 'ToolOutlined' },
    ],
  },
  {
    category: 'VENDAS',
    items: [
      { key: '/products', label: 'Produtos', icon: 'ShoppingOutlined' },
      { key: '/sales', label: 'Vendas', icon: 'ShoppingCartOutlined' },
    ],
  },
  {
    category: 'ESTOQUE',
    items: [
      { key: '/suppliers', label: 'Fornecedores', icon: 'ShopOutlined' },
      { key: '/purchases', label: 'Compras', icon: 'SwapOutlined' },
    ],
  },
  {
    category: 'MÉDICO',
    items: [
      { key: '/medical-records', label: 'Histórico Médico', icon: 'MedicineBoxOutlined' },
      { key: '/hotel', label: 'Hotel para Pets', icon: 'HomeOutlined' },
    ],
  },
  {
    category: 'FINANCEIRO',
    items: [
      { key: '/cash-flow', label: 'Fluxo de Caixa', icon: 'DollarOutlined' },
      { key: '/financial-reports', label: 'Relatórios Financeiros', icon: 'BarChartOutlined' },
      { key: '/billing', label: 'Minha Assinatura', icon: 'CreditCardOutlined' },
    ],
  },
  {
    category: 'COMUNICAÇÃO',
    items: [
      { key: '/communications', label: 'Comunicação', icon: 'CustomerServiceOutlined' },
      { key: '/notifications', label: 'Notificações', icon: 'BellOutlined' },
      { key: '/tickets', label: 'Suporte', icon: 'InboxOutlined' },
    ],
  },
  {
    category: 'ADMINISTRAÇÃO',
    items: [
      { key: '/access-management', label: 'Gestão de Acesso', icon: 'ControlOutlined' },
      { key: '/personalization', label: 'Personalização', icon: 'BgColorsOutlined' },
      { key: '/audit-logs', label: 'Auditoria', icon: 'BarChartOutlined' },
      { key: '/backup', label: 'Backup & Restore', icon: 'DatabaseOutlined' },
      { key: '/settings', label: 'Configurações', icon: 'SettingOutlined' },
    ],
  },
]

interface User {
  id: string
  name: string
  email: string
  role: string
  planRole?: string
  isActive: boolean
  tenantId: string
  createdAt: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  sidebarItems: string[]
  isActive: boolean
  isPlanRole?: boolean
  level?: number
  createdAt: string
}

interface Tenant {
  id: string
  name: string
  subdomain: string
  plan: string
  enabledModules?: string[]
  contactEmail: string
  isActive: boolean
}

const UnifiedAccessManagement: React.FC = () => {
  const router = useRouter()
  const { refreshPermissions } = usePermissions()
  const [activeTab, setActiveTab] = useState('tenants')
  const [loading, setLoading] = useState(false)
  
  // Estados para Tenants
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [showTenantModal, setShowTenantModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [tenantForm] = Form.useForm()
  const [tenantSearchText, setTenantSearchText] = useState('')

  // Estados para Roles
  const [roles, setRoles] = useState<Role[]>([])
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleForm] = Form.useForm()
  const [roleSearchText, setRoleSearchText] = useState('')
  const [roleFilterType, setRoleFilterType] = useState<string | null>(null)

  // Estados para Usuários
  const [users, setUsers] = useState<User[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm] = Form.useForm()
  const [userSearchText, setUserSearchText] = useState('')
  const [userFilterRole, setUserFilterRole] = useState<string | null>(null)
  const [userFilterStatus, setUserFilterStatus] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [tenantsData, rolesData, usersData] = await Promise.all([
        apiService.getAllTenants(),
        apiService.getRoles(),
        apiService.getUsers(),
      ])
      setTenants(tenantsData as any)
      
      // Parse JSON strings para arrays
      const rolesParsed = (rolesData as any[]).map(role => ({
        ...role,
        permissions: typeof role.permissions === 'string' 
          ? JSON.parse(role.permissions) 
          : role.permissions || [],
        sidebarItems: typeof role.sidebarItems === 'string' 
          ? JSON.parse(role.sidebarItems) 
          : role.sidebarItems || []
      }))
      setRoles(rolesParsed)
      
      setUsers(usersData as any)
    } catch (error) {
      message.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ========== FUNÇÕES DE TENANTS ==========
  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant)
    tenantForm.setFieldsValue({
      name: tenant.name,
      subdomain: tenant.subdomain,
      plan: tenant.plan,
      enabledModules: tenant.enabledModules || [],
      contactEmail: tenant.contactEmail || '',
      isActive: tenant.isActive
    })
    setShowTenantModal(true)
  }

  const handleSubmitTenant = async () => {
    try {
      const values = await tenantForm.validateFields()
      const tenantData = {
        ...values,
        enabledModules: values.enabledModules || []
      }

      if (editingTenant) {
        await apiService.updateTenant(editingTenant.id, tenantData)
        message.success('Tenant atualizado com sucesso')
      }
      
      setShowTenantModal(false)
      loadData()
      await refreshPermissions()
    } catch (error) {
      message.error('Erro ao salvar tenant')
    }
  }

  const applyPlanDefaults = async (plan: string) => {
    // Buscar role do backend para obter sidebarItems reais
    try {
      const rolesData = await apiService.getRoles() as any[]
      const planRole = rolesData.find((r: any) => {
        const roleName = r.name.toUpperCase()
        return (roleName === plan || roleName === `${plan}_USER`) && r.isPlanRole
      })
      if (planRole && planRole.sidebarItems) {
        const sidebarItems = typeof planRole.sidebarItems === 'string' 
          ? JSON.parse(planRole.sidebarItems) 
          : planRole.sidebarItems || []
        tenantForm.setFieldsValue({ enabledModules: sidebarItems })
      } else {
        tenantForm.setFieldsValue({ enabledModules: [] })
      }
    } catch (error) {
      tenantForm.setFieldsValue({ enabledModules: [] })
    }
  }

  // ========== FUNÇÕES DE ROLES ==========
  const handleCreateRole = () => {
    setEditingRole(null)
    roleForm.resetFields()
    setShowRoleModal(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    roleForm.setFieldsValue({
      name: role.name,
      description: role.description,
      sidebarItems: role.sidebarItems || [],
      isActive: role.isActive,
      isPlanRole: role.isPlanRole
    })
    setShowRoleModal(true)
  }

  const handleDeleteRole = async (id: string) => {
    try {
      await apiService.deleteRole(id)
      message.success('Role excluída com sucesso')
      loadData()
    } catch (error) {
      message.error('Erro ao excluir role')
    }
  }

  const handleSubmitRole = async () => {
    try {
      const values = await roleForm.validateFields()
      const roleData = {
        ...values,
        permissions: [], // Permissões são automáticas baseadas na sidebar
        sidebarItems: values.sidebarItems || []
      }

      if (editingRole) {
        await apiService.updateRole(editingRole.id, roleData)
        message.success('Role atualizada com sucesso')
      } else {
        await apiService.createRole(roleData)
        message.success('Role criada com sucesso')
      }
      
      setShowRoleModal(false)
      loadData()
      await refreshPermissions()
    } catch (error) {
      message.error('Erro ao salvar role')
    }
  }

  // ========== FUNÇÕES DE USUÁRIOS ==========
  const handleCreateUser = () => {
    setEditingUser(null)
    userForm.resetFields()
    setShowUserModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    userForm.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      planRole: user.planRole || '',
      isActive: user.isActive
    })
    setShowUserModal(true)
  }

  const handleDeleteUser = async (id: string) => {
    try {
      await apiService.deleteUser(id)
      message.success('Usuário excluído com sucesso')
      loadData()
    } catch (error) {
      message.error('Erro ao excluir usuário')
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await apiService.updateUser(userId, { isActive })
      message.success(`Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`)
      loadData()
    } catch (error) {
      message.error('Erro ao alterar status do usuário')
    }
  }

  const handleSubmitUser = async () => {
    try {
      const values = await userForm.validateFields()
      if (editingUser) {
        await apiService.updateUser(editingUser.id, values)
        message.success('Usuário atualizado com sucesso')
      } else {
        await apiService.createUser(values)
        message.success('Usuário criado com sucesso')
      }
      setShowUserModal(false)
      loadData()
      await refreshPermissions()
    } catch (error) {
      message.error('Erro ao salvar usuário')
    }
  }

  // ========== FILTROS ==========
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(tenantSearchText.toLowerCase()) ||
                         tenant.subdomain.toLowerCase().includes(tenantSearchText.toLowerCase())
    return matchesSearch
  })

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(roleSearchText.toLowerCase()) ||
                         role.description.toLowerCase().includes(roleSearchText.toLowerCase())
    const matchesType = roleFilterType === null || 
                       (roleFilterType === 'plan' && role.isPlanRole) ||
                       (roleFilterType === 'functional' && !role.isPlanRole)
    return matchesSearch && matchesType
  })

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchText.toLowerCase())
    const matchesRole = userFilterRole === null || user.role === userFilterRole || user.planRole === userFilterRole
    const matchesStatus = userFilterStatus === null || 
                         (userFilterStatus === 'active' && user.isActive) ||
                         (userFilterStatus === 'inactive' && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  // ========== COLUNAS DAS TABELAS ==========
  const tenantColumns = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_: any, record: Tenant) => (
        <Space>
          <Avatar icon={<BankOutlined />} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-gray-500 text-sm">{record.subdomain}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Plano',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => {
        const colors: any = {
          FREE: 'default',
          BASIC: 'blue',
          PRO: 'green',
          ENTERPRISE: 'purple',
          ADMIN: 'red'
        }
        return <Tag color={colors[plan] || 'default'}>{plan}</Tag>
      },
    },
    {
      title: 'Módulos',
      key: 'modules',
      render: (_: any, record: Tenant) => (
        <Tag color="green">{record.enabledModules?.length || 0} módulos</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Ativo' : 'Inativo'}</Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Tenant) => (
        <Space size="middle">
          <Tooltip title="Editar tenant">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTenant(record)}
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const roleColumns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <Space>
          <Avatar icon={record.isPlanRole ? <CrownOutlined /> : <SafetyOutlined />} />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-gray-500 text-sm">{record.description}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tipo',
      key: 'type',
      render: (_: any, record: Role) => (
        <Tag color={record.isPlanRole ? 'purple' : 'blue'}>
          {record.isPlanRole ? 'Plano' : 'Funcional'}
        </Tag>
      ),
    },
    {
      title: 'Acesso',
      key: 'access',
      render: (_: any, record: Role) => (
        <Badge count={record.sidebarItems?.length || 0} showZero color="blue">
          <Tag color="blue">Páginas</Tag>
        </Badge>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Ativo' : 'Inativo'}</Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space>
          <Tooltip title="Editar role">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
          <Popconfirm
            title="Excluir Role"
            description="Tem certeza que deseja excluir esta role?"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Excluir role">
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

  const userColumns = [
    {
      title: 'Usuário',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-gray-500 text-sm">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color="blue">{role}</Tag>
      ),
    },
    {
      title: 'Plano',
      dataIndex: 'planRole',
      key: 'planRole',
      render: (planRole: string) => (
        planRole ? (
          <Tag color="purple">{planRole}</Tag>
        ) : (
          <Tag color="default">Sem plano</Tag>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: User) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={isActive}
            onChange={(checked) => toggleUserStatus(record.id, checked)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'Ativo' : 'Inativo'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Editar usuário">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
          <Popconfirm
            title="Excluir Usuário"
            description="Tem certeza que deseja excluir este usuário?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Excluir usuário">
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
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Gestão Unificada de Acesso</Title>
        <Text type="secondary">
          Gerencie tenants (empresas), roles (funções/permissões) e usuários em um único lugar
        </Text>
      </div>

      <Alert
        message="Sistema Simplificado"
        description="O acesso é controlado apenas pelos itens da sidebar. Se um item não está na sidebar do role do usuário, ele não pode acessar essa página."
        type="info"
        showIcon
        className="mb-6"
      />

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large">
          <TabPane tab={<span><BankOutlined /> Tenants</span>} key="tenants">
            <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
              <Input
                placeholder="Buscar tenants..."
                prefix={<SearchOutlined />}
                value={tenantSearchText}
                onChange={(e) => setTenantSearchText(e.target.value)}
                className="w-64"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
              >
                Atualizar
              </Button>
            </div>
            <Table
              columns={tenantColumns}
              dataSource={filteredTenants}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><SafetyOutlined /> Roles</span>} key="roles">
            <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Input
                  placeholder="Buscar roles..."
                  prefix={<SearchOutlined />}
                  value={roleSearchText}
                  onChange={(e) => setRoleSearchText(e.target.value)}
                  className="w-64"
                />
                <Select
                  placeholder="Filtrar por tipo"
                  value={roleFilterType}
                  onChange={setRoleFilterType}
                  className="w-40"
                  allowClear
                >
                  <Option value="plan">Planos</Option>
                  <Option value="functional">Funcionais</Option>
                </Select>
              </div>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadData}
                >
                  Atualizar
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateRole}
                >
                  Nova Role
                </Button>
              </Space>
            </div>
            <Table
              columns={roleColumns}
              dataSource={filteredRoles}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><UserOutlined /> Usuários</span>} key="users">
            <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Input
                  placeholder="Buscar usuários..."
                  prefix={<SearchOutlined />}
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  className="w-64"
                />
                <Select
                  placeholder="Filtrar por role"
                  value={userFilterRole}
                  onChange={setUserFilterRole}
                  className="w-40"
                  allowClear
                >
                  {roles.map(role => (
                    <Option key={role.name} value={role.name}>{role.name}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="Filtrar por status"
                  value={userFilterStatus}
                  onChange={setUserFilterStatus}
                  className="w-40"
                  allowClear
                >
                  <Option value="active">Ativo</Option>
                  <Option value="inactive">Inativo</Option>
                </Select>
              </div>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadData}
                >
                  Atualizar
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateUser}
                >
                  Novo Usuário
                </Button>
              </Space>
            </div>
            <Table
              columns={userColumns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal de Tenant */}
      <Modal
        title={editingTenant ? 'Configurar Tenant' : 'Novo Tenant'}
        open={showTenantModal}
        onCancel={() => setShowTenantModal(false)}
        onOk={handleSubmitTenant}
        width={900}
      >
        <Form form={tenantForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subdomain" label="Subdomínio" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="plan" label="Plano" rules={[{ required: true }]}>
            <Select onChange={applyPlanDefaults}>
              <Option value="FREE">FREE - Recursos Básicos</Option>
              <Option value="BASIC">BASIC - Vendas e Produtos</Option>
              <Option value="PRO">PRO - Estoque, Médico e Financeiro</Option>
              <Option value="ENTERPRISE">ENTERPRISE - Todos os Recursos</Option>
            </Select>
          </Form.Item>

          <Form.Item name="enabledModules" label="Módulos Habilitados">
            <Checkbox.Group className="w-full">
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded p-2 w-full">
                {groupedSidebarItems.map((group) => (
                  <div key={group.category} className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 border-b border-gray-300 pb-1">
                      {group.category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 ml-4">
                      {group.items.map((item) => (
                        <div key={item.key} className="flex items-center space-x-2">
                          <Checkbox value={item.key}>
                            <span className="text-sm">{item.label}</span>
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactEmail" label="Email de Contato">
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Ativo" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal de Role */}
      <Modal
        title={editingRole ? 'Editar Role' : 'Nova Role'}
        open={showRoleModal}
        onCancel={() => setShowRoleModal(false)}
        onOk={handleSubmitRole}
        width={900}
      >
        <Form form={roleForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Nome da Role" rules={[{ required: true }]}>
                <Input placeholder="Ex: MANAGER" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="description" label="Descrição" rules={[{ required: true }]}>
                <Input placeholder="Ex: Gerente do sistema" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isPlanRole" label="Tipo de Role" valuePropName="checked">
            <Switch 
              checkedChildren="Plano" 
              unCheckedChildren="Funcional"
            />
          </Form.Item>

          <Alert
            message="Sistema Simplificado"
            description="As permissões são automaticamente baseadas nos itens da sidebar selecionados."
            type="info"
            showIcon
            className="mb-4"
          />

          <Form.Item name="sidebarItems" label="Itens da Sidebar" rules={[{ required: true }]}>
            <Checkbox.Group className="w-full">
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded p-2 w-full">
                {groupedSidebarItems.map((group) => (
                  <div key={group.category} className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 border-b border-gray-300 pb-1">
                      {group.category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 ml-4">
                      {group.items.map((item) => (
                        <div key={item.key} className="flex items-center space-x-2">
                          <Checkbox value={item.key}>
                            <span className="text-sm">{item.label}</span>
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="isActive" label="Ativo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Usuário */}
      <Modal
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        open={showUserModal}
        onCancel={() => setShowUserModal(false)}
        onOk={handleSubmitUser}
        width={600}
      >
        <Form form={userForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item name="password" label="Senha" rules={[{ required: true }]}>
              <Input.Password placeholder="Senha" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Função" rules={[{ required: true }]}>
                <Select placeholder="Selecione a função">
                  {roles.filter(r => !r.isPlanRole).map(role => (
                    <Option key={role.name} value={role.name}>{role.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="planRole" label="Plano">
                <Select placeholder="Selecione o plano" allowClear>
                  {roles.filter(r => r.isPlanRole).map(role => (
                    <Option key={role.name} value={role.name}>{role.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" label="Ativo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UnifiedAccessManagement
