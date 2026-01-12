import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import LandingHeader from '../components/LandingHeader'

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Armazenar token JWT e dados do usuário temporariamente
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        message.success('Login realizado com sucesso!')
        
        // Redirecionar para dashboard
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        message.error(errorData.message || 'Credenciais inválidas')
      }
    } catch (error) {
      message.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <LandingHeader showAuthButtons={false} />
      
      <div className="pt-16 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="PetFlow Logo"
                width={64}
                height={64}
                className="rounded-lg"
                priority
              />
            </div>
            <Title level={2} className="text-gray-800 mb-2">
              Entre na sua conta
            </Title>
            <Text className="text-gray-600">
              Ou crie uma nova conta
            </Text>
          </div>

          {/* Login Form */}
          <Card className="shadow-lg border-0">
            <Form
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              initialValues={{
                email: '',
                password: ''
              }}
            >
              <Form.Item
                name="email"
                label="E-mail"
                rules={[
                  { required: true, message: 'Por favor, insira seu e-mail!' },
                  { type: 'email', message: 'Por favor, insira um e-mail válido!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Seu e-mail"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Senha"
                rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Sua senha"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="w-full bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-6">
              <Text className="text-gray-500">
                Não tem uma conta?{' '}
                <Link href="/complete-registration" className="text-green-600 hover:text-green-700 font-medium">
                  Criar conta
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}