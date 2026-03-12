import React, { useState, useEffect } from 'react'
import Image from 'next/image'
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
  BankOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { apiService } from '../services/api'
import LandingHeader from '../components/LandingHeader'

const { Option } = Select
const { Title, Text } = Typography
const { Step } = Steps

const AVAILABLE_PLANS = {
  FREE_USER: {
    name: 'FREE_USER',
    title: 'Gratuito',
    price: 0,
    priceDisplay: 'R$ 0',
    period: '/mês',
    description: 'Ideal para começar',
    features: ['Até 50 clientes', 'Até 100 pets', 'Relatórios básicos'],
    color: 'gray',
    icon: <UserOutlined />
  },
  BASIC_USER: {
    name: 'BASIC_USER',
    title: 'Básico',
    price: 29,
    priceDisplay: 'R$ 29',
    period: '/mês',
    description: 'Para pequenos petshops',
    features: ['Até 200 clientes', 'Até 500 pets', 'Relatórios completos', 'Suporte por email'],
    color: 'blue',
    icon: <BankOutlined />
  },
  PRO_USER: {
    name: 'PRO_USER',
    title: 'Profissional',
    price: 79,
    priceDisplay: 'R$ 79',
    period: '/mês',
    description: 'Para petshops em crescimento',
    features: ['Clientes ilimitados', 'Pets ilimitados', 'Relatórios avançados', 'Suporte prioritário', 'Integrações'],
    color: 'green',
    icon: <CrownOutlined />
  },
  ENTERPRISE_USER: {
    name: 'ENTERPRISE_USER',
    title: 'Empresarial',
    price: 149,
    priceDisplay: 'R$ 149',
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

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'link' | 'card' | 'boleto' | null>(null)
  const [billingData, setBillingData] = useState<any>(null)
  const [pixData, setPixData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'checking'>('pending')
  const [paymentChecking, setPaymentChecking] = useState(false)

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
      title: 'Pagamento',
      description: 'Finalize o pagamento',
      icon: <BankOutlined />
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
          
          // Se plano não for FREE, criar cobrança antes de avançar
          const values = { ...formData, ...form.getFieldsValue() }
          const selectedPlan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
          
          if (selectedPlan && selectedPlan.price > 0) {
            // Validar se email e name estão disponíveis
            if (!values.email || !values.name) {
              message.error('Por favor, preencha seus dados pessoais antes de escolher um plano pago')
              return
            }
            
            setLoading(true)
            try {
              // Criar cobrança pública no AbacatePay (sem autenticação)
              const billing = await apiService.createBillingPublic(
                selectedPlan.price,
                `Assinatura ${selectedPlan.title} - PetFlow`,
                values.email,
                values.name,
                values.plan,
                values.phone,
              )
              
              setBillingData(billing)
              
              // Se a cobrança já vier com QRCode PIX, preparar para exibição
              if (billing.billing?.pixQrcodeImage || billing.billing?.pixQrcode) {
                setPixData({
                  qrcodeImage: billing.billing.pixQrcodeImage,
                  qrcode: billing.billing.pixQrcode,
                  id: billing.billing.id,
                })
              }
              
              message.success('Cobrança criada com sucesso!')
            } catch (error: any) {
              message.error(error.message || 'Erro ao criar cobrança. Tente novamente.')
              setLoading(false)
              return
            } finally {
              setLoading(false)
            }
          }
        } else if (currentStep === 2) {
          // No passo de pagamento, BLOQUEAR avanço se não foi pago
          const values = { ...formData, ...form.getFieldsValue() }
          const selectedPlan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
          
          if (selectedPlan && selectedPlan.price > 0) {
            // Verificar se tem billing criado
            if (!billingData && !pixData) {
              message.error('Por favor, escolha um método de pagamento primeiro')
              return
            }
            
            // BLOQUEAR se pagamento não foi confirmado - NÃO PERMITIR AVANÇAR
            if (paymentStatus !== 'paid') {
              // Verificar status uma última vez antes de bloquear
              await handleCheckPayment()
              
              // Aguardar um pouco para o estado atualizar
              await new Promise(resolve => setTimeout(resolve, 1500))
              
              // Verificar novamente após a verificação - BLOQUEAR DEFINITIVAMENTE
              const paymentId = pixData?.id || billingData?.billing?.id
              if (paymentId) {
                try {
                  let isPaid = false
                  if (pixData?.id) {
                    const pixStatus = await apiService.checkPixStatus(pixData.id)
                    isPaid = pixStatus.status === 'PAID'
                  } else if (billingData?.billing?.id) {
                    const status = await apiService.checkBillingStatus(billingData.billing.id)
                    isPaid = status.billing?.status === 'PAID' || status.status === 'PAID'
                  }
                  
                  if (isPaid) {
                    setPaymentStatus('paid')
                  } else {
                    message.error('❌ Pagamento não confirmado! Você precisa pagar antes de continuar. Use o botão "Já paguei" para verificar o pagamento.')
                    return
                  }
                } catch (error) {
                  message.error('❌ Erro ao verificar pagamento. Por favor, use o botão "Já paguei" para verificar.')
                  return
                }
              } else {
                message.error('❌ Pagamento não confirmado! Você precisa pagar antes de continuar.')
                return
              }
            }
          }
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

  // Função para criar QRCode PIX
  const handleCreatePix = async () => {
    // Usar formData + form.getFieldsValue() para garantir que temos todos os dados
    const values = { ...formData, ...form.getFieldsValue() }
    const selectedPlan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
    
    if (!selectedPlan || selectedPlan.price === 0) {
      message.warning('Selecione um plano pago primeiro')
      return
    }
    
    // Validar se temos email e name
    if (!values.email || !values.name) {
      message.error('Dados pessoais não encontrados. Por favor, volte ao passo anterior.')
      return
    }
    
    setPaymentChecking(true)
    try {
      // Se já temos billingData com QRCode, usar ele
      if (billingData?.billing?.pixQrcodeImage || billingData?.billing?.pixQrcode) {
        setPixData({
          qrcodeImage: billingData.billing.pixQrcodeImage,
          qrcode: billingData.billing.pixQrcode,
          id: billingData.billing.id,
        })
        setPaymentMethod('pix')
        message.success('QRCode PIX carregado!')
        setPaymentChecking(false)
        return
      }
      
      // Caso contrário, criar novo QRCode
      console.log('Criando QRCode PIX com:', {
        amount: selectedPlan.price,
        email: values.email,
        name: values.name
      })
      
      const pix = await apiService.createPixQRCode(
        selectedPlan.price,
        `Assinatura ${selectedPlan.title} - PetFlow`,
        values.email, // customerEmail para endpoint público
        values.name   // customerName para endpoint público
      )
      
      console.log('QRCode PIX recebido:', pix)
      
      // Verificar estrutura da resposta
      const pixResponse = pix.data || pix
      
      setPixData(pixResponse)
      setPaymentMethod('pix')
      message.success('QRCode PIX gerado com sucesso!')
      
      // Log para debug
      console.log('pixData setado:', pixResponse)
      console.log('paymentMethod setado para:', 'pix')
    } catch (error: any) {
      console.error('Erro ao criar QRCode PIX:', error)
      message.error(error.message || 'Erro ao gerar QRCode PIX')
    } finally {
      setPaymentChecking(false)
    }
  }

  // Função para verificar status do pagamento
  const checkPaymentStatus = async () => {
    // Usar o ID do PIX se disponível, senão usar o billing ID
    const paymentId = pixData?.id || billingData?.billing?.id
    if (!paymentId) return
    
    setPaymentChecking(true)
    setPaymentStatus('checking')
    
    try {
      // Se temos ID do PIX, verificar status do PIX diretamente
      if (pixData?.id) {
        const pixStatus = await apiService.checkPixStatus(pixData.id)
        if (pixStatus.status === 'PAID') {
          setPaymentStatus('paid')
          message.success('Pagamento confirmado!')
          setPaymentChecking(false)
          return
        } else {
          // Se não está pago, verificar também via billing se disponível
          if (billingData?.billing?.id) {
            const status = await apiService.checkBillingStatus(billingData.billing.id)
            if (status.billing?.status === 'PAID' || status.status === 'PAID') {
              setPaymentStatus('paid')
              message.success('Pagamento confirmado!')
              setPaymentChecking(false)
              return
            }
          }
          setPaymentStatus('pending')
        }
      } else if (billingData?.billing?.id) {
        // Caso contrário, verificar via billing
        const status = await apiService.checkBillingStatus(billingData.billing.id)
        
        if (status.billing?.status === 'PAID' || status.status === 'PAID') {
          setPaymentStatus('paid')
          message.success('Pagamento confirmado!')
        } else {
          setPaymentStatus('pending')
        }
      }
    } catch (error: any) {
      console.error('Erro ao verificar status:', error)
      // Não mostrar erro em verificações automáticas
      if (paymentStatus !== 'checking') {
        message.error('Erro ao verificar status do pagamento')
      }
      setPaymentStatus('pending')
    } finally {
      setPaymentChecking(false)
    }
  }

  // Função para verificar pagamento quando o usuário clicar em "Já paguei"
  const handleCheckPayment = async () => {
    setPaymentChecking(true)
    setPaymentStatus('checking')
    
    try {
      await checkPaymentStatus()
    } catch (error: any) {
      message.error('Erro ao verificar pagamento. Tente novamente.')
    } finally {
      setPaymentChecking(false)
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
      
      // Verificar se pagamento foi confirmado (se necessário)
      const selectedPlan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
      if (selectedPlan && selectedPlan.price > 0) {
        // Verificar status diretamente da API (não confiar apenas no estado)
        const verifyPaymentStatus = async (): Promise<boolean> => {
          const paymentId = pixData?.id || billingData?.billing?.id
          if (!paymentId) return false
          
          try {
            if (pixData?.id) {
              const pixStatus = await apiService.checkPixStatus(pixData.id)
              if (pixStatus.status === 'PAID') {
                setPaymentStatus('paid')
                return true
              }
            }
            
            if (billingData?.billing?.id) {
              const status = await apiService.checkBillingStatus(billingData.billing.id)
              if (status.billing?.status === 'PAID' || status.status === 'PAID') {
                setPaymentStatus('paid')
                return true
              }
            }
          } catch (error) {
            console.error('Erro ao verificar status:', error)
          }
          return false
        }
        
        // CRÍTICO: Verificar status antes de submeter - BLOQUEAR COMPLETAMENTE se não pago
        const isPaid = await verifyPaymentStatus()
        
        if (!isPaid) {
          message.error('❌ Pagamento não confirmado! Você precisa pagar antes de criar sua conta. Use o botão "Já paguei" para verificar o pagamento.')
          setLoading(false)
          return // BLOQUEAR - não permite criar conta sem pagamento
        }
        
        // Verificação adicional: garantir que realmente está pago
        const paymentId = pixData?.id || billingData?.billing?.id
        if (!paymentId) {
          message.error('❌ ID de pagamento não encontrado. Por favor, refaça o processo de pagamento.')
          setLoading(false)
          return
        }
        
        // Verificar uma última vez diretamente da API
        let finalCheck = false
        try {
          if (pixData?.id) {
            const finalStatus = await apiService.checkPixStatus(pixData.id)
            finalCheck = finalStatus.status === 'PAID'
          } else if (billingData?.billing?.id) {
            const finalStatus = await apiService.checkBillingStatus(billingData.billing.id)
            finalCheck = finalStatus.billing?.status === 'PAID' || finalStatus.status === 'PAID'
          }
        } catch (error) {
          console.error('Erro na verificação final:', error)
        }
        
        if (!finalCheck) {
          message.error('❌ Pagamento não confirmado! Verifique o pagamento antes de continuar.')
          setLoading(false)
          return // BLOQUEAR - não permite criar conta sem pagamento confirmado
        }
        
        // Garantir que o estado está atualizado
        setPaymentStatus('paid')
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
        
        // Transaction ID se pagamento foi confirmado
        transactionId: billingData?.billing?.id || null,
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
                    <Input size="large" placeholder="seu@email.com" autoComplete="off" />
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
                        // Forçar revalidação do campo confirmPassword quando a senha mudar
                        setTimeout(() => {
                          const confirmPasswordValue = form.getFieldValue('confirmPassword')
                          if (confirmPasswordValue) {
                            form.validateFields(['confirmPassword']).catch(() => {})
                          } else {
                            // Se o campo de confirmação está vazio, limpar o erro
                            form.setFields([{
                              name: 'confirmPassword',
                              errors: []
                            }])
                          }
                        }, 0)
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
                          const password = getFieldValue('password')
                          if (!value) {
                            return Promise.reject(new Error('Confirme sua senha'))
                          }
                          if (!password || password === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('As senhas não conferem'))
                        }
                      })
                    ]}
                  >
                    <Input.Password 
                      size="large" 
                      placeholder="Repita a senha"
                      onChange={(e) => {
                        // Forçar revalidação quando o campo de confirmação mudar
                        const value = e.target.value
                        setTimeout(() => {
                          const passwordValue = form.getFieldValue('password')
                          if (passwordValue && value && passwordValue === value) {
                            // Se as senhas conferem, limpar erros
                            form.setFields([{
                              name: 'confirmPassword',
                              errors: []
                            }])
                          } else if (passwordValue && value) {
                            // Se as senhas não conferem, validar
                            form.validateFields(['confirmPassword']).catch(() => {})
                          }
                        }, 0)
                      }}
                    />
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
                  <Form.Item 
                    name="acceptTerms" 
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (value === true) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('Você deve aceitar os termos de uso para continuar'))
                        }
                      }
                    ]}
                  >
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
                        <span className="text-2xl font-bold text-green-600">{plan.priceDisplay}</span>
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
        
        // Se plano for gratuito, pular pagamento
        if (selectedPlan && selectedPlan.price === 0) {
          return (
            <div className="space-y-6">
              <Title level={3}>Plano Gratuito</Title>
              <Alert
                message="Plano Gratuito Selecionado"
                description="Você selecionou o plano gratuito. Não é necessário realizar pagamento. Você pode prosseguir para a confirmação."
                type="info"
                showIcon
              />
            </div>
          )
        }
        
        return (
          <div className="space-y-6">
            <Title level={3}>Finalizar Pagamento</Title>
            <Text type="secondary">
              Escolha o método de pagamento para finalizar sua assinatura
            </Text>
            
            <Card title={`Plano ${selectedPlan?.title} - ${selectedPlan?.priceDisplay}${selectedPlan?.period}`} className="mb-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text strong>Valor:</Text>
                  <Text className="text-xl font-bold text-green-600">
                    {selectedPlan?.priceDisplay}{selectedPlan?.period}
                  </Text>
                </div>
                
                <div className="space-y-3">
                  <Text strong className="block mb-2">Escolha o método de pagamento:</Text>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* PIX */}
                    <Button
                      type={paymentMethod === 'pix' ? 'primary' : 'default'}
                      icon={<QrcodeOutlined />}
                      size="large"
                      onClick={handleCreatePix}
                      loading={paymentChecking && paymentMethod === 'pix'}
                      block
                      className="h-auto py-4"
                    >
                      <div className="text-center">
                        <div className="font-semibold">PIX</div>
                        <div className="text-xs text-gray-500">Aprovação instantânea</div>
                      </div>
                    </Button>
                    
                    {/* Cartão de Crédito - só mostrar se tiver URL válida */}
                    {billingData?.billing?.methods?.includes('CARD') && 
                     billingData?.billing?.url && 
                     billingData.billing.url !== 'about:blank' &&
                     !billingData.billing.url.startsWith('data:') && (
                      <Button
                        type={paymentMethod === 'card' ? 'primary' : 'default'}
                        icon={<CreditCardOutlined />}
                        size="large"
                        onClick={() => {
                          setPaymentMethod('card')
                          const url = billingData.billing.url
                          if (url && url !== 'about:blank' && !url.startsWith('data:')) {
                            window.open(url, '_blank')
                          } else {
                            message.warning('Link de pagamento não disponível. Por favor, use PIX para pagamento instantâneo.')
                          }
                        }}
                        block
                        className="h-auto py-4"
                      >
                        <div className="text-center">
                          <div className="font-semibold">Cartão de Crédito</div>
                          <div className="text-xs text-gray-500">Visa, Mastercard, Elo</div>
                        </div>
                      </Button>
                    )}
                    
                    {/* Boleto (se disponível) */}
                    {billingData?.billing?.methods?.includes('BOLETO') && (
                      <Button
                        type={paymentMethod === 'boleto' ? 'primary' : 'default'}
                        icon={<BankOutlined />}
                        size="large"
                        onClick={() => {
                          setPaymentMethod('boleto')
                          // Criar boleto se necessário
                          message.info('Funcionalidade de boleto em desenvolvimento')
                        }}
                        block
                        className="h-auto py-4"
                      >
                        <div className="text-center">
                          <div className="font-semibold">Boleto</div>
                          <div className="text-xs text-gray-500">Vencimento em 3 dias</div>
                        </div>
                      </Button>
                    )}
                  </div>
                  
                  {/* Mostrar métodos disponíveis */}
                  {billingData?.billing?.methods && (
                    <div className="text-xs text-gray-500 text-center">
                      Métodos disponíveis: {billingData.billing.methods.join(', ')}
                    </div>
                  )}
                </div>
                
                {/* QRCode PIX */}
                {pixData && paymentMethod === 'pix' && (
                  <Card className="mt-4">
                    <div className="text-center space-y-4">
                      <Title level={4}>Escaneie o QRCode com seu app de pagamento</Title>
                      {pixData.qrcodeImage ? (
                        <Image 
                          src={pixData.qrcodeImage} 
                          alt="QRCode PIX" 
                          width={300}
                          height={300}
                          unoptimized
                          className="mx-auto border-2 border-gray-300 rounded-lg"
                        />
                      ) : pixData.qrcode ? (
                        <div className="p-8 bg-gray-100 rounded-lg">
                          <QrcodeOutlined style={{ fontSize: '100px' }} />
                          <Text type="secondary" className="block mt-4">
                            QRCode gerado, mas imagem não disponível
                          </Text>
                        </div>
                      ) : (
                        <div className="p-8 bg-gray-100 rounded-lg">
                          <QrcodeOutlined style={{ fontSize: '100px' }} />
                          <Text type="secondary" className="block mt-4">
                            Aguardando dados do QRCode...
                          </Text>
                        </div>
                      )}
                      {(pixData.qrcode || pixData.pixQrcode) && (
                        <div className="space-y-2">
                          <Text type="secondary">Ou copie o código PIX:</Text>
                          <Input.TextArea
                            value={pixData.qrcode || pixData.pixQrcode}
                            readOnly
                            rows={3}
                            className="font-mono text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(pixData.qrcode || pixData.pixQrcode)
                                message.success('Código PIX copiado!')
                              }}
                            >
                              Copiar Código
                            </Button>
                            
                            {/* Botão para simular pagamento (apenas em dev) */}
                            {process.env.NODE_ENV === 'development' && pixData.id && (
                              <Button
                                type="dashed"
                                onClick={async () => {
                                  try {
                                    setPaymentChecking(true)
                                    await apiService.simulatePixPayment(pixData.id)
                                    message.success('Pagamento simulado! Verificando status...')
                                    
                                    // Aguardar um pouco e verificar status
                                    await new Promise(resolve => setTimeout(resolve, 2000))
                                    await handleCheckPayment()
                                  } catch (error: any) {
                                    message.error(error.message || 'Erro ao simular pagamento')
                                  } finally {
                                    setPaymentChecking(false)
                                  }
                                }}
                                loading={paymentChecking}
                              >
                                🧪 Simular Pagamento (Dev)
                              </Button>
                            )}
                          </div>
                          
                          {process.env.NODE_ENV === 'development' && (
                            <Alert
                              message="Modo Desenvolvimento"
                              description="Este QRCode é apenas para testes. Use o botão 'Simular Pagamento' para testar o fluxo completo sem fazer um pagamento real."
                              type="info"
                              showIcon
                              className="mt-2"
                            />
                          )}
                        </div>
                      )}
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-2 bg-gray-50 rounded text-left text-xs">
                          <Text type="secondary">Debug:</Text>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(pixData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
                
                {/* Mostrar se pixData existe mas paymentMethod não é 'pix' */}
                {pixData && paymentMethod !== 'pix' && (
                  <Alert
                    message="QRCode gerado"
                    description="Clique em 'Pagar com PIX' para ver o QRCode"
                    type="info"
                    showIcon
                    className="mt-4"
                  />
                )}
                
                  {/* Status do pagamento */}
                  {billingData && (
                    <Card className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Text strong>Status do Pagamento:</Text>
                          </div>
                          {paymentStatus === 'paid' && (
                            <Tag color="success" icon={<CheckCircleOutlined />}>
                              Pago
                            </Tag>
                          )}
                          {paymentStatus === 'checking' && (
                            <Tag color="processing" icon={<LoadingOutlined />}>
                              Verificando...
                            </Tag>
                          )}
                          {paymentStatus === 'pending' && (
                            <Tag color="warning">Aguardando Pagamento</Tag>
                          )}
                        </div>
                      
                      {paymentStatus === 'pending' && (
                        <Button
                          type="primary"
                          onClick={handleCheckPayment}
                          loading={paymentChecking}
                          block
                          size="large"
                        >
                          ✅ Já paguei
                        </Button>
                      )}
                      
                      {paymentStatus === 'paid' && (
                        <Alert
                          message="Pagamento Confirmado!"
                          description="Seu pagamento foi confirmado. Você pode prosseguir para a confirmação final."
                          type="success"
                          showIcon
                        />
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </div>
        )

      case 3:
        const finalValues = { ...formData, ...form.getFieldsValue() }
        const finalSelectedPlan = AVAILABLE_PLANS[finalValues.plan as keyof typeof AVAILABLE_PLANS]
        
        return (
          <div className="space-y-6">
            <Title level={3}>Confirmação</Title>
            <Text type="secondary">
              Revise as informações antes de criar sua conta
            </Text>
            
            <Card title="Dados Pessoais" className="mb-4">
              <Space direction="vertical" className="w-full">
                <div><Text strong>Nome:</Text> {finalValues.name || 'Não informado'}</div>
                <div><Text strong>E-mail:</Text> {finalValues.email || 'Não informado'}</div>
              </Space>
            </Card>
            
            <Card title="Plano Selecionado" className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Title level={4} className="mb-1">{finalSelectedPlan?.title || 'Nenhum plano selecionado'}</Title>
                  <Text type="secondary">{finalSelectedPlan?.description || ''}</Text>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{finalSelectedPlan?.priceDisplay || 'R$ 0'}</div>
                  <Text type="secondary">{finalSelectedPlan?.period || '/mês'}</Text>
                </div>
              </div>
            </Card>
            
            {paymentStatus === 'paid' && (
              <Card title="Pagamento" className="mb-4">
                <Alert
                  message="Pagamento Confirmado"
                  description="Seu pagamento foi processado com sucesso."
                  type="success"
                  showIcon
                />
              </Card>
            )}
            
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