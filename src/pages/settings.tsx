import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService, extractArrayFromResponse } from '../services/api'
import {
  Card,
  Button,
  message,
  Input,
  Switch,
  Alert,
  Tabs,
  Select,
  Form
} from 'antd'
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  MailOutlined,
  LockOutlined
} from '@ant-design/icons'
import PageHeader from '../components/common/PageHeader'
import PageSkeleton from '../components/common/PageSkeleton'

const { Option } = Select
const { TextArea } = Input

interface SettingsData {
  enableNotifications: boolean
  enableEmailMarketing: boolean
  maintenanceMode: boolean
  disabledSidebarItems: string[]
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
  const [activeTab, setActiveTab] = useState('general')
  const [emailTemplates, setEmailTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [, setTemplateData] = useState<{ html: string; text: string; subject?: string } | null>(null)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateForm] = Form.useForm()

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (!token || !user) {
        message.error('Você precisa estar logado para acessar as configurações')
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(user)
        const isAdmin = userData.role === 'ADMIN' || userData.planRole === 'ADMIN'

        if (!isAdmin) {
          message.error('Acesso negado. Apenas administradores podem acessar as configurações do sistema.')
          router.push('/')
          return
        }

        setIsAuthorized(true)
        await Promise.all([loadSettings(), loadEmailTemplates()])
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

  const loadEmailTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const response = await apiService.getEmailTemplatesList()
      const templatesList = extractArrayFromResponse<string>(response, ['templates'])
      setEmailTemplates(templatesList)
      if (templatesList.length > 0) {
        setSelectedTemplate(templatesList[0])
        await loadTemplate(templatesList[0])
      }
    } catch (error) {
      message.error('Erro ao carregar templates de email')
    } finally {
      setLoadingTemplates(false)
    }
  }

  const loadTemplate = async (templateName: string) => {
    try {
      const template = await apiService.getEmailTemplate(templateName) as any
      if (template) {
        setTemplateData(template)
        templateForm.setFieldsValue({
          subject: template.subject || '',
          html: template.html || '',
          text: template.text || ''
        })
      } else {
        setTemplateData(null)
        templateForm.resetFields()
      }
    } catch (error) {
      setTemplateData(null)
      templateForm.resetFields()
    }
  }

  const handleTemplateChange = async (templateName: string) => {
    setSelectedTemplate(templateName)
    await loadTemplate(templateName)
  }

  const handleSaveTemplate = async () => {
    try {
      setSavingTemplate(true)
      const values = await templateForm.validateFields()

      await apiService.updateEmailTemplate(selectedTemplate, {
        html: values.html,
        text: values.text,
        subject: values.subject
      })

      message.success('Template salvo com sucesso!')
      await loadTemplate(selectedTemplate)
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Por favor, preencha todos os campos obrigatórios')
      } else {
        message.error('Erro ao salvar template')
      }
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleResetTemplate = async () => {
    try {
      setSavingTemplate(true)
      await apiService.resetEmailTemplate(selectedTemplate)
      message.success('Template restaurado para o padrão!')
      await loadTemplate(selectedTemplate)
    } catch (error) {
      message.error('Erro ao restaurar template')
    } finally {
      setSavingTemplate(false)
    }
  }

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

  if (loading) return <PageSkeleton />

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <LockOutlined style={{ fontSize: 48, color: 'var(--text-tertiary)' }} />
        <h2 style={{ fontFamily: 'var(--display-family)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Acesso Negado
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
          Apenas administradores podem acessar as configurações do sistema.
        </p>
      </div>
    )
  }

  const tabItems = [
    {
      key: 'general',
      label: <span><SettingOutlined /> Configurações Gerais</span>,
      children: (
        <div>
          <Alert
            message="Informação"
            description="As configurações aqui definidas afetam todo o sistema. Tenha cuidado ao fazer alterações."
            type="info"
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 24 }}
          />

          <Card size="small" title="Notificações e Marketing" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Notificações Ativadas</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Permite que o sistema envie notificações
                </div>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Marketing por Email</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Permite envio de campanhas de marketing
                </div>
              </div>
              <Switch
                checked={settings.enableEmailMarketing}
                onChange={(checked) => setSettings({ ...settings, enableEmailMarketing: checked })}
              />
            </div>
          </Card>

          <Card size="small" title="Modo de Manutenção" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Modo de Manutenção</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Desativa o sistema para manutenção
                </div>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </Card>

          <Card size="small" title="Gerenciar Abas da Sidebar">
            <Alert
              message="Atenção"
              description="Desabilite temporariamente abas que não devem aparecer na sidebar. Isso afeta todos os usuários do sistema."
              type="warning"
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {availableSidebarItems.map((item) => {
                const isDisabled = settings.disabledSidebarItems.includes(item.path)
                return (
                  <div
                    key={item.path}
                    style={{
                      padding: 12,
                      border: `1px solid ${isDisabled ? '#fca5a5' : 'var(--border-color)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      backgroundColor: isDisabled ? '#fef2f2' : 'var(--bg-surface)',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleSidebarItem(item.path)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: isDisabled ? 400 : 600, color: isDisabled ? 'var(--text-tertiary)' : 'var(--text-primary)', fontSize: 14 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
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
              <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fefce8', border: '1px solid #fde68a', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, color: '#92400e' }}>
                  {settings.disabledSidebarItems.length} aba(s) desabilitada(s)
                </div>
                <div style={{ fontSize: 13, color: '#b45309', marginTop: 4 }}>
                  As abas desabilitadas não aparecerão na sidebar para nenhum usuário.
                </div>
              </div>
            )}
          </Card>
        </div>
      )
    },
    {
      key: 'email-templates',
      label: <span><MailOutlined /> Templates de Email</span>,
      children: (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--display-family)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Personalização de Templates de Email
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Personalize os templates de email enviados pelo sistema. Você pode editar o HTML, texto e assunto de cada template.
            </p>
          </div>

          <Card>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, fontSize: 14 }}>
                Selecione o Template:
              </div>
              <Select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                style={{ width: '100%' }}
                loading={loadingTemplates}
              >
                {emailTemplates.map((template) => (
                  <Option key={template.name} value={template.name}>
                    {template.description}
                  </Option>
                ))}
              </Select>
            </div>

            {selectedTemplate && (
              <Form
                form={templateForm}
                layout="vertical"
                onFinish={handleSaveTemplate}
              >
                <Form.Item
                  label="Assunto do Email"
                  name="subject"
                  rules={[{ required: true, message: 'Assunto é obrigatório' }]}
                >
                  <Input placeholder="Ex: Bem-vindo ao PetFlow! 🐾" />
                </Form.Item>

                <Form.Item
                  label="Conteúdo HTML"
                  name="html"
                  rules={[{ required: true, message: 'Conteúdo HTML é obrigatório' }]}
                >
                  <TextArea
                    rows={15}
                    placeholder="Cole aqui o HTML do template..."
                    style={{ fontFamily: 'monospace' }}
                  />
                </Form.Item>

                <Form.Item
                  label="Versão Texto (Plain Text)"
                  name="text"
                  rules={[{ required: true, message: 'Versão texto é obrigatória' }]}
                >
                  <TextArea
                    rows={8}
                    placeholder="Versão em texto puro do email..."
                  />
                </Form.Item>

                <Alert
                  message="Variáveis Disponíveis"
                  description={
                    <div style={{ fontSize: 13 }}>
                      <p style={{ margin: '0 0 8px' }}>Você pode usar as seguintes variáveis nos templates:</p>
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        <li><code>{'${name}'}</code> - Nome do destinatário</li>
                        <li><code>{'${tenantName}'}</code> - Nome do petshop/clínica</li>
                        <li><code>{'${date}'}</code> - Data (para agendamentos)</li>
                        <li><code>{'${time}'}</code> - Hora (para agendamentos)</li>
                        <li><code>{'${petName}'}</code> - Nome do pet</li>
                        <li><code>{'${serviceName}'}</code> - Nome do serviço</li>
                      </ul>
                    </div>
                  }
                  type="info"
                  style={{ marginBottom: 16 }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetTemplate}
                    loading={savingTemplate}
                  >
                    Restaurar Padrão
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={savingTemplate}
                  >
                    Salvar Template
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Configurações do Sistema"
        subtitle="Configure parâmetros globais do sistema"
        breadcrumb={[{ label: 'Configurações do Sistema' }]}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Redefinir
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              Salvar
            </Button>
          </>
        }
      />
      <div style={{ padding: '0 24px 24px' }}>
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>
      </div>
    </div>
  )
}
