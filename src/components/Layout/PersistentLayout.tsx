import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, Space, Typography, Popover, List, Empty, Divider, message } from 'antd'
import { usePersonalization } from '../../hooks/usePersonalization'
import { useGlobalPersonalization } from '../../hooks/useGlobalPersonalization'
import { usePermissions } from '../../hooks/usePermissions'
import { apiService } from '../../services/api'
import TrialBanner from '../TrialBanner'
import PlanBadge from '../PlanBadge'
import { 
  DashboardOutlined, 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  ToolOutlined, 
  ShoppingOutlined, 
  ShoppingCartOutlined, 
  MedicineBoxOutlined, 
  HeartOutlined, 
  BarChartOutlined, 
  DollarOutlined, 
  SettingOutlined, 
  LogoutOutlined, 
  BellOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  SwapOutlined,
  HomeOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  ControlOutlined,
  InboxOutlined,
  AppstoreOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = AntLayout
const { Title } = Typography

interface LayoutProps {
  children: React.ReactNode
}

export default function PersistentLayout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const router = useRouter()
  const { settings: personalizationSettings } = usePersonalization()
  useGlobalPersonalization() // Aplicar configurações globais
  const { canAccessSidebarItem, user: userFromHook, loading: permissionsLoading } = usePermissions()

  // Carregar dados do usuário apenas uma vez
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Usar user do hook se disponível, senão usar do localStorage
    if (userFromHook) {
      setUser(userFromHook)
    } else {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const userObj = JSON.parse(userData)
          setUser(userObj)
        } catch (error) {
        }
      }
    }
  }, [router, userFromHook])

  // Carregar notificações não lidas
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [count, unreadList] = await Promise.all([
          apiService.getUnreadCount(),
          apiService.getUnreadNotifications()
        ])
        
        setUnreadCount(typeof count === 'number' ? count : (count as any)?.count || 0)
        setNotifications(Array.isArray(unreadList) ? unreadList.slice(0, 5) : [])
      } catch (error) {
        // Silenciar erro se não houver permissão ou token
      }
    }

    if (user || userFromHook) {
      loadNotifications()
      // Atualizar a cada 30 segundos
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user, userFromHook])

  // Verificar se não é uma página pública
  const publicPages = ['/login', '/']
  if (publicPages.includes(router.pathname)) {
    return <>{children}</>
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // Função para verificar se o usuário tem acesso a um item do sidebar
  const hasSidebarItem = (itemKey: string): boolean => {
    if (!user || permissionsLoading) return false
    return canAccessSidebarItem(itemKey)
  }

  // Definir todos os itens possíveis do menu organizados por categoria
  const allMenuItems: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    category: string;
  }> = [
    // DASHBOARD
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', category: 'main' },
    
    // OPERAÇÕES
    { key: '/customers', icon: <UserOutlined />, label: 'Clientes', category: 'operations' },
    { key: '/pets', icon: <HeartOutlined />, label: 'Pets', category: 'operations' },
    { key: '/appointments', icon: <CalendarOutlined />, label: 'Agendamentos', category: 'operations' },
    { key: '/calendar', icon: <CalendarOutlined />, label: 'Calendário', category: 'operations' },
    { key: '/services', icon: <ToolOutlined />, label: 'Serviços', category: 'operations' },
    { key: '/operations', icon: <AppstoreOutlined />, label: 'Operações', category: 'operations' },
    
    // VENDAS
    { key: '/products', icon: <ShoppingOutlined />, label: 'Produtos', category: 'sales' },
    { key: '/sales', icon: <ShoppingCartOutlined />, label: 'Vendas', category: 'sales' },
    
    // ESTOQUE
    { key: '/suppliers', icon: <TeamOutlined />, label: 'Fornecedores', category: 'inventory' },
    { key: '/purchases', icon: <SwapOutlined />, label: 'Compras', category: 'inventory' },
    
    // MÉDICO
    { key: '/medical-records', icon: <MedicineBoxOutlined />, label: 'Histórico Médico', category: 'medical' },
    { key: '/hotel', icon: <HomeOutlined />, label: 'Hotel para Pets', category: 'hotel' },
    
    // FINANCEIRO
    { key: '/cash-flow', icon: <DollarOutlined />, label: 'Fluxo de Caixa', category: 'financial' },
    { key: '/financial-reports', icon: <BarChartOutlined />, label: 'Relatórios Financeiros', category: 'financial' },
    { key: '/billing', icon: <CreditCardOutlined />, label: 'Minha Assinatura', category: 'financial' },
    
    // COMUNICAÇÃO
    { key: '/communications', icon: <CustomerServiceOutlined />, label: 'Comunicação', category: 'communication' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notificações', category: 'communication' },
    { key: '/tickets', icon: <InboxOutlined />, label: 'Suporte', category: 'communication' },
    
    // ADMIN
    { key: '/admin-dashboard', icon: <DashboardOutlined />, label: 'Admin Dashboard', category: 'admin' },
    { key: '/admin-billing', icon: <DollarOutlined />, label: 'Gestão de Billing', category: 'admin' },
    { key: '/pricing-management', icon: <DollarOutlined />, label: 'Gerenciamento de Preços', category: 'admin' },
    { key: '/unified-access-management', icon: <ControlOutlined />, label: 'Gestão de Acesso', category: 'admin' },
    { key: '/personalization', icon: <BgColorsOutlined />, label: 'Personalização', category: 'admin' },
    { key: '/audit-logs', icon: <BarChartOutlined />, label: 'Auditoria', category: 'admin' },
    { key: '/backup', icon: <DatabaseOutlined />, label: 'Backup & Restore', category: 'admin' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Configurações', category: 'admin' },
  ]

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
    if (grouped.main && grouped.main.length > 0) {
      menuStructure.push({
        type: 'group',
        label: 'PRINCIPAL',
        children: grouped.main.map((item: any) => ({
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
        label: 'HOSPEDAGEM',
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

  // Verificar se é admin
  const isAdmin = user?.role === 'ADMIN' || user?.planRole === 'ADMIN'
  
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
      onClick: () => router.push('/profile')
    },
    {
      key: 'preferences',
      icon: <SettingOutlined />,
      label: 'Preferências',
      onClick: () => router.push('/user-preferences')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout
    }
  ]

  function getPageTitle(pathname: string): string {
    const titles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/customers': 'Clientes',
      '/pets': 'Pets',
      '/appointments': 'Agendamentos',
      '/calendar': 'Calendário',
      '/services': 'Serviços',
      '/products': 'Produtos',
      '/sales': 'Vendas',
      '/suppliers': 'Fornecedores',
      '/purchases': 'Compras',
      '/stock-alerts': 'Alertas de Estoque',
      '/medical-records': 'Histórico Médico',
      '/hotel': 'Hotel para Pets',
      '/cash-flow': 'Fluxo de Caixa',
      '/financial-reports': 'Relatórios Financeiros',
      '/billing': 'Minha Assinatura',
      '/communications': 'Comunicação',
      '/notifications': 'Notificações',
      '/tickets': 'Suporte',
      '/unified-access-management': 'Gestão de Acesso',
      '/personalization': 'Personalização',
      '/audit-logs': 'Auditoria',
      '/backup': 'Backup & Restore',
      '/settings': 'Configurações',
      '/profile': 'Perfil',
    }
    return titles[pathname] || 'PetFlow'
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="custom-sidebar"
        style={{
          background: personalizationSettings.sidebarColor ?? '#064e3b',
          height: '100vh',
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          padding: 0
        }}
        width={256}
      >
        {/* Banner do tenant */}
        <div style={{ 
          width: '100%',
          height: collapsed ? 60 : (personalizationSettings.bannerHeight ?? 80),
          margin: 0,
          padding: 0,
          display: 'block',
          background: 'transparent',
          position: 'relative'
        }}>
          {personalizationSettings.showBanner && personalizationSettings.bannerUrl ? (
            <Image 
              src={personalizationSettings.bannerUrl} 
              alt={`Banner ${personalizationSettings.siteName || 'PetFlow'}`}
              width={collapsed ? 60 : 240}
              height={collapsed ? 60 : (personalizationSettings.bannerHeight ?? 80)}
              unoptimized
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: collapsed ? 4 : (personalizationSettings.borderRadius ?? 8)
              }} 
              onError={() => {
              }}
            />
          ) : personalizationSettings.showLogo && personalizationSettings.logoUrl ? (
            <Image 
              src={personalizationSettings.logoUrl} 
              alt={`Logo ${personalizationSettings.siteName || 'PetFlow'}`}
              width={collapsed ? 60 : 240}
              height={collapsed ? 60 : (personalizationSettings.bannerHeight ?? 80)}
              unoptimized
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: collapsed ? 4 : (personalizationSettings.borderRadius ?? 8)
              }} 
              onError={() => {
              }}
            />
          ) : (
            <Image 
              src="/logo.png" 
              alt="PetFlow Logo"
              width={256}
              height={collapsed ? 60 : (personalizationSettings.bannerHeight ?? 80)}
              unoptimized
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 0,
                display: 'block'
              }} 
              onError={() => {
                // Fallback para texto se a logo não carregar
              }}
            />
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.pathname]}
          items={menuItems}
          className="custom-sidebar-menu"
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: collapsed ? 0 : 16
          }}
        />
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 256 }}>
        <Header style={{ 
          background: personalizationSettings.headerColor ?? '#fff', 
          padding: '0 24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'fixed',
          top: 0,
          right: 0,
          left: collapsed ? 80 : 256,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          borderBottom: `2px solid ${personalizationSettings.primaryColor ?? '#16a34a'}`,
          fontSize: personalizationSettings.fontSize ? `${personalizationSettings.fontSize}px` : '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Title level={4} style={{ 
              margin: 0, 
              marginLeft: 16, 
              color: personalizationSettings.primaryColor || '#1f2937',
              fontSize: personalizationSettings.fontSize ? `${personalizationSettings.fontSize + 2}px` : '16px'
            }}>
              {getPageTitle(router.pathname)}
            </Title>
          </div>

          <Space size="middle">
            <PlanBadge />
            
            <Popover
              content={
                <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Typography.Text strong>Notificações</Typography.Text>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => router.push('/notifications')}
                    >
                      Ver todas
                    </Button>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  {loadingNotifications ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Typography.Text type="secondary">Carregando...</Typography.Text>
                    </div>
                  ) : notifications.length === 0 ? (
                    <Empty 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhuma notificação"
                      style={{ padding: 20 }}
                    />
                  ) : (
                    <List
                      dataSource={notifications}
                      renderItem={(item: any) => (
                        <List.Item
                          style={{ 
                            padding: '12px 0',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onClick={async () => {
                            try {
                              await apiService.markNotificationAsRead(item.id)
                              setUnreadCount(Math.max(0, unreadCount - 1))
                              setNotifications(notifications.filter(n => n.id !== item.id))
                              if (item.actionUrl) {
                                router.push(item.actionUrl)
                              } else {
                                router.push('/notifications')
                              }
                            } catch (error) {
                              message.error('Erro ao marcar notificação como lida')
                            }
                          }}
                        >
                          <List.Item.Meta
                            title={
                              <Typography.Text 
                                strong={!item.isRead}
                                style={{ fontSize: 13 }}
                              >
                                {item.title}
                              </Typography.Text>
                            }
                            description={
                              <Typography.Text 
                                type="secondary" 
                                style={{ fontSize: 12 }}
                                ellipsis={{ tooltip: item.message }}
                              >
                                {item.message}
                              </Typography.Text>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                  {notifications.length > 0 && (
                    <>
                      <Divider style={{ margin: '8px 0' }} />
                      <Button 
                        type="link" 
                        block
                        onClick={async () => {
                          try {
                            await apiService.markAllNotificationsAsRead()
                            setUnreadCount(0)
                            setNotifications([])
                            message.success('Todas as notificações foram marcadas como lidas')
                          } catch (error: any) {
                            message.error('Erro ao marcar todas como lidas')
                          }
                        }}
                      >
                        Marcar todas como lidas
                      </Button>
                    </>
                  )}
                </div>
              }
              title={null}
              trigger="click"
              placement="bottomRight"
              overlayStyle={{ width: 320 }}
            >
              <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                <Button 
                  type="text" 
                  icon={<BellOutlined style={{ fontSize: 18, color: '#6b7280' }} />}
                  onClick={() => {
                    // Recarregar notificações ao abrir
                    setLoadingNotifications(true)
                    Promise.all([
                      apiService.getUnreadCount(),
                      apiService.getUnreadNotifications()
                    ]).then(([count, unreadList]) => {
                      setUnreadCount(typeof count === 'number' ? count : (count as any)?.count || 0)
                      setNotifications(Array.isArray(unreadList) ? unreadList.slice(0, 5) : [])
                    }).catch(() => {
                      // Silenciar erro
                    }).finally(() => {
                      setLoadingNotifications(false)
                    })
                  }}
                />
              </Badge>
            </Popover>
            
            <Dropdown
              menu={{ items: userMenuItems }}
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
                  lineHeight: 1.2
                }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1f2937' }}>
                    {user?.name || 'Usuário'}
                  </span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {user?.role || 'USER'}
                  </span>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        {/* Banner de Trial */}
        <div style={{ 
          position: 'fixed',
          top: 64,
          right: 0,
          left: collapsed ? 80 : 256,
          zIndex: 999
        }}>
          <TrialBanner />
        </div>
        
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#fff', 
          borderRadius: personalizationSettings.borderRadius ?? 8,
          marginTop: '88px',
          fontSize: personalizationSettings.fontSize ? `${personalizationSettings.fontSize}px` : '14px',
          fontFamily: personalizationSettings.fontFamily ?? 'Inter, sans-serif'
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
