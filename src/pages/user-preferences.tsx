import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { 
  Card, 
  Button, 
  message, 
  Space, 
  Typography, 
  Switch,
  Divider,
  Spin,
  Alert
} from 'antd'
import { 
  SettingOutlined, 
  SaveOutlined, 
  BellOutlined,
  MailOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons'
import { apiService } from '../services/api'

const { Title, Text } = Typography

interface UserPreferences {
  enableNotifications: boolean
  enableEmailNotifications: boolean
  enablePushNotifications: boolean
  emailMarketing: boolean
}

export default function UserPreferences() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    enableNotifications: true,
    enableEmailNotifications: true,
    enablePushNotifications: true,
    emailMarketing: false
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      message.error('Você precisa estar logado para acessar as preferências')
      router.push('/login')
      return
    }

    loadPreferences()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      
      // Carregar preferências do usuário do backend
      const userPreferences = await apiService.getUserPreferences() as any
      
      if (userPreferences) {
        setPreferences({
          enableNotifications: userPreferences.enableNotifications ?? true,
          enableEmailNotifications: userPreferences.enableEmailNotifications ?? true,
          enablePushNotifications: userPreferences.enablePushNotifications ?? true,
          emailMarketing: userPreferences.emailMarketing ?? false
        })
      } else {
        // Valores padrão
        setPreferences({
          enableNotifications: true,
          enableEmailNotifications: true,
          enablePushNotifications: true,
          emailMarketing: false
        })
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
      // Tentar carregar do localStorage como fallback
      const savedPreferences = localStorage.getItem('userPreferences')
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      } else {
        // Valores padrão em caso de erro
        setPreferences({
          enableNotifications: true,
          enableEmailNotifications: true,
          enablePushNotifications: true,
          emailMarketing: false
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Salvar preferências do usuário no backend
      await apiService.updateUserPreferences(preferences)
      
      // Também salvar no localStorage como backup
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      
      message.success('Preferências salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      message.error('Erro ao salvar preferências. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Minhas Preferências</h1>
          <p className="text-gray-600">Gerencie suas preferências pessoais e notificações</p>
        </div>

        <Card>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SettingOutlined className="text-green-600 text-xl" />
              <Title level={4} className="mb-0">Preferências de Notificações</Title>
            </div>
            
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
              Salvar Preferências
            </Button>
          </div>

          <Alert
            message="Informação"
            description="Essas configurações afetam apenas você. As configurações do sistema são gerenciadas pelo administrador."
            type="info"
            icon={<InfoCircleOutlined />}
            className="mb-6"
          />

          <div className="space-y-6">
            {/* Notificações Gerais */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <BellOutlined className="text-green-600 text-xl" />
                <div>
                  <Text strong className="text-base">Notificações Gerais</Text>
                  <div className="text-sm text-gray-500">
                    Ative ou desative todas as notificações do sistema
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>Receber Notificações</Text>
                  <div className="text-sm text-gray-500">
                    Ative para receber notificações do sistema
                  </div>
                </div>
                <Switch
                  checked={preferences.enableNotifications}
                  onChange={(checked) => setPreferences({...preferences, enableNotifications: checked})}
                  size="default"
                />
              </div>
            </div>

            <Divider />

            {/* Notificações por Email */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <MailOutlined className="text-green-600 text-xl" />
                <div>
                  <Text strong className="text-base">Notificações por Email</Text>
                  <div className="text-sm text-gray-500">
                    Configure como você deseja receber notificações por email
                  </div>
                </div>
              </div>
              
              <Space direction="vertical" className="w-full" size="middle">
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>Notificações por Email</Text>
                    <div className="text-sm text-gray-500">
                      Receba notificações importantes por email
                    </div>
                  </div>
                  <Switch
                    checked={preferences.enableEmailNotifications}
                    onChange={(checked) => setPreferences({...preferences, enableEmailNotifications: checked})}
                    disabled={!preferences.enableNotifications}
                    size="default"
                  />
                </div>
                
                <Divider className="my-2" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>Marketing por Email</Text>
                    <div className="text-sm text-gray-500">
                      Receba emails promocionais e novidades do sistema
                    </div>
                  </div>
                  <Switch
                    checked={preferences.emailMarketing}
                    onChange={(checked) => setPreferences({...preferences, emailMarketing: checked})}
                    disabled={!preferences.enableNotifications}
                    size="default"
                  />
                </div>
              </Space>
            </div>

            <Divider />

            {/* Notificações Push */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <BellOutlined className="text-green-600 text-xl" />
                <div>
                  <Text strong className="text-base">Notificações Push</Text>
                  <div className="text-sm text-gray-500">
                    Receba notificações em tempo real no navegador
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>Ativar Notificações Push</Text>
                  <div className="text-sm text-gray-500">
                    Permita que o sistema envie notificações push no navegador
                  </div>
                </div>
                <Switch
                  checked={preferences.enablePushNotifications}
                  onChange={(checked) => setPreferences({...preferences, enablePushNotifications: checked})}
                  disabled={!preferences.enableNotifications}
                  size="default"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
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
              Salvar Preferências
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

