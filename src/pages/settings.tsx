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
import { useCep } from '../hooks/useCep'
import { formatPhone, formatCEP } from '../utils/formatting'
import { Form } from 'antd'

const { Title, Text } = Typography

interface AddressFields {
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
}

interface SettingsData {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  // Campos de endereço separados
  addressCep?: string
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
  enableNotifications: boolean
  enableEmailMarketing: boolean
  maintenanceMode: boolean
}

// Função para parsear endereço completo em campos separados
const parseAddressString = (addressStr: string): AddressFields => {
  if (!addressStr) return {}
  
  const parts = addressStr.split(',').map((p) => p.trim()).filter(Boolean)
  const address: AddressFields = {}

  // Buscar CEP
  const cepMatch = addressStr.match(/CEP:\s*(\d{5}-?\d{3})|\b(\d{5}-?\d{3})\b/i)
  if (cepMatch) {
    address.cep = cepMatch[1] || cepMatch[2]
  }

  // Buscar estado (2 letras maiúsculas)
  const stateIndex = parts.findIndex((p) => /^[A-Z]{2}$/.test(p))
  if (stateIndex >= 0) {
    address.state = parts[stateIndex]
    parts.splice(stateIndex, 1)
  }

  // Estrutura esperada: [0]=rua, [1]=número, [2]=bairro, [3]=cidade
  if (parts.length >= 1) {
    const streetMatch = parts[0].match(/^(.+?)(?:\s*,?\s*(?:nº|n\.|N°|Nº|No)\s*(\d+))?/i)
    if (streetMatch) {
      address.street = streetMatch[1].trim()
      if (streetMatch[2]) address.number = streetMatch[2]
    } else {
      address.street = parts[0]
    }
  }
  if (parts.length >= 2 && !address.number) {
    const numberMatch = parts[1].match(/(?:nº|n\.|N°|Nº|No)\s*(\d+)|^(\d+)$/i)
    if (numberMatch) {
      address.number = numberMatch[1] || numberMatch[2]
    }
  }
  if (parts.length >= 3) address.neighborhood = parts[2]
  if (parts.length >= 4) address.city = parts[3]

  return address
}

// Função para montar endereço completo a partir dos campos
const buildAddressString = (fields: Partial<SettingsData>): string => {
  const parts = []
  if (fields.addressStreet) parts.push(fields.addressStreet)
  if (fields.addressNumber) parts.push(`Nº ${fields.addressNumber}`)
  if (fields.addressComplement) parts.push(fields.addressComplement)
  if (fields.addressNeighborhood) parts.push(fields.addressNeighborhood)
  if (fields.addressCity) parts.push(fields.addressCity)
  if (fields.addressState) parts.push(fields.addressState)
  if (fields.addressCep) parts.push(`CEP: ${fields.addressCep}`)
  return parts.join(', ')
}

