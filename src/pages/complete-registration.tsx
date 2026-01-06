import React, { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Steps,
  message,
  Typography,
  Alert,
  Space,
  Tag,
  Checkbox
} from 'antd'
import { Modal } from 'antd'
import {
  UserOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  BankOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'
import LandingHeader from '../components/LandingHeader'

const { Option } = Select
const { Title, Text } = Typography
const { Step } = Steps

// Planos disponíveis
const AVAILABLE_PLANS = {
  FREE_USER: {
    name: 'FREE_USER',
    title: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Ideal para começar',
    features: ['Até 50 clientes', 'Até 100 pets', 'Relatórios básicos'],
    color: 'gray',
    icon: <UserOutlined />
  },
  BASIC_USER: {
    name: 'BASIC_USER',
    title: 'Básico',
    price: 'R$ 29',
    period: '/mês',
    description: 'Para pequenos petshops',
    features: ['Até 200 clientes', 'Até 500 pets', 'Relatórios completos', 'Suporte por email'],
    color: 'blue',
    icon: <BankOutlined />
  },
  PRO_USER: {
    name: 'PRO_USER',
    title: 'Profissional',
    price: 'R$ 79',
    period: '/mês',
    description: 'Para petshops em crescimento',
    features: ['Clientes ilimitados', 'Pets ilimitados', 'Relatórios avançados', 'Suporte prioritário', 'Integrações'],
    color: 'green',
    icon: <CrownOutlined />
  },
  ENTERPRISE_USER: {
    name: 'ENTERPRISE_USER',
    title: 'Empresarial',
    price: 'R$ 149',
    period: '/mês',
    description: 'Para grandes operações',
    features: ['Tudo do Pro', 'API personalizada', 'Suporte dedicado', 'Treinamento', 'Customizações'],
    color: 'purple',
    icon: <CrownOutlined />
  }
}

export default function CompleteRegistration() {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [form] = Form.useForm()
  const router = useRouter()
  const [passwordStrength, setPasswordStrength] = useState<'weak'|'medium'|'strong'|null>(null)
  const [termsOpen, setTermsOpen] = useState(false)

  const steps = [
    {
      title: 'Dados Pessoais',
      description: 'Suas informações básicas',
      icon: <UserOutlined />
    },
    {
      title: 'Escolha do Plano',
      description: 'Selecione seu plano',
      icon: <CrownOutlined />
    },
    {
      title: 'Confirmação',
      description: 'Revise e confirme',
      icon: <CheckCircleOutlined />
    }
  ]

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      try {
        // Validar campos do passo atual antes de avançar
        if (currentStep === 0) {
          // Validar dados pessoais (bloqueia avanço se inválido)
          await form.validateFields(['name', 'email', 'password', 'confirmPassword', 'acceptTerms'])
        } else if (currentStep === 1) {
          // Validar seleção do plano
          await form.validateFields(['plan'])
        }
        
        // Salvar dados do formulário antes de avançar
        const values = form.getFieldsValue()
        setFormData((prev: any) => ({ ...prev, ...values }))
        setCurrentStep(currentStep + 1)
      } catch (error) {
        // Erro de validação será mostrado automaticamente pelo Form
      }
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Usar dados do estado em vez do form
      const values = { ...formData, ...form.getFieldsValue() }
      
      // Validar se todos os campos obrigatórios estão preenchidos
      if (!values.name || !values.email || !values.password || !values.plan) {
        message.error('Por favor, preencha todos os campos obrigatórios')
        return
      }

      // Regras de senha mais fortes
      const strong = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
      if (!strong.test(values.password)) {
        message.error('Senha fraca: mínimo 8 caracteres com letras e números')
        return
      }

      // Confirmar senha (se tiver no form)
      if (values.confirmPassword && values.password !== values.confirmPassword) {
        message.error('As senhas não conferem')
        return
      }
      if (!values.acceptTerms) {
        message.error('Você deve aceitar os termos de uso')
        return
      }
      
      // Mapear plano visual (planRole) para plano do tenant
      const planMap: Record<string, string> = {
        FREE_USER: 'FREE',
        BASIC_USER: 'BASIC',
        PRO_USER: 'PRO',
        ENTERPRISE_USER: 'ENTERPRISE',
      }

      // Usar o endpoint público de registro completo
      const response = await apiService.register({
        // Dados do Tenant (simplificados)
        tenantName: values.name, // sem sufixo automático
        tenantSubdomain: values.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        tenantContactEmail: values.email,
        tenantPlan: planMap[values.plan],
        
        // Dados do Usuário
        email: values.email,
        password: values.password,
        name: values.name,
        // Backend aceita: MANAGER | VET | RECEPTIONIST | USER
        role: 'MANAGER',
        planRole: values.plan,
        phone: values.phone,
        marketingOptIn: !!values.marketingOptIn,
        acceptTerms: !!values.acceptTerms,
      })

      message.success('Conta criada com sucesso! Faça login para continuar.')
      
      // Novo fluxo: ir para tela de login
      router.push('/login')
      
    } catch (error: any) {
      message.error(error.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Title level={3}>Suas Informações</Title>
            <Text type="secondary">
              Precisamos apenas dos seus dados básicos para criar sua conta
            </Text>
            
            <Form layout="vertical" form={form} className="space-y-4">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="name"
                    label="Nome Completo"
                    rules={[{ required: true, message: 'Por favor, insira seu nome' }]}
                  >
                    <Input size="large" placeholder="Seu nome completo" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="email"
                    label="E-mail"
                    rules={[
                      { required: true, message: 'Por favor, insira seu e-mail' },
                      { type: 'email', message: 'Por favor, insira um e-mail válido' }
                    ]}
                  >
                    <Input size="large" placeholder="seu@email.com" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="phone"
                    label="Celular (opcional)"
                    rules={[{
                      validator: (_, value) => {
                        if (!value) return Promise.resolve()
                        const digits = String(value).replace(/\D/g, '')
                        if (digits.length === 10 || digits.length === 11) return Promise.resolve()
                        return Promise.reject('Informe um telefone válido com DDD')
                      }
                    }]}
                  >
                    <Input
                      size="large"
                      placeholder="Ex: (11) 99999-9999"
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '')
                        let formatted = raw
                        if (raw.length > 2) formatted = `(${raw.slice(0,2)}) ${raw.slice(2)}`
                        if (raw.length > 7) formatted = `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7,11)}`
                        form.setFieldsValue({ phone: formatted })
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="password"
                    label="Senha"
                    rules={[
                      { required: true, message: 'Por favor, insira sua senha' },
                      { pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/, message: 'Mínimo 8 caracteres com letras e números' }
                    ]}
                  >
                    <Input.Password size="large" placeholder="Sua senha"
                      onChange={(e)=>{
                        const v=e.target.value||''
                        const strong=/^(?=.*[A-Za-z])(?=.*\d).{12,}$/
                        const medium=/^(?=.*[A-Za-z])(?=.*\d).{8,}$/
                        setPasswordStrength(strong.test(v)?'strong':(medium.test(v)?'medium':'weak'))
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {passwordStrength && (
                <Row>
                  <Col span={24}>
                    <Space>
                      <span>Força da senha:</span>
                      {passwordStrength==='strong' && <Tag color="green">Forte</Tag>}
                      {passwordStrength==='medium' && <Tag color="gold">Média</Tag>}
                      {passwordStrength==='weak' && <Tag color="red">Fraca</Tag>}
                    </Space>
                  </Col>
                </Row>
              )}
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item 
                    name="confirmPassword" 
                    label="Confirmar Senha"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: 'Confirme sua senha' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('As senhas não conferem'))
                        }
                      })
                    ]}
                  >
                    <Input.Password size="large" placeholder="Repita a senha" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="marketingOptIn" valuePropName="checked">
                    <Checkbox>Quero receber novidades e ofertas por e-mail</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="acceptTerms" valuePropName="checked">
                    <Checkbox>
                      Li e aceito os <a onClick={(e)=>{e.preventDefault(); setTermsOpen(true)}}>termos de uso</a> e a política de privacidade
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              <Modal
                title="Termos de Uso"
                open={termsOpen}
                onOk={()=>setTermsOpen(false)}
                onCancel={()=>setTermsOpen(false)}
                okText="Fechar"
                cancelButtonProps={{ style: { display: 'none' } }}
              >
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <p>Bem-vindo ao nosso sistema. Ao utilizar nossos serviços, você concorda com:</p>
                  <ul>
                    <li>Uso adequado da plataforma e dos dados dos clientes;</li>
                    <li>Responsabilidade pelo conteúdo inserido;</li>
                    <li>Respeito às leis de proteção de dados aplicáveis;</li>
                    <li>Política de privacidade e armazenamento de dados;</li>
                    <li>Condições de assinatura e faturamento, quando aplicável.</li>
                  </ul>
                  <p>Estes termos podem ser atualizados. Em caso de dúvidas, entre em contato com o suporte.</p>
                </div>
              </Modal>
            </Form>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <Title level={3}>Escolha seu Plano</Title>
            <Text type="secondary">
              Selecione o plano que melhor atende às necessidades da sua empresa
            </Text>
            
            <Form form={form} layout="vertical">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(AVAILABLE_PLANS).map(([key, plan]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      form.getFieldValue('plan') === key ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => {
                      form.setFieldsValue({ plan: key })
                      // Atualizar também o formData para manter sincronizado
                      setFormData((prev: any) => ({ ...prev, plan: key }))
                      // Forçar validação do campo
                      form.validateFields(['plan']).catch(() => {})
                    }}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-${plan.color}-100`}>
                        <span className={`text-${plan.color}-600 text-xl`}>
                          {plan.icon}
                        </span>
                      </div>
                      
                      <Title level={4} className="mb-2">{plan.title}</Title>
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-green-600">{plan.price}</span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                      <Text type="secondary" className="block mb-4">{plan.description}</Text>
                      
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <CheckCircleOutlined className="text-green-500 mr-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Campo oculto para validação */}
              <Form.Item 
                name="plan" 
                rules={[{ required: true, message: 'Por favor, selecione um plano' }]}
                style={{ display: 'none' }}
              >
                <Input />
              </Form.Item>
              
              {/* Mensagem de erro visível */}
              {form.getFieldError('plan').length > 0 && (
                <Alert
                  message={form.getFieldError('plan')[0]}
                  type="error"
                  showIcon
                  className="mt-4"
                />
              )}
            </Form>
          </div>
        )

      case 2:
        const values = { ...formData, ...form.getFieldsValue() }
        const selectedPlan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
        
        return (
          <div className="space-y-6">
            <Title level={3}>Confirmação</Title>
            <Text type="secondary">
              Revise as informações antes de criar sua conta
            </Text>
            
            <Card title="Dados Pessoais" className="mb-4">
              <Space direction="vertical" className="w-full">
                <div><Text strong>Nome:</Text> {values.name || 'Não informado'}</div>
                <div><Text strong>E-mail:</Text> {values.email || 'Não informado'}</div>
              </Space>
            </Card>
            
            <Card title="Plano Selecionado" className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Title level={4} className="mb-1">{selectedPlan?.title || 'Nenhum plano selecionado'}</Title>
                  <Text type="secondary">{selectedPlan?.description || ''}</Text>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{selectedPlan?.price || 'R$ 0'}</div>
                  <Text type="secondary">{selectedPlan?.period || '/mês'}</Text>
                </div>
              </div>
            </Card>
            
            <Alert
              message="Próximos Passos"
              description="Após criar sua conta, você será direcionado para uma configuração inicial onde poderá: configurar sua empresa, adicionar funcionários, definir capital inicial e cadastrar produtos existentes."
              type="info"
              showIcon
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <LandingHeader showAuthButtons={false} />
      
      <div className="pt-16 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Title level={1} className="text-green-600">
              Crie sua Conta
            </Title>
            <Text type="secondary" className="text-lg">
              Configure sua empresa e comece a usar o sistema em poucos passos
            </Text>
          </div>

          <Card className="shadow-lg">
            <Steps current={currentStep} className="mb-8">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                />
              ))}
            </Steps>

            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrev}
                disabled={currentStep === 0}
                size="large"
              >
                Anterior
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  onClick={handleNext}
                  size="large"
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  size="large"
                >
                  Criar Conta
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}