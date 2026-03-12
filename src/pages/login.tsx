import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Form, Input, Button, Typography, message, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        const maxAge = 7 * 24 * 60 * 60
        document.cookie = `token=${data.access_token}; path=/; max-age=${maxAge}; samesite=strict`
        message.success('Login realizado com sucesso!')
        router.push('/dashboard')
      } else {
        message.error('E-mail ou senha incorretos')
      }
    } catch {
      message.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      background: '#f4f6f9',
    }}>
      {/* ─── Left panel — visual ─── */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(160deg, #042f1e 0%, #064e3b 50%, #047857 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 44px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="login-left-panel"
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 240,
          height: 240,
          background: 'rgba(16, 185, 129, 0.08)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          top: '40%',
          right: -40,
          width: 160,
          height: 160,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span style={{ fontSize: 22 }}>🐾</span>
            </div>
            <span style={{
              fontSize: 20,
              fontWeight: 800,
              color: 'white',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '-0.3px',
            }}>
              PetFlow
            </span>
          </div>
        </div>

        {/* Main text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            color: 'white',
            fontFamily: "'Outfit', sans-serif",
            lineHeight: 1.15,
            marginBottom: 16,
            letterSpacing: '-0.5px',
          }}>
            Gerencie seu petshop com mais eficiência
          </h1>
          <p style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 340,
          }}>
            Controle agendamentos, clientes, pets, financeiro e muito mais em uma plataforma completa.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
            {['Agendamentos', 'Financeiro', 'Estoque', 'Clientes'].map(f => (
              <span key={f} style={{
                padding: '5px 12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(4px)',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          fontWeight: 500,
        }}>
          © {new Date().getFullYear()} PetFlow SaaS. Todos os direitos reservados.
        </div>
      </div>

      {/* ─── Right panel — form ─── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        background: '#f4f6f9',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Form header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#111827',
              fontFamily: "'Outfit', sans-serif",
              margin: 0,
              letterSpacing: '-0.4px',
              lineHeight: 1.2,
            }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '8px 0 0', fontWeight: 500 }}>
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '32px 28px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <Form
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark={false}
              initialValues={{ email: '', password: '' }}
            >
              <Form.Item
                name="email"
                label={
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    E-mail
                  </span>
                }
                rules={[
                  { required: true, message: 'Informe seu e-mail' },
                  { type: 'email', message: 'E-mail inválido' },
                ]}
                style={{ marginBottom: 18 }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#d1d5db', fontSize: 14 }} />}
                  placeholder="seu@email.com"
                  size="large"
                  style={{ borderRadius: 9, height: 44, fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Senha</span>
                    <span style={{ fontSize: 12, color: '#047857', fontWeight: 600, cursor: 'pointer' }}>
                      Esqueci minha senha
                    </span>
                  </div>
                }
                rules={[{ required: true, message: 'Informe sua senha' }]}
                style={{ marginBottom: 20 }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#d1d5db', fontSize: 14 }} />}
                  placeholder="••••••••"
                  size="large"
                  style={{ borderRadius: 9, height: 44, fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 20 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={!loading && <ArrowRightOutlined />}
                  iconPosition="end"
                  style={{
                    width: '100%',
                    height: 46,
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    background: 'linear-gradient(135deg, #047857, #059669)',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(4, 120, 87, 0.35)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{
              textAlign: 'center',
              paddingTop: 16,
              borderTop: '1px solid #f3f4f6',
            }}>
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>
                Não tem uma conta?{' '}
                <Link href="/complete-registration" style={{
                  color: '#047857',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}>
                  Criar conta gratuita
                </Link>
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: hide left panel on mobile */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
        }
        @media (max-width: 768px) {
          .login-left-panel ~ div { width: 100% !important; }
        }
      `}</style>
    </div>
  )
}
