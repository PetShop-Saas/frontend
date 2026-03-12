import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  Button,
  message,
  Switch,
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
import PageHeader from '../components/common/PageHeader'
import PageSkeleton from '../components/common/PageSkeleton'

interface UserPreferences {
  enableNotifications: boolean
  enableEmailNotifications: boolean
  enablePushNotifications: boolean
  emailMarketing: boolean
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 10,
}

const switchRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderRadius: 10,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-elevated)',
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

      const userPreferences = await apiService.getUserPreferences() as any

      if (userPreferences) {
        setPreferences({
          enableNotifications: userPreferences.enableNotifications ?? true,
          enableEmailNotifications: userPreferences.enableEmailNotifications ?? true,
          enablePushNotifications: userPreferences.enablePushNotifications ?? true,
          emailMarketing: userPreferences.emailMarketing ?? false
        })
      } else {
        setPreferences({
          enableNotifications: true,
          enableEmailNotifications: true,
          enablePushNotifications: true,
          emailMarketing: false
        })
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
      const savedPreferences = localStorage.getItem('userPreferences')
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      } else {
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

      await apiService.updateUserPreferences(preferences)

      localStorage.setItem('userPreferences', JSON.stringify(preferences))

      message.success('Preferências salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      message.error('Erro ao salvar preferências. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSkeleton type="detail" />

  return (
    <div>
      <PageHeader
        title="Preferências"
        subtitle="Gerencie suas preferências pessoais e notificações"
        breadcrumb={[{ label: 'Preferências' }]}
        actions={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            Salvar Preferências
          </Button>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        <Alert
          message="Informação"
          description="Essas configurações afetam apenas você. As configurações do sistema são gerenciadas pelo administrador."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: 20 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Notificações Gerais */}
          <Card bodyStyle={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}>
                <BellOutlined />
              </div>
              <div>
                <p style={sectionTitleStyle}>Notificações Gerais</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
                  Ative ou desative todas as notificações do sistema
                </p>
              </div>
            </div>

            <div style={switchRowStyle}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Receber Notificações
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Ative para receber notificações do sistema
                </p>
              </div>
              <Switch
                checked={preferences.enableNotifications}
                onChange={(checked) => setPreferences({ ...preferences, enableNotifications: checked })}
              />
            </div>
          </Card>

          {/* Notificações por Email */}
          <Card bodyStyle={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}>
                <MailOutlined />
              </div>
              <div>
                <p style={sectionTitleStyle}>Notificações por Email</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
                  Configure como você deseja receber notificações por email
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={switchRowStyle}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Notificações por Email
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Receba notificações importantes por email
                  </p>
                </div>
                <Switch
                  checked={preferences.enableEmailNotifications}
                  onChange={(checked) => setPreferences({ ...preferences, enableEmailNotifications: checked })}
                  disabled={!preferences.enableNotifications}
                />
              </div>

              <div style={switchRowStyle}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Marketing por Email
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Receba emails promocionais e novidades do sistema
                  </p>
                </div>
                <Switch
                  checked={preferences.emailMarketing}
                  onChange={(checked) => setPreferences({ ...preferences, emailMarketing: checked })}
                  disabled={!preferences.enableNotifications}
                />
              </div>
            </div>
          </Card>

          {/* Notificações Push */}
          <Card bodyStyle={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}>
                <BellOutlined />
              </div>
              <div>
                <p style={sectionTitleStyle}>Notificações Push</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
                  Receba notificações em tempo real no navegador
                </p>
              </div>
            </div>

            <div style={switchRowStyle}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Ativar Notificações Push
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Permita que o sistema envie notificações push no navegador
                </p>
              </div>
              <Switch
                checked={preferences.enablePushNotifications}
                onChange={(checked) => setPreferences({ ...preferences, enablePushNotifications: checked })}
                disabled={!preferences.enableNotifications}
              />
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              Salvar Preferências
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
