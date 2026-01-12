import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, Space, Typography } from 'antd'
import { usePermissions } from '../../hooks/usePermissions'
import { PermissionGate } from '../PermissionGate'
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
  HeartOutlined,
  SafetyOutlined,
  ToolOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = AntLayout
const { Text } = Typography

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter()
  const { user, sidebarItems, loading } = usePermissions()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
      onClick: () => router.push('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
      onClick: () => router.push('/settings')
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

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      DashboardOutlined: <DashboardOutlined />,
      UserOutlined: <UserOutlined />,
      HeartOutlined: <HeartOutlined />,
      CalendarOutlined: <CalendarOutlined />,
      ToolOutlined: <ToolOutlined />,
      MedicineBoxOutlined: <MedicineBoxOutlined />,
      ShoppingOutlined: <ShoppingOutlined />,
      DollarOutlined: <DollarOutlined />,
      BarChartOutlined: <BarChartOutlined />,
      ShopOutlined: <ShopOutlined />,
      ShoppingCartOutlined: <ShoppingCartOutlined />,
      ExclamationCircleOutlined: <ExclamationCircleOutlined />,
      MessageOutlined: <MessageOutlined />,
      BellOutlined: <BellOutlined />,
      TeamOutlined: <TeamOutlined />,
      SafetyOutlined: <SafetyOutlined />,
      SettingOutlined: <SettingOutlined />
    }
    return icons[iconName] || <FileTextOutlined />
  }

  const menuItems = sidebarItems?.map((item: any) => ({
    key: item.key,
    icon: getIcon(item.icon),
    label: item.label,
    onClick: () => router.push(item.path)
  })) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <Text>Carregando...</Text>
        </div>
      </div>
    )
  }

  return (
    <AntLayout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="bg-white border-r border-gray-200"
        width={250}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <HeartOutlined className="text-white text-lg" />
            </div>
            {!collapsed && (
              <div>
                <Text strong className="text-gray-900">PetFlow</Text>
                <div className="text-xs text-gray-500">Sistema de Gestão</div>
              </div>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[router.pathname]}
          items={menuItems}
          className="border-0"
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>

      <AntLayout>
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:text-gray-900"
            />
            
            <div className="hidden md:block">
              <Text className="text-lg font-semibold text-gray-900">
                {sidebarItems?.find((item: any) => item.path === router.pathname)?.label || 'Dashboard'}
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <PermissionGate resource="notifications" action="read">
              <Badge count={0} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="text-gray-600 hover:text-gray-900"
                />
              </Badge>
            </PermissionGate>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  className="bg-green-100 text-green-600"
                />
                <div className="hidden md:block">
                  <Text className="text-sm font-medium text-gray-900">
                    {user?.name || 'Usuário'}
                  </Text>
                  <div className="text-xs text-gray-500">
                    {user?.role || 'N/A'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
