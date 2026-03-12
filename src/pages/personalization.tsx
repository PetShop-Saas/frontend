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
  Space,
  Avatar,
  Image,
} from 'antd'
import {
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined,
  BgColorsOutlined,
  PictureOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { apiService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import PageSkeleton from '../components/common/PageSkeleton'

const { Option } = Select

interface PersonalizationSettings {
  bannerUrl: string
  logoUrl: string
  bannerHeight: number
  logoSize: number
  primaryColor: string
  secondaryColor: string
  sidebarColor: string
  headerColor: string
  borderRadius: number
  fontSize: number
  fontFamily: string
  sidebarCollapsed: boolean
  showBanner: boolean
  showLogo: boolean
  siteName: string
  siteDescription: string
  siteTagline: string
}

const sectionLabelStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-secondary)',
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
    siteName: 'PetFlow',
    siteDescription: 'Sistema de gestão para petshops',
    siteTagline: 'Cuidando do seu melhor amigo',
  })

  const [colorPreview, setColorPreview] = useState({
    primaryColor: '#16a34a',
    secondaryColor: '#15803d',
    sidebarColor: '#064e3b',
    headerColor: '#ffffff',
  })

  const updateColorPreview = (fieldName: string, value: string) => {
    const cleanValue = typeof value === 'string' ? value : '#16a34a'
    setColorPreview(prev => ({ ...prev, [fieldName]: cleanValue }))
  }

  const handleColorChange = (fieldName: string, value: string) => {
    const cleanValue = typeof value === 'string' ? value : '#16a34a'
    updateColorPreview(fieldName, cleanValue)
    form.setFieldsValue({ [fieldName]: cleanValue })
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (!token || !user) {
      message.error('Você precisa estar logado para acessar as personalizações')
      router.push('/login')
      return
    }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadSettings = async () => {
    try {
      setLoading(true)

      const settingsData = await apiService.getPersonalizationSettings()

      if (settingsData) {
        const personalizationData = {
          bannerUrl: (settingsData as any).bannerUrl || '',
          logoUrl: (settingsData as any).logoUrl || '',
          bannerHeight: (settingsData as any).bannerHeight ?? null,
          logoSize: (settingsData as any).logoSize ?? null,
          primaryColor: typeof (settingsData as any).primaryColor === 'string' ? (settingsData as any).primaryColor : null,
          secondaryColor: typeof (settingsData as any).secondaryColor === 'string' ? (settingsData as any).secondaryColor : null,
          sidebarColor: typeof (settingsData as any).sidebarColor === 'string' ? (settingsData as any).sidebarColor : null,
          headerColor: typeof (settingsData as any).headerColor === 'string' ? (settingsData as any).headerColor : null,
          borderRadius: (settingsData as any).borderRadius ?? null,
          fontSize: (settingsData as any).fontSize ?? null,
          fontFamily: typeof (settingsData as any).fontFamily === 'string' ? (settingsData as any).fontFamily : null,
          sidebarCollapsed: (settingsData as any).sidebarCollapsed ?? null,
          showBanner: (settingsData as any).showBanner ?? null,
          showLogo: (settingsData as any).showLogo ?? null,
          siteName: typeof (settingsData as any).siteName === 'string' ? (settingsData as any).siteName : null,
          siteDescription: typeof (settingsData as any).siteDescription === 'string' ? (settingsData as any).siteDescription : null,
          siteTagline: typeof (settingsData as any).siteTagline === 'string' ? (settingsData as any).siteTagline : null,
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
        if (personalizationData.bannerUrl && personalizationData.bannerUrl.startsWith('/images/')) {
          personalizationData.bannerUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${personalizationData.bannerUrl}?token=${token}`
        }
        if (personalizationData.logoUrl && personalizationData.logoUrl.startsWith('/images/')) {
          personalizationData.logoUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${personalizationData.logoUrl}?token=${token}`
        }

        setSettings(personalizationData)
        form.setFieldsValue(personalizationData)
        setColorPreview({
          primaryColor: personalizationData.primaryColor,
          secondaryColor: personalizationData.secondaryColor,
          sidebarColor: personalizationData.sidebarColor,
          headerColor: personalizationData.headerColor,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      message.error('Erro ao carregar configurações de personalização')
    } finally {
      setLoading(false)
    }
  }

  const createUploadProps = (fieldName: string, category: string) => ({
    name: 'file',
    action: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/images/upload`,
    headers: {
      authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
    data: { category },
    beforeUpload(file: File) {
      const isValidType = file.type.startsWith('image/')
      if (!isValidType) {
        message.error('Apenas arquivos de imagem são permitidos!')
        return false
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('O arquivo deve ser menor que 5MB!')
        return false
      }
      return true
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} enviado com sucesso!`)
        const response = info.file.response
        if (response && response.success && response.image) {
          const imageId = response.image.id
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
          const finalUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/images/${imageId}?token=${token}`
          form.setFieldsValue({ [fieldName]: finalUrl })
          setSettings(prev => ({ ...prev, [fieldName]: finalUrl }))
          if (fieldName === 'bannerUrl') {
            form.setFieldsValue({ bannerImageId: imageId })
          } else if (fieldName === 'logoUrl') {
            form.setFieldsValue({ logoImageId: imageId })
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

  const handleSave = async () => {
    try {
      setSaving(true)
      const values = await form.validateFields()

      const settingsToSave: any = {}
      Object.keys(values).forEach(key => {
        const value = values[key]
        if (key === 'fontSize' || key === 'borderRadius' || key === 'bannerHeight' || key === 'logoSize') {
          settingsToSave[key] = value !== null && value !== undefined ? Number(value) : null
        } else if (key === 'sidebarCollapsed' || key === 'showBanner' || key === 'showLogo') {
          settingsToSave[key] = Boolean(value)
        } else {
          settingsToSave[key] = value !== null && value !== undefined ? String(value) : null
        }
      })

      const response = await apiService.updatePersonalizationSettings(settingsToSave)
      message.success('Personalizações salvas com sucesso!')

      if (response && (response as any).settings) {
        const updatedSettings = (response as any).settings
        setSettings(prev => ({ ...prev, ...updatedSettings }))
        form.setFieldsValue(updatedSettings)
      } else {
        await loadSettings()
      }

      if (typeof window !== 'undefined') {
        const finalSettings = response && (response as any).settings ? (response as any).settings : settingsToSave
        window.dispatchEvent(new CustomEvent('personalizationUpdated', { detail: finalSettings }))
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      if (error.errorFields) {
        message.error('Por favor, corrija os erros no formulário')
      } else {
        message.error('Erro ao salvar personalizações')
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    setPreviewMode(!previewMode)
    if (!previewMode) {
      message.info('Modo preview ativado')
    }
  }

  const handleReset = () => {
    const defaultSettings: PersonalizationSettings = {
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
      siteName: 'PetFlow',
      siteDescription: 'Sistema de gestão para petshops',
      siteTagline: 'Cuidando do seu melhor amigo',
    }
    form.setFieldsValue(defaultSettings)
    setSettings(defaultSettings)
    setColorPreview({
      primaryColor: defaultSettings.primaryColor,
      secondaryColor: defaultSettings.secondaryColor,
      sidebarColor: defaultSettings.sidebarColor,
      headerColor: defaultSettings.headerColor,
    })
    message.success('Configurações resetadas para os valores padrão')
  }

  const pageHeader = (
    <PageHeader
      title="Personalização"
      subtitle="Configure a aparência do seu petshop"
      breadcrumb={[{ label: 'Configurações' }, { label: 'Personalização' }]}
      actions={
        <>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Redefinir
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            Salvar
          </Button>
        </>
      }
    />
  )

  if (loading) {
    return (
      <div>
        {pageHeader}
        <div style={{ padding: '0 24px 24px' }}>
          <PageSkeleton type="detail" />
        </div>
      </div>
    )
  }

  const FALLBACK_IMG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN'

  return (
    <div>
      {pageHeader}

      <div style={{ padding: '0 24px 24px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <span style={sectionLabelStyle}>
                  <SettingOutlined />
                  Configurações Principais
                </span>
              }
              style={{ marginBottom: 24 }}
            >
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
                    <Form.Item label="Descrição" name="siteDescription">
                      <Input placeholder="Ex: Sistema de gestão para petshops" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label="Tagline" name="siteTagline">
                      <Input placeholder="Ex: Cuidando do seu melhor amigo" />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            <Card
              title={
                <span style={sectionLabelStyle}>
                  <PictureOutlined />
                  Banner e Logo
                </span>
              }
              style={{ marginBottom: 24 }}
            >
              <Form form={form} layout="vertical">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item label="URL do Banner">
                      <Form.Item name="bannerUrl" noStyle>
                        <Input placeholder="https://exemplo.com/banner.jpg" />
                      </Form.Item>
                      <div style={{ marginTop: 8 }}>
                        <Upload {...createUploadProps('bannerUrl', 'BANNER')}>
                          <Button icon={<UploadOutlined />}>Upload Banner</Button>
                        </Upload>
                      </div>
                      {settings.bannerUrl && (
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Preview:</span>
                          <div style={{ marginTop: 4 }}>
                            <Image
                              src={settings.bannerUrl}
                              alt="Banner Preview"
                              style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'cover' }}
                              fallback={FALLBACK_IMG}
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
                      <div style={{ marginTop: 8 }}>
                        <Upload {...createUploadProps('logoUrl', 'LOGO')}>
                          <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                      </div>
                      {settings.logoUrl && (
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Preview:</span>
                          <div style={{ marginTop: 4 }}>
                            <Image
                              src={settings.logoUrl}
                              alt="Logo Preview"
                              style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                              fallback={FALLBACK_IMG}
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

            <Card
              title={
                <span style={sectionLabelStyle}>
                  <BgColorsOutlined />
                  Cores do Tema
                </span>
              }
              style={{ marginBottom: 24 }}
            >
              <Form form={form} layout="vertical">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Cor Primária"
                      name="primaryColor"
                      rules={[
                        { required: true, message: 'Cor primária é obrigatória' },
                        { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Formato inválido (ex: #16a34a)' },
                      ]}
                    >
                      <Input
                        placeholder="#16a34a"
                        onChange={e => handleColorChange('primaryColor', e.target.value)}
                        prefix={
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: colorPreview.primaryColor,
                              borderRadius: 4,
                              marginRight: 8,
                            }}
                          />
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Cor Secundária"
                      name="secondaryColor"
                      rules={[
                        { required: true, message: 'Cor secundária é obrigatória' },
                        { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Formato inválido (ex: #15803d)' },
                      ]}
                    >
                      <Input
                        placeholder="#15803d"
                        onChange={e => handleColorChange('secondaryColor', e.target.value)}
                        prefix={
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: colorPreview.secondaryColor,
                              borderRadius: 4,
                              marginRight: 8,
                            }}
                          />
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Cor da Sidebar"
                      name="sidebarColor"
                      rules={[
                        { required: true, message: 'Cor da sidebar é obrigatória' },
                        { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Formato inválido (ex: #064e3b)' },
                      ]}
                    >
                      <Input
                        placeholder="#064e3b"
                        onChange={e => handleColorChange('sidebarColor', e.target.value)}
                        prefix={
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: colorPreview.sidebarColor,
                              borderRadius: 4,
                              marginRight: 8,
                            }}
                          />
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Cor do Header"
                      name="headerColor"
                      rules={[
                        { required: true, message: 'Cor do header é obrigatória' },
                        { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Formato inválido (ex: #ffffff)' },
                      ]}
                    >
                      <Input
                        placeholder="#ffffff"
                        onChange={e => handleColorChange('headerColor', e.target.value)}
                        prefix={
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: colorPreview.headerColor,
                              borderRadius: 4,
                              marginRight: 8,
                              border: '1px solid #d9d9d9',
                            }}
                          />
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            <Card
              title={
                <span style={sectionLabelStyle}>
                  <EyeOutlined />
                  Configurações Visuais
                </span>
              }
            >
              <Form form={form} layout="vertical">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Bordas Arredondadas (px)" name="borderRadius">
                      <Input type="number" min={0} max={20} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Tamanho da Fonte (px)" name="fontSize">
                      <Input type="number" min={10} />
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
                    <Form.Item
                      label="Sidebar Colapsada por Padrão"
                      name="sidebarCollapsed"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <span style={sectionLabelStyle}>
                  <EyeOutlined />
                  Preview
                </span>
              }
              style={{ marginBottom: 24 }}
            >
              <div style={{ textAlign: 'center' }}>
                {settings.showBanner && settings.bannerUrl && (
                  <div style={{ marginBottom: 16 }}>
                    <Image
                      src={settings.bannerUrl}
                      alt="Banner Preview"
                      style={{
                        width: '100%',
                        height: settings.bannerHeight,
                        borderRadius: settings.borderRadius,
                        objectFit: 'cover',
                      }}
                      fallback={FALLBACK_IMG}
                    />
                  </div>
                )}

                {settings.showLogo && settings.logoUrl && (
                  <div style={{ marginBottom: 16 }}>
                    <Avatar
                      size={settings.logoSize}
                      src={settings.logoUrl}
                      style={{ borderRadius: settings.borderRadius }}
                    />
                  </div>
                )}

                <div
                  style={{
                    padding: 16,
                    backgroundColor: settings.primaryColor,
                    borderRadius: settings.borderRadius,
                    color: 'white',
                  }}
                >
                  <h4
                    style={{
                      color: 'white',
                      margin: 0,
                      fontFamily: 'var(--display-family)',
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    {settings.siteName}
                  </h4>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontSize: 13 }}>
                    {settings.siteDescription}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              title={
                <span style={sectionLabelStyle}>
                  <SettingOutlined />
                  Ações
                </span>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  style={{ width: '100%' }}
                >
                  {previewMode ? 'Sair do Preview' : 'Preview'}
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
