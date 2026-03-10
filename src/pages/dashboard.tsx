import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Row, Col, Card, Statistic, List, Avatar, Space, Typography, message, Button } from 'antd'
import {
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'
import { DashboardSkeleton } from '../components/common/PageSkeleton'
import EmptyState from '../components/common/EmptyState'
import { useTheme } from '../contexts/ThemeContext'

interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
}

interface DashboardStats {
  totalCustomers: number
  totalPets: number
  totalAppointments: number
  totalSales: number
  monthlyRevenue: number
  recentActivity: Array<{
    type: string
    description: string
    date: string
  }>
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    loadDashboardData()
  }, [router])


  const loadDashboardData = async () => {
    try {
      const dashboardStats = await apiService.getDashboardStats()
      setStats(dashboardStats as any)
    } catch (error) {
      message.error('Erro ao carregar dados do dashboard. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const { Title, Text } = Typography
  const { isDark } = useTheme()

  if (loading) return <DashboardSkeleton />

  const textPrimary = isDark ? '#f9fafb' : '#1f2937'
  const textSecondary = isDark ? '#9ca3af' : '#6b7280'
  const surfaceBg = isDark ? '#111827' : '#ffffff'
  const elevatedBg = isDark ? '#1f2937' : '#f9fafb'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Welcome Section */}
          <div
            style={{
              background: surfaceBg,
              borderLeft: '4px solid #16a34a',
              borderRadius: 8,
              padding: '24px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Title level={3} style={{ color: textPrimary, margin: 0, fontSize: '24px' }}>
              Bem-vindo ao Dashboard
            </Title>
            <Text style={{ color: textSecondary, fontSize: 16 }}>
              Olá, {user?.name}! Aqui você pode acompanhar o desempenho do seu petshop.
            </Text>
          </div>

          {/* Stats Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-md transition-shadow">
                <Statistic
                  title="Total de Clientes"
                  value={stats?.totalCustomers || 0}
                  prefix={<UserOutlined style={{ color: '#059669' }} />}
                  valueStyle={{ color: '#059669' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-md transition-shadow">
                <Statistic
                  title="Total de Pets"
                  value={stats?.totalPets || 0}
                  prefix={<HeartOutlined style={{ color: '#10b981' }} />}
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-md transition-shadow">
                <Statistic
                  title="Agendamentos"
                  value={stats?.totalAppointments || 0}
                  prefix={<CalendarOutlined style={{ color: '#047857' }} />}
                  valueStyle={{ color: '#047857' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-md transition-shadow">
                <Statistic
                  title="Receita do Mês"
                  value={stats?.monthlyRevenue || 0}
                  prefix="R$"
                  precision={2}
                  valueStyle={{ color: '#065f46' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Recent Activity */}
          <Card
            title="Atividade Recente"
            className="shadow-sm"
            styles={{
              header: {
                backgroundColor: elevatedBg,
                borderBottom: `1px solid ${borderColor}`,
                color: textPrimary,
              },
              body: {
                backgroundColor: surfaceBg,
              },
            }}
          >
            <List
              dataSource={stats?.recentActivity || []}
              locale={{ emptyText: <EmptyState title="Nenhuma atividade recente" compact /> }}
              renderItem={(activity) => (
                <List.Item
                  style={{
                    borderBottomColor: borderColor,
                    cursor: 'default',
                  }}
                  className="transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = elevatedBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: activity.type === 'customer' ? '#059669' :
                                           activity.type === 'pet' ? '#10b981' : '#047857'
                        }}
                      >
                        {activity.type === 'customer' ? <UserOutlined /> :
                         activity.type === 'pet' ? <HeartOutlined /> : <CalendarOutlined />}
                      </Avatar>
                    }
                    title={<span style={{ color: textPrimary }}>{activity.description}</span>}
                    description={
                      <span style={{ color: textSecondary }}>
                        {new Date(activity.date).toLocaleDateString('pt-BR')}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Space>
    </div>
  )
}

