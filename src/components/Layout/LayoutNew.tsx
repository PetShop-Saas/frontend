import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge } from 'antd'
import { 
  DashboardOutlined, UserOutlined, TeamOutlined, CalendarOutlined, 
  SettingOutlined, ShoppingOutlined, DollarOutlined, BarChartOutlined,
  BellOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  ShoppingCartOutlined, WarningOutlined, ShopOutlined, FileTextOutlined,
  DatabaseOutlined, MedicineBoxOutlined, AlertOutlined, MessageOutlined,
  HeartOutlined, CreditCardOutlined, HomeOutlined, CustomerServiceOutlined,
  SwapOutlined, SafetyOutlined, ToolOutlined, ControlOutlined,
  BgColorsOutlined, AppstoreOutlined, InboxOutlined
} from '@ant-design/icons'
import { theme } from '../../config/theme'
import type { MenuProps } from 'antd'
import { usePermissions } from '../../hooks/usePermissions'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

const ICON_MAP: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  TeamOutlined: <TeamOutlined />,
  HeartOutlined: <HeartOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  ToolOutlined: <ToolOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  ShopOutlined: <ShopOutlined />,
  SwapOutlined: <SwapOutlined />,
  AlertOutlined: <AlertOutlined />,
  MedicineBoxOutlined: <MedicineBoxOutlined />,
  HomeOutlined: <HomeOutlined />,
  DollarOutlined: <DollarOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  CreditCardOutlined: <CreditCardOutlined />,
  MessageOutlined: <MessageOutlined />,
  BellOutlined: <BellOutlined />,
  CustomerServiceOutlined: <CustomerServiceOutlined />,
  UserOutlined: <UserOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  SettingOutlined: <SettingOutlined />,
  ControlOutlined: <ControlOutlined />,
  BgColorsOutlined: <BgColorsOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  InboxOutlined: <InboxOutlined />,
}

