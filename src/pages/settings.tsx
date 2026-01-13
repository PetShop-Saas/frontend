import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService } from '../services/api'
import { 
  Card, 
  Button, 
  message, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Input,
  Switch,
  Divider,
  Alert,
  Spin
} from 'antd'
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons'

const { Title, Text } = Typography


interface SettingsData {
  enableNotifications: boolean
  enableEmailMarketing: boolean
  maintenanceMode: boolean
  disabledSidebarItems: string[] // Array de paths das abas desabilitadas
}


export default function Settings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    enableNotifications: true,
    enableEmailMarketing: false,
    maintenanceMode: false,
    disabledSidebarItems: []
  })

  useEffect(() => {
    const checkAccess = async () => {
      // Verificar se o usuário está logado
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        message.error('Você precisa estar logado para acessar as configurações')
        router.push('/login')
        return
      }

      // Verificar se o usuário é ADMIN (apenas admin pode acessar configurações do sistema)
      try {
        const userData = JSON.parse(user)
        const isAdmin = userData.role === 'ADMIN' || userData.planRole === 'ADMIN'
        
        if (!isAdmin) {
          message.error('Acesso negado. Apenas administradores podem acessar as configurações do sistema.')
          router.push('/')
          return
        }

        // Se chegou aqui, é admin - autorizar acesso
        setIsAuthorized(true)
        await loadSettings()
      } catch (error) {
        message.error('Erro ao verificar permissões')
        router.push('/login')
        return
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadSettings = async () => {
    try {
      // Carregar apenas configurações do sistema
      const settingsData = await apiService.getPersonalizationSettings()
      
      if (settingsData) {
        const newSettings = {
          enableNotifications: (settingsData as any).enableNotifications !== false,
          enableEmailMarketing: (settingsData as any).enableEmailMarketing === true,
          maintenanceMode: (settingsData as any).maintenanceMode === true,
          disabledSidebarItems: (settingsData as any).disabledSidebarItems || []
        }
        
        setSettings(newSettings)
      }
    } catch (error) {
      message.error('Erro ao carregar configurações')
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Salvar apenas configurações do sistema
      await apiService.updateSettings(settings)
      
      message.success('Configurações do sistema salvas com sucesso!')
    } catch (error) {
      message.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      enableNotifications: true,
      enableEmailMarketing: false,
      maintenanceMode: false,
      disabledSidebarItems: []
    })
    message.info('Configurações resetadas para os valores padrão')
  }

  // Lista de todas as abas disponíveis no sistema
  const availableSidebarItems = [
    { path: '/customers', label: 'Clientes' },
    { path: '/pets', label: 'Pets' },
    { path: '/appointments', label: 'Agendamentos' },
    { path: '/calendar', label: 'Calendário' },
    { path: '/services', label: 'Serviços' },
    { path: '/products', label: 'Produtos' },
    { path: '/sales', label: 'Vendas' },
    { path: '/suppliers', label: 'Fornecedores' },
    { path: '/purchases', label: 'Compras' },
    { path: '/medical-records', label: 'Histórico Médico' },
    { path: '/financial-reports', label: 'Relatórios Financeiros' },
    { path: '/communications', label: 'Comunicação' },
    { path: '/notifications', label: 'Notificações' },
    { path: '/tickets', label: 'Suporte' },
    { path: '/hotel', label: 'Hotel' },
    { path: '/cash-flow', label: 'Fluxo de Caixa' },
    { path: '/operations', label: 'Operações' }
  ]

  const toggleSidebarItem = (path: string) => {
    const isDisabled = settings.disabledSidebarItems.includes(path)
    if (isDisabled) {
      setSettings({
        ...settings,
        disabledSidebarItems: settings.disabledSidebarItems.filter(item => item !== path)
      })
    } else {
      setSettings({
        ...settings,
        disabledSidebarItems: [...settings.disabledSidebarItems, path]
      })
    }
  }

  // Não renderizar nada até verificar permissões
  if (loading || !isAuthorized) {
    return (
      <div>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações globais do sistema (apenas administradores)</p>
        </div>

        <Card>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SettingOutlined className="text-green-600 text-xl" />
              <Title level={4} className="mb-0">Configurações Gerais</Title>
            </div>
            
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadSettings}
                size="large"
                className="px-6 py-3 hover:bg-gray-50 hover:border-gray-300"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#d1d5db',
                  color: '#374151'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.borderColor = '#9ca3af'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
              >
                Atualizar
              </Button>
              
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-3"
                style={{
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#15803d'
                  e.currentTarget.style.borderColor = '#15803d'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#16a34a'
                  e.currentTarget.style.borderColor = '#16a34a'
                }}
                size="large"
              >
                Salvar Configurações
              </Button>
            </Space>
          </div>

          <Alert
            message="Informação"
            description="As configurações aqui definidas afetam todo o sistema. Tenha cuidado ao fazer alterações."
            type="info"
            icon={<InfoCircleOutlined />}
            className="mb-6"
          />

          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card size="small" title="Configurações do Sistema">
                <Space direction="vertical" className="w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Notificações Ativadas</Text>
                      <div className="text-sm text-gray-500">
                        Permite que o sistema envie notificações
                      </div>
                    </div>
                    <Switch
                      checked={settings.enableNotifications}
                      onChange={(checked) => setSettings({...settings, enableNotifications: checked})}
                    />
                  </div>
                  
                  <Divider />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Marketing por Email</Text>
                      <div className="text-sm text-gray-500">
                        Permite envio de campanhas de marketing
                      </div>
                    </div>
                    <Switch
                      checked={settings.enableEmailMarketing}
                      onChange={(checked) => setSettings({...settings, enableEmailMarketing: checked})}
                    />
                  </div>
                  
                  <Divider />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Modo de Manutenção</Text>
                      <div className="text-sm text-gray-500">
                        Desativa o sistema para manutenção
                      </div>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                    />
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="Gerenciar Abas da Sidebar">
                <Alert
                  message="Atenção"
                  description="Desabilite temporariamente abas que não devem aparecer na sidebar. Isso afeta todos os usuários do sistema."
                  type="warning"
                  icon={<InfoCircleOutlined />}
                  className="mb-4"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSidebarItems.map((item) => {
                    const isDisabled = settings.disabledSidebarItems.includes(item.path)
                    return (
                      <div
                        key={item.path}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isDisabled
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                        }`}
                        onClick={() => toggleSidebarItem(item.path)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <Text strong={!isDisabled} className={isDisabled ? 'text-gray-400' : ''}>
                              {item.label}
                            </Text>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.path}
                            </div>
                          </div>
                          <Switch
                            checked={!isDisabled}
                            onChange={() => toggleSidebarItem(item.path)}
                            size="small"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                {settings.disabledSidebarItems.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Text strong className="text-yellow-800">
                      {settings.disabledSidebarItems.length} aba(s) desabilitada(s)
                    </Text>
                    <div className="text-sm text-yellow-700 mt-1">
                      As abas desabilitadas não aparecerão na sidebar para nenhum usuário.
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          <div className="mt-6 flex justify-end space-x-2">
            <Button onClick={handleReset}>
              Resetar
            </Button>
            
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              className="bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2"
              style={{
                backgroundColor: '#16a34a',
                borderColor: '#16a34a'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d'
                e.currentTarget.style.borderColor = '#15803d'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a'
                e.currentTarget.style.borderColor = '#16a34a'
              }}
            >
              Salvar Configurações
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}