export default function Settings() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { loading: cepLoading, searchCep } = useCep(form)
  const [settings, setSettings] = useState<SettingsData>({
    siteName: 'PetFlow',
    siteDescription: 'Sistema de gestão para petshops',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    enableNotifications: true,
    enableEmailMarketing: false,
    maintenanceMode: false
  })

  useEffect(() => {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      message.error('Você precisa estar logado para acessar as configurações')
      router.push('/login')
      return
    }

    // Verificar se o usuário tem acesso (MANAGER ou role que permite configurações)
    try {
      const userData = JSON.parse(user)
      // Permitir acesso para MANAGER ou usuários com permissão de configurações
      // O sistema deve usar permissões mais granulares, mas por enquanto permitimos MANAGER
      if (userData.role !== 'MANAGER' && userData.planRole !== 'ADMIN') {
        message.error('Apenas gerentes podem acessar as configurações')
        router.push('/')
        return
      }
    } catch (error) {
      message.error('Erro ao verificar permissões')
      router.push('/login')
      return
    }

    loadSettings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Carregar configurações do backend (agora inclui dados do tenant)
      const settingsData = await apiService.getPersonalizationSettings()
      
      if (settingsData) {
        const addressStr = (settingsData as any).contactAddress || ''
        const parsedAddress = parseAddressString(addressStr)
        
        const newSettings = {
          siteName: (settingsData as any).siteName || 'PetShop',
          siteDescription: (settingsData as any).siteDescription || 'Sistema de gestão para petshops',
          contactEmail: (settingsData as any).contactEmail || '',
          contactPhone: (settingsData as any).contactPhone || '',
          contactAddress: addressStr,
          addressCep: parsedAddress.cep || '',
          addressStreet: parsedAddress.street || '',
          addressNumber: parsedAddress.number || '',
          addressComplement: parsedAddress.complement || '',
          addressNeighborhood: parsedAddress.neighborhood || '',
          addressCity: parsedAddress.city || '',
          addressState: parsedAddress.state || '',
          enableNotifications: (settingsData as any).enableNotifications !== false,
          enableEmailMarketing: (settingsData as any).enableEmailMarketing === true,
          maintenanceMode: (settingsData as any).maintenanceMode === true
        }
        
        setSettings(newSettings)
        
        // Preencher formulário de endereço
        form.setFieldsValue({
          addressCep: newSettings.addressCep,
          addressStreet: newSettings.addressStreet,
          addressNumber: newSettings.addressNumber,
          addressComplement: newSettings.addressComplement,
          addressNeighborhood: newSettings.addressNeighborhood,
          addressCity: newSettings.addressCity,
          addressState: newSettings.addressState,
        })
      }
    } catch (error) {
      message.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Obter valores do formulário de endereço
      const addressFields = form.getFieldsValue()
      
      // Montar endereço completo a partir dos campos separados
      const fullAddress = buildAddressString({
        ...settings,
        ...addressFields
      })
      
      // Atualizar settings com endereço completo e campos separados
      const settingsToSave = {
        ...settings,
        ...addressFields,
        contactAddress: fullAddress
      }
      
      // Salvar configurações no backend (agora atualiza tenant automaticamente)
      await apiService.updateSettings(settingsToSave)
      
      // Atualizar estado local
      setSettings(settingsToSave)
      
      message.success('Configurações salvas com sucesso!')
    } catch (error) {
      message.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      siteName: 'PetFlow',
      siteDescription: 'Sistema de gestão para petshops',
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      enableNotifications: true,
      enableEmailMarketing: false,
      maintenanceMode: false
    })
    message.info('Configurações resetadas para os valores padrão')
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações gerais do sistema</p>
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
            <Col span={12}>
              <Card size="small" title="Informações Básicas">
                <Space direction="vertical" className="w-full">
                  <div>
                    <Text strong>Nome do Site</Text>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                      placeholder="Nome do seu petshop"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Text strong>Descrição</Text>
                    <Input.TextArea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                      placeholder="Descrição do seu petshop"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Informações de Contato">
                <Space direction="vertical" className="w-full">
                  <div>
                    <Text strong>Email de Contato</Text>
                    <Input
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                      placeholder="contato@petshop.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Text strong>Telefone de Contato</Text>
                    <Input
                      value={settings.contactPhone}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '')
                        const formatted = formatPhone(raw.slice(0, 11))
                        setSettings({...settings, contactPhone: formatted})
                      }}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                      maxLength={15}
                    />
                  </div>
                  
                  <Form form={form} layout="vertical">
                    <Row gutter={8}>
                      <Col span={8}>
                        <Form.Item name="addressCep" label="CEP">
                          <Input
                            placeholder="00000-000"
                            maxLength={9}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '')
                              const formatted = formatCEP(value)
                              form.setFieldsValue({ addressCep: formatted })
                              if (value.length === 8) {
                                searchCep(value)
                              }
                            }}
                            suffix={cepLoading ? <Spin size="small" /> : null}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item name="addressStreet" label="Logradouro">
                          <Input placeholder="Rua, Avenida, etc." />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={8}>
                      <Col span={8}>
                        <Form.Item name="addressNumber" label="Número">
                          <Input placeholder="Número" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="addressNeighborhood" label="Bairro">
                          <Input placeholder="Bairro" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="addressComplement" label="Complemento">
                          <Input placeholder="Apto/Bloco (opcional)" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={8}>
                      <Col span={12}>
                        <Form.Item name="addressCity" label="Cidade">
                          <Input placeholder="Cidade" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="addressState" label="Estado (UF)">
                          <Input placeholder="SP" maxLength={2} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Space>
              </Card>
            </Col>

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