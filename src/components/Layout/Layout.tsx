import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, Space, Typography } from 'antd'
import { usePageTransition } from '../../hooks/usePageTransition'
import { usePermissions } from '../../hooks/usePermissions'
// Removido useSecureAuth - usando localStorage diretamente
import { 
  DashboardOutlined, 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  SettingOutlined, 
  ShoppingOutlined, 
  DollarOutlined, 
  BarChartOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  ShopOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  MessageOutlined,
  HeartOutlined, // Pet/Animal icon
  BugOutlined, // Alternative pet icon
  ThunderboltOutlined, // Alternative pet icon
  UpOutlined,
  DownOutlined,
  ControlOutlined,
  BgColorsOutlined,
  AppstoreOutlined
} from '@ant-design/icons'

interface LayoutProps {
  children: React.ReactNode
}

interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  avatar?: string
  tenant?: {
    id: string
    name: string
    subdomain: string
    isActive: boolean
  }
}

const { Header, Sider, Content } = AntLayout
const { Title } = Typography

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [tenantLogo, setTenantLogo] = useState<string>('')
  const router = useRouter()
  const { isLoading, isTransitioning } = usePageTransition()
  const { canAccessSidebarItem } = usePermissions()

  // Carregar dados do usuário do localStorage
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Por enquanto, usar dados básicos do localStorage se existirem
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const userObj = JSON.parse(userData)
        setUser(userObj)
      } catch (error) {
      }
    }
  }, []) // Removido router da dependência para evitar loops

  useEffect(() => {
    // Carregar logo do tenant quando user estiver disponível
    if (user?.tenant) {
      // Por enquanto, usar um logo padrão ou buscar do backend
      setTenantLogo('')
    }
    
    // Escutar evento customizado de logo atualizada
    const handleLogoUpdate = (event: CustomEvent) => {
      setTenantLogo(event.detail)
    }

    window.addEventListener('logoUpdated', handleLogoUpdate as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate as EventListener)
    }
  }, [user])


  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // Definir todos os itens possíveis do menu organizados por categoria
  const allMenuItems: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    category?: string;
  }> = [
    // PRINCIPAL
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', category: 'core' },
    { key: '/customers', icon: <TeamOutlined />, label: 'Clientes', category: 'core' },
    { key: '/pets', icon: <HeartOutlined />, label: 'Pets', category: 'core' },
    { key: '/appointments', icon: <CalendarOutlined />, label: 'Agendamentos', category: 'core' },
    { key: '/calendar', icon: <CalendarOutlined />, label: 'Calendário', category: 'core' },
    { key: '/services', icon: <SettingOutlined />, label: 'Serviços', category: 'core' },
    
    // VENDAS
    { key: '/products', icon: <ShoppingOutlined />, label: 'Produtos', category: 'sales' },
    { key: '/sales', icon: <ShoppingCartOutlined />, label: 'Vendas', category: 'sales' },
    
    // ESTOQUE
    { key: '/suppliers', icon: <ShopOutlined />, label: 'Fornecedores', category: 'inventory' },
    { key: '/purchases', icon: <ShoppingOutlined />, label: 'Compras', category: 'inventory' },
    
    // MÉDICO
    { key: '/medical-records', icon: <MedicineBoxOutlined />, label: 'Histórico Médico', category: 'medical' },
    
    // HOTEL
    { key: '/hotel', icon: <HeartOutlined />, label: 'Hotel para Pets', category: 'hotel' },
    
    // FINANCEIRO
    { key: '/cash-flow', icon: <DollarOutlined />, label: 'Fluxo de Caixa', category: 'financial' },
    { key: '/financial-reports', icon: <BarChartOutlined />, label: 'Relatórios Financeiros', category: 'financial' },
    { key: '/billing', icon: <DollarOutlined />, label: 'Minha Assinatura', category: 'financial' },
    
    // COMUNICAÇÃO
    { key: '/communications', icon: <MessageOutlined />, label: 'Comunicação', category: 'communication' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notificações', category: 'communication' },
    { key: '/tickets', icon: <MessageOutlined />, label: 'Suporte', category: 'communication' },
    
    // OPERAÇÕES
    { key: '/operations', icon: <ThunderboltOutlined />, label: 'Operações', category: 'operations' },
    
    // ADMIN
    { key: '/admin-dashboard', icon: <DashboardOutlined />, label: 'Admin Dashboard', category: 'admin' },
    { key: '/admin-billing', icon: <DollarOutlined />, label: 'Gestão de Billing', category: 'admin' },
    { key: '/unified-access-management', icon: <ControlOutlined />, label: 'Gestão de Acesso', category: 'admin' },
    { key: '/personalization', icon: <BgColorsOutlined />, label: 'Personalização', category: 'admin' },
    { key: '/audit-logs', icon: <FileTextOutlined />, label: 'Auditoria', category: 'admin' },
    { key: '/backup', icon: <DatabaseOutlined />, label: 'Backup', category: 'admin' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Configurações', category: 'admin' },
  ]

  // Construir menu agrupado por categorias
  // Função para verificar se o usuário tem acesso a um item do sidebar
  const hasSidebarItem = (itemKey: string): boolean => {
    if (!user) return false
    
    // Verificar se o item está na lista de sidebar items permitidos
    const hasSidebarAccess = canAccessSidebarItem(itemKey)
    if (!hasSidebarAccess) return false
    
    // Verificar se o usuário tem a permissão necessária para acessar a rota
    const requiredPermission = getRequiredPermission(itemKey)
    if (!requiredPermission) return true // Se não precisa de permissão específica, permitir
    
    return true // Temporariamente sempre permitir acesso
  }

  // Função para obter a permissão necessária para uma rota
  const getRequiredPermission = (pathname: string): string | null => {
    const ROUTE_PERMISSIONS: Record<string, string> = {
      '/dashboard': 'dashboard.read',
      '/customers': 'customers.read',
      '/pets': 'pets.read',
      '/appointments': 'appointments.read',
      '/calendar': 'appointments.calendar',
      '/services': 'services.read',
      '/products': 'products.read',
      '/sales': 'sales.read',
      '/suppliers': 'suppliers.read',
      '/purchases': 'purchases.read',
      '/stock-movements': 'stock-movements.read',
      '/medical-records': 'medical-records.read',
      '/hotel': 'hotel.read',
      '/cash-flow': 'cash-flow.read',
      '/financial-reports': 'financial-reports.read',
      '/billing': 'billing.read',
      '/communications': 'communications.read',
      '/notifications': 'notifications.read',
      '/tickets': 'tickets.read',
      '/operations': 'operations.read',
      '/admin-dashboard': 'admin.dashboard',
      '/admin-billing': 'admin.billing',
      '/unified-access-management': 'users.read',
      '/personalization': 'admin.personalization',
      '/audit-logs': 'audit.read',
      '/backup': 'backup.read',
    }
    
    return ROUTE_PERMISSIONS[pathname] || null
  }

  const buildGroupedMenu = () => {
    const grouped: any = {}
    
    allMenuItems.forEach(item => {
      if (hasSidebarItem(item.key)) {
        const category = item.category || 'other'
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(item)
      }
    })
    
    const menuStructure: any[] = []
    
    // PRINCIPAL
    if (grouped.core && grouped.core.length > 0) {
      grouped.core.forEach((item: any) => {
        menuStructure.push({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        })
      })
    }
    
    // VENDAS
    if (grouped.sales && grouped.sales.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        type: 'group',
        label: 'VENDAS',
        children: grouped.sales.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        }))
      })
    }
    
    // ESTOQUE
    if (grouped.inventory && grouped.inventory.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        type: 'group',
        label: 'ESTOQUE',
        children: grouped.inventory.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        }))
      })
    }
    
    // MÉDICO
    if (grouped.medical && grouped.medical.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        type: 'group',
        label: 'VETERINÁRIO',
        children: grouped.medical.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        }))
      })
    }
    
    // HOTEL
    if (grouped.hotel && grouped.hotel.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        type: 'group',
        label: 'HOTEL',
        children: grouped.hotel.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        }))
      })
    }
    
    // FINANCEIRO
    if (grouped.financial && grouped.financial.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        type: 'group',
        label: 'FINANCEIRO',
        children: grouped.financial.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        }))
      })
    }
    
    // COMUNICAÇÃO
    if (grouped.communication && grouped.communication.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        type: 'group',
        label: 'COMUNICAÇÃO',
        children: grouped.communication.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        }))
      })
    }
    
    // OPERAÇÕES
    if (grouped.operations && grouped.operations.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        type: 'group',
        label: 'OPERAÇÕES',
        children: grouped.operations.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        }))
      })
    }
    
    // ADMIN
    // Verificar se é admin pelo role OU planRole
    const isAdmin = user?.role === 'ADMIN' || user?.planRole === 'ADMIN'
    if (grouped.admin && grouped.admin.length > 0 && isAdmin) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        type: 'group',
        label: 'ADMINISTRAÇÃO',
        children: grouped.admin.map((item: any) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.key)
        }))
      })
    }
    
    return menuStructure
  }
  
  const menuItems = buildGroupedMenu()

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout,
    },
  ]

  return (
    <AntLayout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="custom-sidebar"
        style={{
          background: '#064e3b',
          height: '100vh',
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
        width={256}
      >
        {/* Banner do tenant */}
        <div style={{ 
          width: '100%',
          height: collapsed ? 60 : 80,
          margin: collapsed ? '8px 0' : '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          position: 'relative'
        }}>
          {tenantLogo ? (
            <img 
              src={tenantLogo} 
              alt={`Banner ${user?.tenant?.name || 'Petshop'}`}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: collapsed ? 4 : 8
              }} 
              onError={(e) => {
                setTenantLogo('')
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: collapsed ? 4 : 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: collapsed ? 12 : 16,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              padding: '8px'
            }}>
              {collapsed ? 'PS' : (user?.tenant?.name || 'Petshop').toUpperCase()}
            </div>
          )}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ 
            border: 'none',
            background: '#064e3b'
          }}
          className="custom-sidebar-menu"
          expandIcon={({ isOpen }) => (
            <span style={{ 
              fontSize: '10px', 
              opacity: 0.6,
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              {isOpen ? '▲' : '▼'}
            </span>
          )}
        />
      </Sider>
      
      <AntLayout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin-left 0.2s' }}>
        <Header 
          className={collapsed ? 'collapsed' : ''}
          style={{
            padding: '0 24px',
            background: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderBottom: '1px solid #e5e7eb',
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? 80 : 256,
            zIndex: 1000,
            transition: 'left 0.2s',
            height: '64px',
            lineHeight: '64px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 64, height: 64 }}
            />
            
            {/* Nome do tenant no header */}
            {user?.tenant?.name && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                padding: '4px 12px',
                background: 'rgba(4, 120, 87, 0.1)',
                borderRadius: 6,
                border: '1px solid rgba(4, 120, 87, 0.2)'
              }}>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#047857' 
                }}>
                  {user.tenant.name}
                </span>
              </div>
            )}
            
            <Title level={4} style={{ margin: 0 }}>
              {getPageTitle(router.pathname)}
            </Title>
          </div>
          
          <Space size="middle">
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>
            
            <Dropdown
              menu={{ 
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'profile') {
                    router.push('/profile')
                  }
                }
              }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer', alignItems: 'center' }}>
                <Avatar 
                  style={{ backgroundColor: '#047857' }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  lineHeight: '1.2'
                }}>
                  <span style={{ 
                    fontSize: 14, 
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '2px'
                  }}>
                    {user?.name || 'Usuário'}
                  </span>
                  <span style={{ 
                    fontSize: 12, 
                    color: '#6b7280',
                    lineHeight: '1'
                  }}>
                    {user?.email || 'user@email.com'}
                  </span>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '24px 16px', 
          padding: 0, 
          background: 'transparent', 
          borderRadius: 8,
          minHeight: 'calc(100vh - 112px)',
          marginTop: '88px',
          overflowY: 'auto'
        }}>
          <div 
            className={`page-transition ${isTransitioning ? 'page-enter' : ''}`}
            style={{
              minHeight: '100%',
              position: 'relative',
              background: '#fff',
              borderRadius: 8,
              padding: 24
            }}
          >
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

function getPageTitle(pathname: string): string {
  const titles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/admin-dashboard': 'Admin Dashboard',
    '/admin-billing': 'Gestão de Billing',
    '/customers': 'Clientes',
    '/pets': 'Pets',
    '/appointments': 'Agendamentos',
    '/services': 'Serviços',
    '/products': 'Produtos',
    '/sales': 'Vendas',
    '/suppliers': 'Fornecedores',
    '/purchases': 'Compras',
    '/stock-movements': 'Movimentações de Estoque',
    '/stock-alerts': 'Alertas de Estoque',
    '/medical-records': 'Histórico Médico',
    '/hotel': 'Hotel para Pets',
    '/cash-flow': 'Fluxo de Caixa',
    '/financial-reports': 'Relatórios Financeiros',
    '/billing': 'Minha Assinatura',
    '/communications': 'Comunicação',
    '/notifications': 'Notificações',
    '/tickets': 'Suporte',
    '/user-role-management': 'Usuários e Permissões',
    '/audit-logs': 'Auditoria',
    '/backup': 'Backup & Restore',
    '/settings': 'Configurações',
    '/profile': 'Perfil',
  }
  return titles[pathname] || 'PetShop SaaS'
}
