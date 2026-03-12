import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, Select, Card, Row, Col } from 'antd'
import {
  BarChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  TeamOutlined,
  HeartOutlined,
  CalendarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { apiService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import StatsCard from '../components/common/StatsCard'
import EmptyState from '../components/common/EmptyState'
import { PageSkeleton } from '../components/common/PageSkeleton'

const { Option } = Select

interface ReportData {
  totalCustomers: number
  totalPets: number
  totalAppointments: number
  totalSales: number
  monthlyRevenue: number
  recentActivity: Array<{ type: string; description: string; date: string }>
}

const activityIconMap: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  customer: { icon: <UserAddOutlined />, color: '#047857', bg: 'rgba(4,120,87,0.1)' },
  pet: { icon: <HeartOutlined />, color: '#0d9488', bg: 'rgba(13,148,136,0.1)' },
  appointment: { icon: <CalendarOutlined />, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  sale: { icon: <ShoppingCartOutlined />, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadReportData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const stats = await apiService.getDashboardStats()
      setReportData(stats as any)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSkeleton />

  const statsCards = [
    {
      key: 'customers',
      title: 'Total de Clientes',
      value: reportData?.totalCustomers ?? 0,
      icon: <TeamOutlined />,
      iconColor: '#047857',
    },
    {
      key: 'pets',
      title: 'Total de Pets',
      value: reportData?.totalPets ?? 0,
      icon: <HeartOutlined />,
      iconColor: '#0d9488',
    },
    {
      key: 'appointments',
      title: 'Agendamentos',
      value: reportData?.totalAppointments ?? 0,
      icon: <CalendarOutlined />,
      iconColor: '#7c3aed',
    },
    {
      key: 'revenue',
      title: 'Receita Mensal',
      value: `R$ ${(reportData?.monthlyRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: <DollarOutlined />,
      iconColor: '#d97706',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Análise e estatísticas do seu petshop"
        breadcrumb={[{ label: 'Relatórios' }]}
        actions={
          <>
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              style={{ width: 160, height: 36 }}
            >
              <Option value="7">Últimos 7 dias</Option>
              <Option value="30">Últimos 30 dias</Option>
              <Option value="90">Últimos 90 dias</Option>
              <Option value="365">Último ano</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadReportData}
              loading={loading}
              style={{
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
              }}
            >
              Atualizar
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              style={{
                height: 36,
                borderRadius: 8,
                background: 'var(--primary-color)',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Exportar
            </Button>
          </>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        {/* KPI Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statsCards.map(card => (
            <Col key={card.key} xs={24} sm={12} lg={6}>
              <StatsCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                iconColor={card.iconColor}
                accent={card.iconColor}
              />
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          {/* Atividade Recente */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
                  <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
                    Atividade Recente
                  </span>
                </div>
              }
              style={{ height: '100%' }}
            >
              {reportData?.recentActivity && reportData.recentActivity.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reportData.recentActivity.map((activity, index) => {
                    const config = activityIconMap[activity.type] ?? activityIconMap.customer
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 10,
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: config.bg,
                          color: config.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                          flexShrink: 0,
                        }}>
                          {config.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {activity.description}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: 11,
                            color: 'var(--text-tertiary)',
                            marginTop: 2,
                          }}>
                            {activity.date}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Sem atividade recente"
                  description="As atividades aparecerão aqui conforme você usa o sistema"
                  compact
                />
              )}
            </Card>
          </Col>

          {/* Gráfico de Receita */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChartOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
                  <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
                    Receita por Período
                  </span>
                </div>
              }
              style={{ height: '100%' }}
            >
              <div style={{
                height: 260,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-elevated)',
                borderRadius: 10,
                border: '1px dashed var(--border-color)',
                gap: 12,
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(4,120,87,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-color)',
                  fontSize: 24,
                }}>
                  <BarChartOutlined />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--display-family)',
                  }}>
                    Gráfico de Receita
                  </p>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                  }}>
                    Visualização de dados em desenvolvimento
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
