import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Tabs, Card, Button, Space } from 'antd'
import { CalendarOutlined, ToolOutlined, ShoppingCartOutlined, PlusOutlined } from '@ant-design/icons'

import PageHeader from '../components/common/PageHeader'

const { TabPane } = Tabs

export default function Operations() {
  const [activeTab, setActiveTab] = useState('appointments')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  return (
    <div>
      <div className="p-6">
        <PageHeader 
          title="Operações Diárias"
          subtitle="Agendamentos, serviços e vendas em um só lugar"
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          <TabPane
            key="appointments"
            tab={
              <span>
                <CalendarOutlined /> Agendamentos
              </span>
            }
          >
            <Card>
              <div className="text-center py-8">
                <CalendarOutlined className="text-6xl text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gestão de Agendamentos</h3>
                <p className="text-gray-600 mb-6">
                  Gerencie todos os agendamentos de consultas e serviços
                </p>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => router.push('/appointments')}
                    style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                  >
                    Ver Agendamentos
                  </Button>
                  <Button 
                    icon={<PlusOutlined />}
                    onClick={() => router.push('/calendar')}
                  >
                    Ver Calendário
                  </Button>
                </Space>
              </div>
            </Card>
          </TabPane>

          <TabPane
            key="services"
            tab={
              <span>
                <ToolOutlined /> Serviços
              </span>
            }
          >
            <Card>
              <div className="text-center py-8">
                <ToolOutlined className="text-6xl text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Catálogo de Serviços</h3>
                <p className="text-gray-600 mb-6">
                  Configure e gerencie os serviços oferecidos pelo petshop
                </p>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => router.push('/services')}
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                >
                  Gerenciar Serviços
                </Button>
              </div>
            </Card>
          </TabPane>

          <TabPane
            key="sales"
            tab={
              <span>
                <ShoppingCartOutlined /> Vendas
              </span>
            }
          >
            <Card>
              <div className="text-center py-8">
                <ShoppingCartOutlined className="text-6xl text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gestão de Vendas</h3>
                <p className="text-gray-600 mb-6">
                  Controle todas as vendas de produtos e serviços
                </p>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => router.push('/sales')}
                    style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                  >
                    Ver Vendas
                  </Button>
                  <Button 
                    icon={<PlusOutlined />}
                    onClick={() => router.push('/products')}
                  >
                    Ver Produtos
                  </Button>
                </Space>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}



