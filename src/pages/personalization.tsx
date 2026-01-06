import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Switch, 
  Select, 
  message, 
  Row, 
  Col, 
  Divider, 
  Typography, 
  Space,
  Avatar,
  Image,
  Spin
} from 'antd'
import { 
  UploadOutlined, 
  SaveOutlined, 
  ReloadOutlined, 
  EyeOutlined,
  BgColorsOutlined,
  PictureOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'

const { Title, Text } = Typography
const { Option } = Select

interface PersonalizationSettings {
  // Banner e Logo
  bannerUrl: string
  logoUrl: string
  bannerHeight: number
  logoSize: number
  
  // Cores do tema
  primaryColor: string
  secondaryColor: string
  sidebarColor: string
  headerColor: string
  
  // Configurações visuais
  borderRadius: number
  fontSize: number
  fontFamily: string
  
  // Layout
  sidebarCollapsed: boolean
  showBanner: boolean
  showLogo: boolean
  
  // Configurações do site
  siteName: string
  siteDescription: string
  siteTagline: string
}

export default function Personalization() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  
  const [settings, setSettings] = useState<PersonalizationSettings>({
    bannerUrl: '',
    logoUrl: '',
    bannerHeight: 80,
    logoSize: 60,
    primaryColor: '#16a34a',
    secondaryColor: '#15803d',
    sidebarColor: '#064e3b',
    headerColor: '#ffffff',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    sidebarCollapsed: false,
    showBanner: true,
    showLogo: true,
    siteName: 'PetShop',
    siteDescription: 'Sistema de gestão para petshops',
    siteTagline: 'Cuidando do seu melhor amigo'
  })
  
  const [colorPreview, setColorPreview] = useState({
    primaryColor: '#16a34a',
    secondaryColor: '#15803d',
    sidebarColor: '#064e3b',
    headerColor: '#ffffff'
  })

  const updateColorPreview = (fieldName: string, value: string) => {
    // Garantir que o valor seja uma string válida
    const cleanValue = typeof value === 'string' ? value : '#16a34a'
    setColorPreview(prev => ({ ...prev, [fieldName]: cleanValue }))
  }

  const handleColorChange = (fieldName: string, value: string) => {
    // Garantir que o valor seja uma string válida
    const cleanValue = typeof value === 'string' ? value : '#16a34a'
    updateColorPreview(fieldName, cleanValue)
    form.setFieldsValue({ [fieldName]: cleanValue })
  }

  useEffect(() => {
    // Verificar se estamos no lado do cliente
    if (typeof window === 'undefined') return
    
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      message.error('Você precisa estar logado para acessar as personalizações')
      router.push('/login')
      return
    }

    // Verificar se o usuário é admin
    try {
      const userData = JSON.parse(user)
      if (userData.role !== 'ADMIN') {
        message.error('Apenas administradores podem personalizar o sistema')
        router.push('/')
        return
      }
    } catch (error) {
      message.error('Erro ao verificar permissões')
      router.push('/login')
      return
    }

    loadSettings()
  }, [router])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Carregar configurações do backend
      const settingsData = await apiService.getPersonalizationSettings()
      
      if (settingsData) {
        const personalizationData = {
          bannerUrl: (settingsData as any).bannerUrl || '',
          logoUrl: (settingsData as any).logoUrl || '',
          bannerHeight: (settingsData as any).bannerHeight || 80,
          logoSize: (settingsData as any).logoSize || 60,
          primaryColor: typeof (settingsData as any).primaryColor === 'string' ? (settingsData as any).primaryColor : '#16a34a',
          secondaryColor: typeof (settingsData as any).secondaryColor === 'string' ? (settingsData as any).secondaryColor : '#15803d',
          sidebarColor: typeof (settingsData as any).sidebarColor === 'string' ? (settingsData as any).sidebarColor : '#064e3b',
          headerColor: typeof (settingsData as any).headerColor === 'string' ? (settingsData as any).headerColor : '#ffffff',
          borderRadius: (settingsData as any).borderRadius || 8,
          fontSize: (settingsData as any).fontSize || 14,
          fontFamily: (settingsData as any).fontFamily || 'Inter, sans-serif',
          sidebarCollapsed: (settingsData as any).sidebarCollapsed || false,
          showBanner: (settingsData as any).showBanner !== false,
          showLogo: (settingsData as any).showLogo !== false,
          siteName: (settingsData as any).siteName || 'PetShop',
          siteDescription: (settingsData as any).siteDescription || 'Sistema de gestão para petshops',
          siteTagline: (settingsData as any).siteTagline || 'Cuidando do seu melhor amigo'
        }
        
        // Converter URLs de imagens para URLs com token
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        if (personalizationData.bannerUrl && personalizationData.bannerUrl.startsWith('/images/')) {
          personalizationData.bannerUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${personalizationData.bannerUrl}?token=${token}`
        }
        if (personalizationData.logoUrl && personalizationData.logoUrl.startsWith('/images/')) {
          personalizationData.logoUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${personalizationData.logoUrl}?token=${token}`
        }
        
        // Atualizar o estado e o formulário
        setSettings(personalizationData)
        form.setFieldsValue(personalizationData)
        setColorPreview({
          primaryColor: personalizationData.primaryColor,
          secondaryColor: personalizationData.secondaryColor,
          sidebarColor: personalizationData.sidebarColor,
          headerColor: personalizationData.headerColor
        })
      }
    } catch (error) {

      if (!isValidType) {
        message.error('Apenas arquivos de imagem são permitidos!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('O arquivo deve ser menor que 5MB!');
        return false;
      }
      return true;
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} enviado com sucesso!`)
        const response = info.file.response;
        
        if (response && response.success && response.image) {
          const imageId = response.image.id;
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
          const finalUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/images/${imageId}?token=${token}`;
          
          // Atualizar o campo específico baseado no fieldName
          form.setFieldsValue({ [fieldName]: finalUrl });
          // Atualizar também o estado local
          setSettings(prev => ({ ...prev, [fieldName]: finalUrl }));
          
          // Salvar o ID da imagem para uso posterior
          if (fieldName === 'bannerUrl') {
            form.setFieldsValue({ bannerImageId: imageId });
          } else if (fieldName === 'logoUrl') {
            form.setFieldsValue({ logoImageId: imageId });
          }
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} falha no upload.`)

      }
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    accept: 'image/*',
    multiple: false,
    withCredentials: false,
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          <BgColorsOutlined className="mr-2" />
          Personalização do Sistema
        </Title>
        <Text type="secondary">
          Personalize a aparência e configurações visuais do seu sistema
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Configurações Principais */}
        <Col xs={24} lg={16}>
          <Card title={<><SettingOutlined className="mr-2" />Configurações Principais</>} className="mb-6">
            <Form
              form={form}
              layout="vertical"
              initialValues={settings}
              onValuesChange={(changedValues, allValues) => {
                setSettings({ ...settings, ...allValues })
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Nome do Site"
                    name="siteName"
                    rules={[{ required: true, message: 'Nome do site é obrigatório' }]}
                  >
                    <Input placeholder="Ex: PetShop do João" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Descrição"
                    name="siteDescription"
                  >
                    <Input placeholder="Ex: Sistema de gestão para petshops" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Tagline"
                    name="siteTagline"
                  >
                    <Input placeholder="Ex: Cuidando do seu melhor amigo" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Banner e Logo */}
          <Card title={<><PictureOutlined className="mr-2" />Banner e Logo</>} className="mb-6">
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="URL do Banner">
                    <Form.Item name="bannerUrl" noStyle>
                      <Input placeholder="https://exemplo.com/banner.jpg" />
                    </Form.Item>
                    <Upload {...createUploadProps('bannerUrl', 'BANNER')} className="mt-2">
                      <Button icon={<UploadOutlined />}>Upload Banner</Button>
                    </Upload>
                    {settings.bannerUrl && (
                      <div className="mt-2">
                        <Text type="secondary">Preview:</Text>
                        <div className="mt-1">
                          <Image
                            src={settings.bannerUrl}
                            alt="Banner Preview"
                            style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'cover' }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                          />
                        </div>
                      </div>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="URL do Logo">
                    <Form.Item name="logoUrl" noStyle>
                      <Input placeholder="https://exemplo.com/logo.png" />
                    </Form.Item>
                    <Upload {...createUploadProps('logoUrl', 'LOGO')} className="mt-2">
                      <Button icon={<UploadOutlined />}>Upload Logo</Button>
                    </Upload>
                    {settings.logoUrl && (
                      <div className="mt-2">
                        <Text type="secondary">Preview:</Text>
                        <div className="mt-1">
                          <Image
                            src={settings.logoUrl}
                            alt="Logo Preview"
                            style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                          />
                        </div>
                      </div>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Altura do Banner (px)" name="bannerHeight">
                    <Input type="number" min={40} max={200} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tamanho do Logo (px)" name="logoSize">
                    <Input type="number" min={20} max={120} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Mostrar Banner" name="showBanner" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Mostrar Logo" name="showLogo" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Cores do Tema */}
          <Card title={<><BgColorsOutlined className="mr-2" />Cores do Tema</>} className="mb-6">
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Cor Primária" 
                    name="primaryColor"
                    rules={[
                      { required: true, message: 'Cor primária é obrigatória' },
                      { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Formato inválido (ex: #16a34a)' }
                    ]}
                  >
                    <Input 
                      placeholder="#16a34a" 
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      prefix={<div style={{ width: 20, height: 20, backgroundColor: colorPreview.primaryColor, borderRadius: 4, marginRight: 8 }} />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Cor Secundária" 
                    name="secondaryColor"
                    rules={[
                      { required: true, message: 'Cor secundária é obrigatória' },
                      { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Formato inválido (ex: #15803d)' }
                    ]}
                  >
                    <Input 
                      placeholder="#15803d" 
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      prefix={<div style={{ width: 20, height: 20, backgroundColor: colorPreview.secondaryColor, borderRadius: 4, marginRight: 8 }} />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Cor da Sidebar" 
                    name="sidebarColor"
                    rules={[
                      { required: true, message: 'Cor da sidebar é obrigatória' },
                      { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Formato inválido (ex: #064e3b)' }
                    ]}
                  >
                    <Input 
                      placeholder="#064e3b" 
                      onChange={(e) => handleColorChange('sidebarColor', e.target.value)}
                      prefix={<div style={{ width: 20, height: 20, backgroundColor: colorPreview.sidebarColor, borderRadius: 4, marginRight: 8 }} />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Cor do Header" 
                    name="headerColor"
                    rules={[
                      { required: true, message: 'Cor do header é obrigatória' },
                      { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Formato inválido (ex: #ffffff)' }
                    ]}
                  >
                    <Input 
                      placeholder="#ffffff" 
                      onChange={(e) => handleColorChange('headerColor', e.target.value)}
                      prefix={<div style={{ width: 20, height: 20, backgroundColor: colorPreview.headerColor, borderRadius: 4, marginRight: 8, border: '1px solid #d9d9d9' }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Configurações Visuais */}
          <Card title={<><EyeOutlined className="mr-2" />Configurações Visuais</>}>
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item label="Bordas Arredondadas (px)" name="borderRadius">
                    <Input type="number" min={0} max={20} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Tamanho da Fonte (px)" name="fontSize">
                    <Input type="number" min={10} max={20} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Fonte" name="fontFamily">
                    <Select>
                      <Option value="Inter, sans-serif">Inter</Option>
                      <Option value="Roboto, sans-serif">Roboto</Option>
                      <Option value="Open Sans, sans-serif">Open Sans</Option>
                      <Option value="Poppins, sans-serif">Poppins</Option>
                      <Option value="Montserrat, sans-serif">Montserrat</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Sidebar Colapsada por Padrão" name="sidebarCollapsed" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Preview e Ações */}
        <Col xs={24} lg={8}>
          {/* Preview */}
          <Card title="Preview" className="mb-6">
            <div className="text-center">
              {settings.showBanner && settings.bannerUrl && (
                <div className="mb-4">
                  <Image
                    src={settings.bannerUrl}
                    alt="Banner Preview"
                    style={{ 
                      width: '100%', 
                      height: settings.bannerHeight,
                      borderRadius: settings.borderRadius,
                      objectFit: 'cover'
                    }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                </div>
              )}
              
              {settings.showLogo && settings.logoUrl && (
                <div className="mb-4">
                  <Avatar
                    size={settings.logoSize}
                    src={settings.logoUrl}
                    style={{ borderRadius: settings.borderRadius }}
                  />
                </div>
              )}
              
              <div className="p-4" style={{ 
                backgroundColor: settings.primaryColor,
                borderRadius: settings.borderRadius,
                color: 'white'
              }}>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {settings.siteName}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {settings.siteDescription}
                </Text>
              </div>
            </div>
          </Card>

          {/* Ações */}
          <Card title="Ações">
            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                className="w-full bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-3"
                style={{
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a',
                  color: 'white'
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
                Salvar Personalizações
              </Button>
              
              <Button
                icon={<EyeOutlined />}
                onClick={handlePreview}
                className="w-full px-6 py-2"
              >
                {previewMode ? 'Sair do Preview' : 'Preview'}
              </Button>
              
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                className="w-full px-6 py-2"
              >
                Resetar Padrões
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