export default function LayoutNew({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<MenuProps['items']>([])
  const router = useRouter()
  const { sidebarItems, user: userFromHook, loading } = usePermissions()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const userObj = JSON.parse(userData)
      setUser(userObj)
    }
  }, [])

  // Atualizar menu quando sidebarItems do hook mudarem
  useEffect(() => {
    const currentUser = userFromHook || user
    if (!loading && currentUser) {
      // Somente usar os sidebarItems providos pelo backend via hook
      // Se vier vazio, não exibir itens protegidos (acesso mínimo)
      const itemsToUse = Array.isArray(sidebarItems) ? sidebarItems : []
      buildMenu(currentUser, itemsToUse)
    }
  }, [sidebarItems, userFromHook, user, loading])

  const buildMenu = (userObj: any, sidebarItemsFromHook: string[] = []) => {
    // Usar SOMENTE os sidebarItems vindos do backend via hook
    const userSidebarItems = Array.isArray(sidebarItemsFromHook) ? sidebarItemsFromHook : []

    // Construir menu organizado por categorias
    const menuStructure: MenuProps['items'] = []

    // PRINCIPAL
    const coreItems = []
    if (userSidebarItems.includes('/dashboard')) {
      coreItems.push({
        key: '/dashboard',
        icon: ICON_MAP.DashboardOutlined,
        label: 'Dashboard',
        onClick: () => router.push('/dashboard')
      })
    }
    if (userSidebarItems.includes('/customers')) {
      coreItems.push({
        key: '/customers',
        icon: ICON_MAP.TeamOutlined,
        label: 'Clientes',
        onClick: () => router.push('/customers')
      })
    }
    if (userSidebarItems.includes('/pets')) {
      coreItems.push({
        key: '/pets',
        icon: ICON_MAP.HeartOutlined,
        label: 'Pets',
        onClick: () => router.push('/pets')
      })
    }
    if (userSidebarItems.includes('/appointments')) {
      coreItems.push({
        key: '/appointments',
        icon: ICON_MAP.CalendarOutlined,
        label: 'Agendamentos',
        onClick: () => router.push('/appointments')
      })
    }
    if (userSidebarItems.includes('/services')) {
      coreItems.push({
        key: '/services',
        icon: ICON_MAP.ToolOutlined,
        label: 'Serviços',
        onClick: () => router.push('/services')
      })
    }

    if (coreItems.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push(...coreItems)
    }

    // VENDAS
    const salesItems = []
    if (userSidebarItems.includes('/products')) {
      salesItems.push({
        key: '/products',
        icon: ICON_MAP.ShoppingOutlined,
        label: 'Produtos',
        onClick: () => router.push('/products')
      })
    }
    if (userSidebarItems.includes('/sales')) {
      salesItems.push({
        key: '/sales',
        icon: ICON_MAP.ShoppingCartOutlined,
        label: 'Vendas',
        onClick: () => router.push('/sales')
      })
    }

    if (salesItems.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        key: 'sales-group',
        label: 'VENDAS',
        type: 'group',
      })
      menuStructure.push(...salesItems)
    }

    // ESTOQUE
    const inventoryItems = []
    if (userSidebarItems.includes('/suppliers')) {
      inventoryItems.push({
        key: '/suppliers',
        icon: ICON_MAP.ShopOutlined,
        label: 'Fornecedores',
        onClick: () => router.push('/suppliers')
      })
    }
    if (userSidebarItems.includes('/purchases')) {
      inventoryItems.push({
        key: '/purchases',
        icon: ICON_MAP.ShoppingOutlined,
        label: 'Compras',
        onClick: () => router.push('/purchases')
      })
    }
    if (userSidebarItems.includes('/stock-movements')) {
      inventoryItems.push({
        key: '/stock-movements',
        icon: ICON_MAP.SwapOutlined,
        label: 'Movimentações',
        onClick: () => router.push('/stock-movements')
      })
    }
    if (userSidebarItems.includes('/stock-alerts')) {
      inventoryItems.push({
        key: '/stock-alerts',
        icon: ICON_MAP.AlertOutlined,
        label: 'Alertas de Estoque',
        onClick: () => router.push('/stock-alerts')
      })
    }

    if (inventoryItems.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        key: 'inventory-group',
        label: 'ESTOQUE',
        type: 'group',
      })
      menuStructure.push(...inventoryItems)
    }

    // MÉDICO
    if (userSidebarItems.includes('/medical-records')) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        key: 'medical-group',
        label: 'VETERINÁRIO',
        type: 'group',
      })
      menuStructure.push({
        key: '/medical-records',
        icon: ICON_MAP.MedicineBoxOutlined,
        label: 'Histórico Médico',
        onClick: () => router.push('/medical-records')
      })
    }

    // HOTEL
    if (userSidebarItems.includes('/hotel')) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        key: 'hotel-group',
        label: 'HOTEL',
        type: 'group',
      })
      menuStructure.push({
        key: '/hotel',
        icon: ICON_MAP.HomeOutlined,
        label: 'Hospedagem',
        onClick: () => router.push('/hotel')
      })
    }

    // FINANCEIRO
    const financialItems = []
    if (userSidebarItems.includes('/cash-flow')) {
      financialItems.push({
        key: '/cash-flow',
        icon: ICON_MAP.DollarOutlined,
        label: 'Fluxo de Caixa',
        onClick: () => router.push('/cash-flow')
      })
    }
    if (userSidebarItems.includes('/financial-reports')) {
      financialItems.push({
        key: '/financial-reports',
        icon: ICON_MAP.BarChartOutlined,
        label: 'Relatórios',
        onClick: () => router.push('/financial-reports')
      })
    }
    if (userSidebarItems.includes('/billing')) {
      financialItems.push({
        key: '/billing',
        icon: ICON_MAP.CreditCardOutlined,
        label: 'Minha Assinatura',
        onClick: () => router.push('/billing')
      })
    }

    if (financialItems.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        key: 'financial-group',
        label: 'FINANCEIRO',
        type: 'group',
      })
      menuStructure.push(...financialItems)
    }

    // COMUNICAÇÃO
    const commItems = []
    if (userSidebarItems.includes('/communications')) {
      commItems.push({
        key: '/communications',
        icon: ICON_MAP.MessageOutlined,
        label: 'Mensagens',
        onClick: () => router.push('/communications')
      })
    }
    if (userSidebarItems.includes('/notifications')) {
      commItems.push({
        key: '/notifications',
        icon: ICON_MAP.BellOutlined,
        label: 'Notificações',
        onClick: () => router.push('/notifications')
      })
    }
    if (userSidebarItems.includes('/tickets')) {
      commItems.push({
        key: '/tickets',
        icon: ICON_MAP.CustomerServiceOutlined,
        label: 'Suporte',
        onClick: () => router.push('/tickets')
      })
    }

    if (commItems.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        key: 'comm-group',
        label: 'COMUNICAÇÃO',
        type: 'group',
      })
      menuStructure.push(...commItems)
    }

    // ADMIN
    const adminItems = []
    // Verificar se é admin pelo role OU planRole
    const isAdmin = userObj.role === 'ADMIN' || userObj.planRole === 'ADMIN'
    if (isAdmin) {
      if (userSidebarItems.includes('/admin-dashboard')) {
        adminItems.push({
          key: '/admin-dashboard',
          icon: ICON_MAP.DashboardOutlined,
          label: 'Admin Dashboard',
          onClick: () => router.push('/admin-dashboard')
        })
      }
      if (userSidebarItems.includes('/admin-billing')) {
        adminItems.push({
          key: '/admin-billing',
          icon: ICON_MAP.DollarOutlined,
          label: 'Gestão de Billing',
          onClick: () => router.push('/admin-billing')
        })
      }
      if (userSidebarItems.includes('/unified-access-management') || 
          userSidebarItems.includes('/user-role-management') || 
          userSidebarItems.includes('/access-management') || 
          userSidebarItems.includes('/tenant-modules')) {
        adminItems.push({
          key: '/unified-access-management',
          icon: ICON_MAP.ControlOutlined,
          label: 'Gestão de Acesso',
          onClick: () => router.push('/unified-access-management')
        })
      }
      if (userSidebarItems.includes('/personalization')) {
        adminItems.push({
          key: '/personalization',
          icon: ICON_MAP.BgColorsOutlined,
          label: 'Personalização',
          onClick: () => router.push('/personalization')
        })
      }
      if (userSidebarItems.includes('/audit-logs')) {
        adminItems.push({
          key: '/audit-logs',
          icon: ICON_MAP.FileTextOutlined,
          label: 'Auditoria',
          onClick: () => router.push('/audit-logs')
        })
      }
      if (userSidebarItems.includes('/backup')) {
        adminItems.push({
          key: '/backup',
          icon: ICON_MAP.DatabaseOutlined,
          label: 'Backup',
          onClick: () => router.push('/backup')
        })
      }
      if (userSidebarItems.includes('/settings')) {
        adminItems.push({
          key: '/settings',
          icon: ICON_MAP.SettingOutlined,
          label: 'Configurações',
          onClick: () => router.push('/settings')
        })
      }
    }

    if (adminItems.length > 0) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({
        key: 'admin-group',
        label: 'ADMINISTRAÇÃO',
        type: 'group',
      })
      menuStructure.push(...adminItems)
    }

    setMenuItems(menuStructure)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
      onClick: () => router.push('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: theme.colors.sidebarBackground,
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
        width={260}
      >
        {/* Logo/Banner */}
        <div
          style={{
            height: collapsed ? 64 : 80,
            margin: '16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 20 : 24,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'PS' : user?.tenant?.name || 'PetShop'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.pathname]}
          items={menuItems}
          style={{ 
            background: theme.colors.sidebarBackground,
            border: 'none'
          }}
        />
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '18px' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge count={0}>
              <Button type="text" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{user?.role}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            background: theme.colors.background,
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}



