import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, Space, Typography, Tooltip } from 'antd'
import { usePageTransition } from '../../hooks/usePageTransition'
import { usePermissions } from '../../hooks/usePermissions'
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
  ShopOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  MedicineBoxOutlined,
  MessageOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  ControlOutlined,
  BgColorsOutlined,
  DownOutlined,
} from '@ant-design/icons'
import { useTheme } from '../../contexts/ThemeContext'

interface LayoutProps {
  children: React.ReactNode
}

const { Header, Sider, Content } = AntLayout

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [tenantLogo, setTenantLogo] = useState<string>('')
  const router = useRouter()
  const { isTransitioning } = usePageTransition()
  const { canAccessSidebarItem } = usePermissions()
  const { isDark } = useTheme()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    const userData = localStorage.getItem('user')
    if (userData) {
      try { setUser(JSON.parse(userData)) } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user?.tenant) setTenantLogo('')
    const handleLogoUpdate = (event: CustomEvent) => setTenantLogo(event.detail)
    window.addEventListener('logoUpdated', handleLogoUpdate as EventListener)
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate as EventListener)
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; max-age=0; samesite=strict'
    router.push('/login')
  }

  const allMenuItems: Array<{
    key: string; icon: React.ReactNode; label: string; category?: string;
  }> = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', category: 'core' },
    { key: '/customers', icon: <TeamOutlined />, label: 'Clientes', category: 'core' },
    { key: '/pets', icon: <HeartOutlined />, label: 'Pets', category: 'core' },
    { key: '/appointments', icon: <CalendarOutlined />, label: 'Agendamentos', category: 'core' },
    { key: '/calendar', icon: <CalendarOutlined />, label: 'Calendário', category: 'core' },
    { key: '/services', icon: <SettingOutlined />, label: 'Serviços', category: 'core' },
    { key: '/products', icon: <ShoppingOutlined />, label: 'Produtos', category: 'sales' },
    { key: '/sales', icon: <ShoppingCartOutlined />, label: 'Vendas', category: 'sales' },
    { key: '/suppliers', icon: <ShopOutlined />, label: 'Fornecedores', category: 'inventory' },
    { key: '/purchases', icon: <ShoppingOutlined />, label: 'Compras', category: 'inventory' },
    { key: '/medical-records', icon: <MedicineBoxOutlined />, label: 'Histórico Médico', category: 'medical' },
    { key: '/hotel', icon: <HeartOutlined />, label: 'Hotel para Pets', category: 'hotel' },
    { key: '/cash-flow', icon: <DollarOutlined />, label: 'Fluxo de Caixa', category: 'financial' },
    { key: '/financial-reports', icon: <BarChartOutlined />, label: 'Relatórios', category: 'financial' },
    { key: '/billing', icon: <DollarOutlined />, label: 'Assinatura', category: 'financial' },
    { key: '/communications', icon: <MessageOutlined />, label: 'Comunicação', category: 'communication' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notificações', category: 'communication' },
    { key: '/tickets', icon: <MessageOutlined />, label: 'Suporte', category: 'communication' },
    { key: '/operations', icon: <ThunderboltOutlined />, label: 'Operações', category: 'operations' },
    { key: '/admin-dashboard', icon: <DashboardOutlined />, label: 'Admin Dashboard', category: 'admin' },
    { key: '/admin-billing', icon: <DollarOutlined />, label: 'Gestão de Billing', category: 'admin' },
    { key: '/unified-access-management', icon: <ControlOutlined />, label: 'Gestão de Acesso', category: 'admin' },
    { key: '/personalization', icon: <BgColorsOutlined />, label: 'Personalização', category: 'admin' },
    { key: '/audit-logs', icon: <FileTextOutlined />, label: 'Auditoria', category: 'admin' },
    { key: '/backup', icon: <DatabaseOutlined />, label: 'Backup', category: 'admin' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Configurações', category: 'admin' },
  ]

  const hasSidebarItem = (itemKey: string): boolean => {
    if (!user) return false
    return canAccessSidebarItem(itemKey)
  }

  const buildGroupedMenu = () => {
    const grouped: any = {}
    allMenuItems.forEach(item => {
      if (hasSidebarItem(item.key)) {
        const cat = item.category || 'other'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(item)
      }
    })

    const makeItems = (items: any[]) =>
      items.map((item: any) => ({
        key: item.key, icon: item.icon, label: item.label,
        onClick: () => router.push(item.key),
      }))

    const menuStructure: any[] = []
    const groups = [
      { key: 'core', label: null },
      { key: 'sales', label: 'Vendas' },
      { key: 'inventory', label: 'Estoque' },
      { key: 'medical', label: 'Veterinário' },
      { key: 'hotel', label: 'Hotel' },
      { key: 'financial', label: 'Financeiro' },
      { key: 'communication', label: 'Comunicação' },
      { key: 'operations', label: 'Operações' },
    ]

    groups.forEach(({ key, label }) => {
      if (!grouped[key]?.length) return
      if (label) {
        if (menuStructure.length > 0) menuStructure.push({ type: 'divider' })
        menuStructure.push({ type: 'group', label, children: makeItems(grouped[key]) })
      } else {
        makeItems(grouped[key]).forEach(i => menuStructure.push(i))
      }
    })

    const isAdmin = user?.role === 'ADMIN' || user?.planRole === 'ADMIN'
    if (grouped.admin?.length && isAdmin) {
      menuStructure.push({ type: 'divider' })
      menuStructure.push({ type: 'group', label: 'Administração', children: makeItems(grouped.admin) })
    }

    return menuStructure
  }

  const menuItems = buildGroupedMenu()

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Meu Perfil' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Sair', onClick: handleLogout },
  ]

  const sidebarWidth = 252
  const collapsedWidth = 72

  const headerBg = isDark
    ? 'rgba(17, 24, 39, 0.97)'
    : 'rgba(255, 255, 255, 0.97)'

  const contentBg = isDark ? '#0b1120' : '#f4f6f9'

  return (
    <AntLayout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* ─── Sidebar ─── */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="custom-sidebar"
        style={{
          background: '#042f1e',
          height: '100vh',
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1001,
          boxShadow: '2px 0 20px rgba(0,0,0,0.3)',
        }}
        width={sidebarWidth}
        collapsedWidth={collapsedWidth}
      >
        {/* Brand / Logo area */}
        <div style={{
          padding: collapsed ? '16px 0' : '20px 16px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginBottom: 8,
          minHeight: collapsed ? 72 : 80,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {tenantLogo ? (
            <Image
              src={tenantLogo}
              alt="Logo"
              width={collapsed ? 36 : 36}
              height={collapsed ? 36 : 36}
              unoptimized
              style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              onError={() => setTenantLogo('')}
            />
          ) : (
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #10b981, #047857)',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              fontWeight: 800,
              color: 'white',
              flexShrink: 0,
              letterSpacing: '-0.5px',
              fontFamily: "'Outfit', sans-serif",
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
            }}>
              {collapsed
                ? (user?.tenant?.name?.charAt(0) || 'P')
                : (user?.tenant?.name?.slice(0, 2) || 'PF').toUpperCase()}
            </div>
          )}

          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: "'Outfit', sans-serif",
              }}>
                {user?.tenant?.name || 'PetFlow'}
              </div>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 500,
                marginTop: 2,
              }}>
                {user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
              </div>
            </div>
          )}
        </div>

        {/* Navigation menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          inlineIndent={16}
          style={{
            border: 'none',
            background: 'transparent',
            padding: '0 0 24px',
          }}
          className="custom-sidebar-menu"
        />
      </Sider>

      {/* ─── Main layout ─── */}
      <AntLayout style={{
        marginLeft: collapsed ? collapsedWidth : sidebarWidth,
        transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        background: contentBg,
      }}>
        {/* ─── Header ─── */}
        <Header
          className={collapsed ? 'collapsed' : ''}
          style={{
            padding: '0 24px',
            background: headerBg,
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: isDark
              ? '0 1px 0 rgba(255,255,255,0.05), 0 2px 12px rgba(0,0,0,0.3)'
              : '0 1px 0 rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.05)',
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? collapsedWidth : sidebarWidth,
            zIndex: 1000,
            transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            height: 64,
            lineHeight: '64px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          {/* Left: toggle + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tooltip title={collapsed ? 'Expandir menu' : 'Recolher menu'} placement="right">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: 16,
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  color: isDark ? 'rgba(255,255,255,0.6)' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Tooltip>

            {/* Page title */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{
                fontSize: 16,
                fontWeight: 700,
                color: isDark ? '#f1f5f9' : '#111827',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.2,
              }}>
                {getPageTitle(router.pathname)}
              </span>
            </div>
          </div>

          {/* Right: notifications + user */}
          <Space size={8} style={{ alignItems: 'center' }}>
            {/* Notifications */}
            <Tooltip title="Notificações">
              <Badge count={3} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    fontSize: 17,
                    color: isDark ? 'rgba(255,255,255,0.55)' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Badge>
            </Tooltip>

            {/* Divider */}
            <div style={{
              width: 1,
              height: 28,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              margin: '0 4px',
            }} />

            {/* User dropdown */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => { if (key === 'profile') router.push('/profile') },
                style: { minWidth: 180 },
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                cursor: 'pointer',
                padding: '5px 8px 5px 5px',
                borderRadius: 10,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = isDark
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(0,0,0,0.04)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.02)'
                }}
              >
                <Avatar
                  size={30}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #047857)',
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "'Outfit', sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark ? '#f1f5f9' : '#111827',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.name || 'Usuário'}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.email || ''}
                  </span>
                </div>
                <DownOutlined style={{
                  fontSize: 10,
                  color: isDark ? 'rgba(255,255,255,0.3)' : '#d1d5db',
                  marginLeft: 2,
                }} />
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* ─── Content ─── */}
        <Content style={{
          marginTop: 64,
          padding: '24px',
          background: contentBg,
          minHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          <div
            className={`page-transition ${isTransitioning ? 'page-enter' : ''}`}
            style={{ minHeight: '100%', position: 'relative' }}
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
    '/calendar': 'Calendário',
    '/services': 'Serviços',
    '/products': 'Produtos',
    '/sales': 'Vendas',
    '/suppliers': 'Fornecedores',
    '/purchases': 'Compras',
    '/operations': 'Operações',
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
    '/personalization': 'Personalização',
  }
  return titles[pathname] || 'PetFlow'
}
