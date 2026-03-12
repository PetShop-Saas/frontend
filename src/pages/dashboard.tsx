import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Row, Col, Card, List, Avatar, Space, Typography, message, Button, Statistic } from 'antd'
import {
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReloadOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { apiService } from '../services/api'
import { DashboardSkeleton } from '../components/common/PageSkeleton'
import EmptyState from '../components/common/EmptyState'
import { useTheme } from '../contexts/ThemeContext'

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

const kpiConfig = [
  {
    key: 'customers',
    title: 'Clientes Ativos',
    icon: <TeamOutlined style={{ fontSize: 20 }} />,
    gradient: 'linear-gradient(135deg, #047857, #10b981)',
    bgLight: '#f0fdf4',
    colorLight: '#047857',
    route: '/customers',
  },
  {
    key: 'pets',
    title: 'Pets Cadastrados',
    icon: <HeartOutlined style={{ fontSize: 20 }} />,
    gradient: 'linear-gradient(135deg, #0d9488, #2dd4bf)',
    bgLight: '#f0fdfa',
    colorLight: '#0d9488',
    route: '/pets',
  },
  {
    key: 'appointments',
    title: 'Agendamentos',
    icon: <CalendarOutlined style={{ fontSize: 20 }} />,
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
    bgLight: '#ecfdf5',
    colorLight: '#059669',
    route: '/appointments',
  },
  {
    key: 'revenue',
    title: 'Receita do Mês',
    icon: <DollarOutlined style={{ fontSize: 20 }} />,
    gradient: 'linear-gradient(135deg, #064e3b, #047857)',
    bgLight: '#f0fdf4',
    colorLight: '#064e3b',
    route: '/cash-flow',
    isCurrency: true,
  },
]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isDark } = useTheme()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))
    loadDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
      const endOfMonth = today.toISOString().slice(0, 10)

      const [dashboardStats, cashFlowBalance] = await Promise.allSettled([
        apiService.getDashboardStats(),
        apiService.getCashFlowBalance(startOfMonth, endOfMonth),
      ])

      if (dashboardStats.status === 'fulfilled') {
        const statsData = dashboardStats.value as DashboardStats
        if (!statsData.monthlyRevenue && cashFlowBalance.status === 'fulfilled') {
          const balance = cashFlowBalance.value as any
          statsData.monthlyRevenue = balance?.totalInflow ?? 0
        }
        setStats(statsData)
      } else {
        message.error('Erro ao carregar dados. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  const surface = isDark ? '#111827' : '#ffffff'
  const base = isDark ? '#0b1120' : '#f4f6f9'
  const textPrimary = isDark ? '#f1f5f9' : '#111827'
  const textSecondary = isDark ? '#94a3b8' : '#6b7280'
  const border = isDark ? '#1e2d3d' : '#e5e7eb'
  const elevated = isDark ? '#1a2332' : '#f9fafb'

  const kpiValues = {
    customers: stats?.totalCustomers ?? 0,
    pets: stats?.totalPets ?? 0,
    appointments: stats?.totalAppointments ?? 0,
    revenue: stats?.monthlyRevenue ?? 0,
  }

  const activityIconMap: Record<string, React.ReactNode> = {
    customer: <UserOutlined />,
    pet: <HeartOutlined />,
    appointment: <CalendarOutlined />,
  }
  const activityColorMap: Record<string, string> = {
    customer: '#047857',
    pet: '#0d9488',
    appointment: '#059669',
  }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* ─── Welcome bar ─── */}
      <div style={{
        background: surface,
        borderRadius: 14,
        padding: '20px 24px',
        border: `1px solid ${border}`,
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            background: 'linear-gradient(135deg, #10b981, #047857)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}>
            <RiseOutlined style={{ fontSize: 20, color: 'white' }} />
          </div>
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: textPrimary,
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.2,
            }}>
              Bom dia, {user?.name?.split(' ')[0]}!
            </div>
            <div style={{ fontSize: 13, color: textSecondary, marginTop: 3 }}>
              Confira o resumo do seu petshop hoje
            </div>
          </div>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadDashboardData}
          style={{
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            height: 36,
            border: `1px solid ${border}`,
            color: textSecondary,
            background: elevated,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Atualizar
        </Button>
      </div>

      {/* ─── KPI Cards ─── */}
      <Row gutter={[16, 16]}>
        {kpiConfig.map((kpi) => {
          const val = kpiValues[kpi.key as keyof typeof kpiValues]
          return (
            <Col key={kpi.key} xs={24} sm={12} xl={6}>
              <div
                onClick={() => router.push(kpi.route)}
                style={{
                  background: surface,
                  borderRadius: 14,
                  border: `1px solid ${border}`,
                  padding: '20px 20px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = isDark
                    ? '0 8px 20px rgba(0,0,0,0.35)'
                    : '0 8px 20px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = isDark
                    ? '0 1px 3px rgba(0,0,0,0.3)'
                    : '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 3,
                  background: kpi.gradient,
                  borderRadius: '14px 14px 0 0',
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  {/* Icon badge */}
                  <div style={{
                    width: 44,
                    height: 44,
                    background: isDark ? 'rgba(16, 185, 129, 0.12)' : kpi.bgLight,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: kpi.colorLight,
                    flexShrink: 0,
                  }}>
                    {kpi.icon}
                  </div>

                  {/* Arrow */}
                  <ArrowRightOutlined style={{
                    fontSize: 12,
                    color: isDark ? 'rgba(255,255,255,0.2)' : '#d1d5db',
                    marginTop: 4,
                    transition: 'color 0.15s',
                  }} />
                </div>

                {/* Value */}
                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: textPrimary,
                  fontFamily: "'Outfit', sans-serif",
                  lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {kpi.isCurrency
                    ? `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : val.toLocaleString('pt-BR')}
                </div>

                {/* Label */}
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {kpi.title}
                </div>
              </div>
            </Col>
          )
        })}
      </Row>

      {/* ─── Recent Activity ─── */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: textPrimary }}>
              Atividade Recente
            </span>
            <Button
              type="link"
              size="small"
              style={{ fontWeight: 600, color: '#047857', fontSize: 12, padding: 0 }}
              onClick={() => router.push('/appointments')}
            >
              Ver todos <ArrowRightOutlined />
            </Button>
          </div>
        }
        styles={{
          header: {
            background: surface,
            borderBottom: `1px solid ${border}`,
          },
          body: {
            background: surface,
            padding: 0,
          },
        }}
        style={{
          border: `1px solid ${border}`,
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <List
          dataSource={stats?.recentActivity || []}
          locale={{ emptyText: <EmptyState title="Nenhuma atividade recente" compact /> }}
          renderItem={(activity, index) => (
            <List.Item
              style={{
                padding: '14px 20px',
                borderBottom: index < (stats?.recentActivity?.length ?? 0) - 1
                  ? `1px solid ${isDark ? '#1e2d3d' : '#f3f4f6'}`
                  : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = isDark ? '#1a2332' : '#fafafa'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={36}
                    style={{
                      background: `${activityColorMap[activity.type] || '#047857'}20`,
                      color: activityColorMap[activity.type] || '#047857',
                      border: 'none',
                      fontSize: 15,
                    }}
                  >
                    {activityIconMap[activity.type] || <CalendarOutlined />}
                  </Avatar>
                }
                title={
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: textPrimary }}>
                    {activity.description}
                  </span>
                }
                description={
                  <span style={{ fontSize: 12, color: textSecondary }}>
                    {new Date(activity.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  )
}
