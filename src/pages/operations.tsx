import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Tabs, Button, Space } from 'antd'
import {
  CalendarOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import PageHeader from '../components/common/PageHeader'

const tabItems = [
  {
    key: 'appointments',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <CalendarOutlined /> Agendamentos
      </span>
    ),
    icon: <CalendarOutlined style={{ fontSize: 32, color: '#047857' }} />,
    title: 'Gestão de Agendamentos',
    description: 'Gerencie todos os agendamentos de consultas e serviços do seu petshop',
    actions: [
      { label: 'Ver Agendamentos', route: '/appointments', primary: true },
      { label: 'Ver Calendário',   route: '/calendar',     primary: false },
    ],
  },
  {
    key: 'services',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ToolOutlined /> Serviços
      </span>
    ),
    icon: <ToolOutlined style={{ fontSize: 32, color: '#047857' }} />,
    title: 'Catálogo de Serviços',
    description: 'Configure e gerencie os serviços oferecidos pelo petshop',
    actions: [
      { label: 'Gerenciar Serviços', route: '/services', primary: true },
    ],
  },
  {
    key: 'sales',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ShoppingCartOutlined /> Vendas
      </span>
    ),
    icon: <ShoppingCartOutlined style={{ fontSize: 32, color: '#047857' }} />,
    title: 'Gestão de Vendas',
    description: 'Controle todas as vendas de produtos e serviços',
    actions: [
      { label: 'Ver Vendas',    route: '/sales',    primary: true },
      { label: 'Ver Produtos',  route: '/products', primary: false },
    ],
  },
]

export default function Operations() {
  const [activeTab, setActiveTab] = useState('appointments')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeItem = tabItems.find(t => t.key === activeTab)!

  return (
    <div>
      <PageHeader
        title="Operações Diárias"
        subtitle="Agendamentos, serviços e vendas em um só lugar"
        breadcrumb={[{ label: 'Operações' }]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          items={tabItems.map(t => ({ key: t.key, label: t.label }))}
          style={{ marginBottom: 0 }}
        />

        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '0 12px 12px 12px',
          border: '1px solid var(--border-color)',
          borderTop: 'none',
          boxShadow: 'var(--shadow-sm)',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 280,
          gap: 16,
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(4,120,87,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {activeItem.icon}
          </div>

          <div>
            <h3 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--display-family)',
              lineHeight: 1.2,
            }}>
              {activeItem.title}
            </h3>
            <p style={{
              margin: '8px 0 0',
              fontSize: 14,
              color: 'var(--text-secondary)',
              maxWidth: 400,
              lineHeight: 1.6,
            }}>
              {activeItem.description}
            </p>
          </div>

          <Space size={10} wrap>
            {activeItem.actions.map(action => (
              <Button
                key={action.route}
                type={action.primary ? 'primary' : 'default'}
                icon={<ArrowRightOutlined />}
                onClick={() => router.push(action.route)}
                style={action.primary ? {
                  background: 'var(--primary-color)',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 40,
                } : {
                  borderRadius: 8,
                  height: 40,
                  fontWeight: 500,
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                {action.label}
              </Button>
            ))}
          </Space>
        </div>
      </div>
    </div>
  )
}
