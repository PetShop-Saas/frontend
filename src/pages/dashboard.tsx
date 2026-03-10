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

  if (loading) return <DashboardSkeleton />

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Welcome Section - Simplificado */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
            <Title level={3} style={{ color: '#1f2937', margin: 0, fontSize: '24px' }}>
              Bem-vindo ao Dashboard
            </Title>
            <Text style={{ color: '#6b7280', fontSize: 16 }}>
              Olá, {user?.name}! Aqui você pode acompanhar o desempenho do seu petshop.
            </Text>
          </div>

          {/* Stats Cards - Tons de Verde */}
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

          {/* Recent Activity - Simplificado */}
          <Card 
            title="Atividade Recente" 
            className="shadow-sm"
            styles={{ 
              header: {
                backgroundColor: '#f9fafb', 
                borderBottom: '1px solid #e5e7eb',
                color: '#374151'
              }
            }}
          >
            <List
              dataSource={stats?.recentActivity || []}
              locale={{ emptyText: <EmptyState title="Nenhuma atividade recente" compact /> }}
              renderItem={(activity, index) => (
                <List.Item className="hover:bg-gray-50 transition-colors">
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
                    title={<span style={{ color: '#374151' }}>{activity.description}</span>}
                    description={
                      <span style={{ color: '#6b7280' }}>
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

