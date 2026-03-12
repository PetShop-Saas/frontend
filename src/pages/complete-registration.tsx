import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  message,
  Alert,
  Tag,
  Checkbox,
  Modal,
} from 'antd'
import {
  UserOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  BankOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  LoadingOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import { apiService } from '../services/api'

const { Option } = Select

const PLAN_COLORS: Record<string, { accent: string; bg: string; icon: React.ReactNode }> = {
  FREE_USER:       { accent: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: <UserOutlined /> },
  BASIC_USER:      { accent: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: <BankOutlined /> },
  PRO_USER:        { accent: '#047857', bg: 'rgba(4,120,87,0.1)',    icon: <CrownOutlined /> },
  ENTERPRISE_USER: { accent: '#7c3aed', bg: 'rgba(124,58,237,0.1)', icon: <CrownOutlined /> },
}

const AVAILABLE_PLANS = {
  FREE_USER: {
    name: 'FREE_USER',
    title: 'Gratuito',
    price: 0,
    priceDisplay: 'R$ 0',
    period: '/mês',
    description: 'Ideal para começar',
    features: ['Até 50 clientes', 'Até 100 pets', 'Relatórios básicos'],
  },
  BASIC_USER: {
    name: 'BASIC_USER',
    title: 'Básico',
    price: 29,
    priceDisplay: 'R$ 29',
    period: '/mês',
    description: 'Para pequenos petshops',
    features: ['Até 200 clientes', 'Até 500 pets', 'Relatórios completos', 'Suporte por email'],
  },
  PRO_USER: {
    name: 'PRO_USER',
    title: 'Profissional',
    price: 79,
    priceDisplay: 'R$ 79',
    period: '/mês',
    description: 'Para petshops em crescimento',
    features: ['Clientes ilimitados', 'Pets ilimitados', 'Relatórios avançados', 'Suporte prioritário', 'Integrações'],
  },
  ENTERPRISE_USER: {
    name: 'ENTERPRISE_USER',
    title: 'Empresarial',
    price: 149,
    priceDisplay: 'R$ 149',
    period: '/mês',
    description: 'Para grandes operações',
    features: ['Tudo do Pro', 'API personalizada', 'Suporte dedicado', 'Treinamento', 'Customizações'],
  },
}

const STEPS = [
  { title: 'Dados Pessoais',  description: 'Suas informações básicas' },
  { title: 'Escolha do Plano', description: 'Selecione seu plano' },
  { title: 'Pagamento',       description: 'Finalize o pagamento' },
  { title: 'Confirmação',     description: 'Revise e confirme' },
]

export default function CompleteRegistration() {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [form] = Form.useForm()
  const router = useRouter()
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const [termsOpen, setTermsOpen] = useState(false)
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'link' | 'card' | 'boleto' | null>(null)
  const [billingData, setBillingData] = useState<any>(null)
  const [pixData, setPixData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'checking'>('pending')
  const [paymentChecking, setPaymentChecking] = useState(false)

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleNext = async () => {
    if (currentStep >= STEPS.length - 1) return
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'email', 'password', 'confirmPassword', 'acceptTerms'])
      } else if (currentStep === 1) {
        await form.validateFields(['plan'])
        const values = { ...formData, ...form.getFieldsValue() }
        const plan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
        if (plan && plan.price > 0) {
          if (!values.email || !values.name) {
            message.error('Por favor, preencha seus dados pessoais antes de escolher um plano pago')
            return
          }
          setLoading(true)
          try {
            const billing = await apiService.createBillingPublic(
              plan.price,
              `Assinatura ${plan.title} - PetFlow`,
              values.email,
              values.name,
              values.plan,
              values.phone,
            )
            setBillingData(billing)
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
        const values = { ...formData, ...form.getFieldsValue() }
        const plan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
        if (plan && plan.price > 0) {
          if (!billingData && !pixData) {
            message.error('Por favor, escolha um método de pagamento primeiro')
            return
          }
          if (paymentStatus !== 'paid') {
            await handleCheckPayment()
            await new Promise(resolve => setTimeout(resolve, 1500))
            const paymentId = pixData?.id || billingData?.billing?.id
            if (paymentId) {
              try {
                let isPaid = false
                if (pixData?.id) {
                  const s = await apiService.checkPixStatus(pixData.id)
                  isPaid = s.status === 'PAID'
                } else if (billingData?.billing?.id) {
                  const s = await apiService.checkBillingStatus(billingData.billing.id)
                  isPaid = s.billing?.status === 'PAID' || s.status === 'PAID'
                }
                if (isPaid) {
                  setPaymentStatus('paid')
                } else {
                  message.error('❌ Pagamento não confirmado! Use o botão "Já paguei" para verificar.')
                  return
                }
              } catch {
                message.error('❌ Erro ao verificar pagamento. Use o botão "Já paguei".')
                return
              }
            } else {
              message.error('❌ Pagamento não confirmado! Você precisa pagar antes de continuar.')
              return
            }
          }
        }
      }
      const values = form.getFieldsValue()
      setFormData((prev: any) => ({ ...prev, ...values }))
      setCurrentStep(s => s + 1)
    } catch {
      // Validação exibe erros automaticamente
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }

  const handleCreatePix = async () => {
    const values = { ...formData, ...form.getFieldsValue() }
    const plan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
    if (!plan || plan.price === 0) return
    setPaymentChecking(true)
    setPaymentMethod('pix')
    try {
      if (!pixData) {
        const billing = billingData || await apiService.createBillingPublic(
          plan.price, `Assinatura ${plan.title} - PetFlow`,
          values.email, values.name, values.plan, values.phone,
        )
        if (!billingData) setBillingData(billing)
        if (billing.billing?.pixQrcodeImage || billing.billing?.pixQrcode) {
          setPixData({
            qrcodeImage: billing.billing.pixQrcodeImage,
            qrcode: billing.billing.pixQrcode,
            id: billing.billing.id,
          })
        } else {
          message.error('PIX não disponível. Tente outro método.')
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Erro ao gerar PIX')
    } finally {
      setPaymentChecking(false)
    }
  }

  const handleCheckPayment = async () => {
    setPaymentChecking(true)
    setPaymentStatus('checking')
    try {
      const paymentId = pixData?.id || billingData?.billing?.id
      if (!paymentId) { setPaymentStatus('pending'); return }
      let isPaid = false
      if (pixData?.id) {
        const s = await apiService.checkPixStatus(pixData.id)
        isPaid = s.status === 'PAID'
      } else if (billingData?.billing?.id) {
        const s = await apiService.checkBillingStatus(billingData.billing.id)
        isPaid = s.billing?.status === 'PAID' || s.status === 'PAID'
      }
      if (isPaid) {
        setPaymentStatus('paid')
        message.success('✅ Pagamento confirmado! Você pode prosseguir.')
      } else {
        setPaymentStatus('pending')
        message.warning('⏳ Pagamento ainda não identificado. Tente novamente em alguns instantes.')
      }
    } catch {
      setPaymentStatus('pending')
      message.error('Erro ao verificar pagamento.')
    } finally {
      setPaymentChecking(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = { ...formData, ...form.getFieldsValue() }
      if (!values.name || !values.email || !values.password || !values.plan) {
        message.error('Por favor, preencha todos os campos obrigatórios')
        setLoading(false)
        return
      }
      const plan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
      if (plan && plan.price > 0) {
        if (!billingData && !pixData) { message.error('Realize o pagamento antes de continuar'); setLoading(false); return }
        if (paymentStatus !== 'paid') {
          await handleCheckPayment()
          await new Promise(resolve => setTimeout(resolve, 1500))
          let finalCheck = false
          try {
            if (pixData?.id) {
              const s = await apiService.checkPixStatus(pixData.id)
              finalCheck = s.status === 'PAID'
            } else if (billingData?.billing?.id) {
              const s = await apiService.checkBillingStatus(billingData.billing.id)
              finalCheck = s.billing?.status === 'PAID' || s.status === 'PAID'
            }
          } catch {}
          if (!finalCheck) {
            message.error('❌ Pagamento não confirmado! Verifique o pagamento antes de continuar.')
            setLoading(false)
            return
          }
          setPaymentStatus('paid')
        }
      }
      const planMap: Record<string, string> = {
        FREE_USER: 'FREE', BASIC_USER: 'BASIC', PRO_USER: 'PRO', ENTERPRISE_USER: 'ENTERPRISE',
      }
      await apiService.register({
        tenantName: values.name,
        tenantSubdomain: values.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        tenantContactEmail: values.email,
        tenantPlan: planMap[values.plan],
        email: values.email,
        password: values.password,
        name: values.name,
        role: 'MANAGER',
        planRole: values.plan,
        phone: values.phone,
        marketingOptIn: !!values.marketingOptIn,
        acceptTerms: !!values.acceptTerms,
        transactionId: billingData?.billing?.id || null,
      })
      message.success('Conta criada com sucesso! Faça login para continuar.')
      router.push('/login')
    } catch (error: any) {
      message.error(error.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step content renderers ───────────────────────────────────────────────────

  const renderStep0 = () => (
    <Form layout="vertical" form={form} style={{ marginTop: 8 }}>
      <Form.Item
        name="name"
        label={<span style={labelStyle}>Nome Completo</span>}
        rules={[{ required: true, message: 'Por favor, insira seu nome' }]}
        style={{ marginBottom: 16 }}
      >
        <Input
          prefix={<UserOutlined style={{ color: '#d1d5db', fontSize: 14 }} />}
          size="large"
          placeholder="Seu nome completo"
          style={inputStyle}
        />
      </Form.Item>

      <Form.Item
        name="email"
        label={<span style={labelStyle}>E-mail</span>}
        rules={[
          { required: true, message: 'Por favor, insira seu e-mail' },
          { type: 'email', message: 'E-mail inválido' },
        ]}
        style={{ marginBottom: 16 }}
      >
        <Input
          prefix={<MailOutlined style={{ color: '#d1d5db', fontSize: 14 }} />}
          size="large"
          placeholder="seu@email.com"
          autoComplete="off"
          style={inputStyle}
        />
      </Form.Item>

      <Form.Item
        name="phone"
        label={<span style={labelStyle}>Celular (opcional)</span>}
        rules={[{
          validator: (_, value) => {
            if (!value) return Promise.resolve()
            const digits = String(value).replace(/\D/g, '')
            if (digits.length === 10 || digits.length === 11) return Promise.resolve()
            return Promise.reject('Informe um telefone válido com DDD')
          },
        }]}
        style={{ marginBottom: 16 }}
      >
        <Input
          prefix={<PhoneOutlined style={{ color: '#d1d5db', fontSize: 14 }} />}
          size="large"
          placeholder="(11) 99999-9999"
          style={inputStyle}
          onChange={e => {
            const raw = e.target.value.replace(/\D/g, '')
            let fmt = raw
            if (raw.length > 2) fmt = `(${raw.slice(0, 2)}) ${raw.slice(2)}`
            if (raw.length > 7) fmt = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`
            form.setFieldsValue({ phone: fmt })
          }}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={<span style={labelStyle}>Senha</span>}
        rules={[
          { required: true, message: 'Por favor, insira sua senha' },
          { pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/, message: 'Mínimo 8 caracteres com letras e números' },
        ]}
        style={{ marginBottom: passwordStrength ? 8 : 16 }}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#d1d5db', fontSize: 14 }} />}
          size="large"
          placeholder="Sua senha"
          style={inputStyle}
          onChange={e => {
            const v = e.target.value || ''
            const strong = /^(?=.*[A-Za-z])(?=.*\d).{12,}$/
            const medium = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
            setPasswordStrength(strong.test(v) ? 'strong' : medium.test(v) ? 'medium' : 'weak')
            setTimeout(() => {
              const confirmVal = form.getFieldValue('confirmPassword')
              if (confirmVal) form.validateFields(['confirmPassword']).catch(() => {})
              else form.setFields([{ name: 'confirmPassword', errors: [] }])
            }, 0)
          }}
        />
      </Form.Item>

      {passwordStrength && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Força da senha:</span>
          <div style={{
            display: 'flex',
            gap: 4,
          }}>
            {(['weak', 'medium', 'strong'] as const).map((level, i) => {
              const active = passwordStrength === 'weak' ? i === 0 : passwordStrength === 'medium' ? i <= 1 : true
              const color = passwordStrength === 'weak' ? '#ef4444' : passwordStrength === 'medium' ? '#f59e0b' : '#10b981'
              return (
                <div key={level} style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: active ? color : '#e5e7eb',
                  transition: 'background 0.2s',
                }} />
              )
            })}
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: passwordStrength === 'weak' ? '#ef4444' : passwordStrength === 'medium' ? '#f59e0b' : '#10b981',
              marginLeft: 4,
            }}>
              {passwordStrength === 'weak' ? 'Fraca' : passwordStrength === 'medium' ? 'Média' : 'Forte'}
            </span>
          </div>
        </div>
      )}

      <Form.Item
        name="confirmPassword"
        label={<span style={labelStyle}>Confirmar Senha</span>}
        dependencies={['password']}
        rules={[
          { required: true, message: 'Confirme sua senha' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const pwd = getFieldValue('password')
              if (!value) return Promise.reject(new Error('Confirme sua senha'))
              if (!pwd || pwd === value) return Promise.resolve()
              return Promise.reject(new Error('As senhas não conferem'))
            },
          }),
        ]}
        style={{ marginBottom: 16 }}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#d1d5db', fontSize: 14 }} />}
          size="large"
          placeholder="Repita a senha"
          style={inputStyle}
          onChange={e => {
            const value = e.target.value
            setTimeout(() => {
              const pwd = form.getFieldValue('password')
              if (pwd && value && pwd === value) form.setFields([{ name: 'confirmPassword', errors: [] }])
              else if (pwd && value) form.validateFields(['confirmPassword']).catch(() => {})
            }, 0)
          }}
        />
      </Form.Item>

      <Form.Item name="marketingOptIn" valuePropName="checked" style={{ marginBottom: 8 }}>
        <Checkbox style={{ fontSize: 13, color: '#6b7280' }}>
          Quero receber novidades e ofertas por e-mail
        </Checkbox>
      </Form.Item>

      <Form.Item
        name="acceptTerms"
        valuePropName="checked"
        style={{ marginBottom: 0 }}
        rules={[{
          validator: (_, value) =>
            value === true ? Promise.resolve() : Promise.reject(new Error('Você deve aceitar os termos de uso')),
        }]}
      >
        <Checkbox style={{ fontSize: 13, color: '#6b7280' }}>
          Li e aceito os{' '}
          <a
            onClick={e => { e.preventDefault(); setTermsOpen(true) }}
            style={{ color: '#047857', fontWeight: 600, textDecoration: 'none' }}
          >
            termos de uso
          </a>{' '}
          e a política de privacidade
        </Checkbox>
      </Form.Item>

      <Modal
        title="Termos de Uso"
        open={termsOpen}
        onOk={() => setTermsOpen(false)}
        onCancel={() => setTermsOpen(false)}
        okText="Fechar"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div style={{ maxHeight: 300, overflowY: 'auto', fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
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
  )

  const renderStep1 = () => (
    <Form form={form} layout="vertical">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {Object.entries(AVAILABLE_PLANS).map(([key, plan]) => {
          const cfg = PLAN_COLORS[key]
          const isSelected = selectedPlanKey === key
          return (
            <div
              key={key}
              onClick={() => {
                form.setFieldsValue({ plan: key })
                setSelectedPlanKey(key)
                setFormData((prev: any) => ({ ...prev, plan: key }))
                form.validateFields(['plan']).catch(() => {})
              }}
              style={{
                borderRadius: 12,
                border: isSelected ? `2px solid ${cfg.accent}` : '1px solid #e5e7eb',
                background: isSelected ? cfg.bg : '#fff',
                cursor: 'pointer',
                padding: '16px 14px',
                transition: 'all 0.18s ease',
                position: 'relative',
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: cfg.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11,
                }}>
                  <CheckCircleOutlined />
                </div>
              )}
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: cfg.bg, color: cfg.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, marginBottom: 10,
              }}>
                {cfg.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 2 }}>
                {plan.title}
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: cfg.accent }}>{plan.priceDisplay}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 10px' }}>{plan.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#374151' }}>
                    <CheckCircleOutlined style={{ color: '#10b981', fontSize: 10, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Form.Item
        name="plan"
        rules={[{ required: true, message: 'Por favor, selecione um plano' }]}
        style={{ display: 'none' }}
      >
        <Input />
      </Form.Item>

      {form.getFieldError('plan').length > 0 && (
        <Alert message={form.getFieldError('plan')[0]} type="error" showIcon style={{ marginTop: 12, borderRadius: 8 }} />
      )}
    </Form>
  )

  const renderStep2 = () => {
    const values = { ...formData, ...form.getFieldsValue() }
    const plan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]

    if (!plan || plan.price === 0) {
      return (
        <div style={{ padding: '16px 0' }}>
          <Alert
            message="Plano Gratuito Selecionado"
            description="Você selecionou o plano gratuito. Não é necessário pagamento. Prossiga para a confirmação."
            type="info"
            showIcon
            style={{ borderRadius: 10 }}
          />
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Resumo do plano */}
        <div style={{
          padding: '14px 16px',
          borderRadius: 10,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Plano selecionado
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 800, color: '#064e3b', fontFamily: "'Outfit', sans-serif" }}>
              {plan.title}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#047857' }}>{plan.priceDisplay}</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{plan.period}</span>
          </div>
        </div>

        {/* Métodos de pagamento */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Método de Pagamento
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={handleCreatePix}
              disabled={paymentChecking && paymentMethod === 'pix'}
              style={{
                padding: '14px 10px',
                borderRadius: 10,
                border: paymentMethod === 'pix' ? '2px solid #047857' : '1px solid #e5e7eb',
                background: paymentMethod === 'pix' ? 'rgba(4,120,87,0.05)' : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <QrcodeOutlined style={{ fontSize: 24, color: '#047857', display: 'block', marginBottom: 6 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>PIX</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Aprovação instantânea</div>
            </button>

            {billingData?.billing?.methods?.includes('CARD') &&
             billingData?.billing?.url &&
             billingData.billing.url !== 'about:blank' &&
             !billingData.billing.url.startsWith('data:') && (
              <button
                onClick={() => {
                  setPaymentMethod('card')
                  window.open(billingData.billing.url, '_blank')
                }}
                style={{
                  padding: '14px 10px',
                  borderRadius: 10,
                  border: paymentMethod === 'card' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  background: paymentMethod === 'card' ? 'rgba(59,130,246,0.05)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <CreditCardOutlined style={{ fontSize: 24, color: '#3b82f6', display: 'block', marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Cartão</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Visa, Mastercard, Elo</div>
              </button>
            )}
          </div>
        </div>

        {/* QR Code PIX */}
        {pixData && paymentMethod === 'pix' && (
          <div style={{
            padding: '20px',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            background: '#fff',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
              Escaneie o QRCode com seu app de pagamento
            </p>
            {pixData.qrcodeImage ? (
              <Image
                src={pixData.qrcodeImage}
                alt="QRCode PIX"
                width={220}
                height={220}
                unoptimized
                style={{ border: '1px solid #e5e7eb', borderRadius: 10, margin: '0 auto' }}
              />
            ) : (
              <div style={{ padding: 32, background: '#f9fafb', borderRadius: 10, marginBottom: 12 }}>
                <QrcodeOutlined style={{ fontSize: 80, color: '#9ca3af' }} />
              </div>
            )}
            {(pixData.qrcode || pixData.pixQrcode) && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Ou copie o código PIX:</p>
                <Input.TextArea
                  value={pixData.qrcode || pixData.pixQrcode}
                  readOnly
                  rows={3}
                  style={{ fontFamily: 'monospace', fontSize: 11, borderRadius: 8 }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.qrcode || pixData.pixQrcode)
                      message.success('Código PIX copiado!')
                    }}
                    style={{ borderRadius: 8 }}
                  >
                    Copiar Código PIX
                  </Button>
                  {process.env.NODE_ENV === 'development' && pixData.id && (
                    <Button
                      type="dashed"
                      loading={paymentChecking}
                      onClick={async () => {
                        try {
                          setPaymentChecking(true)
                          await apiService.simulatePixPayment(pixData.id)
                          message.success('Pagamento simulado! Verificando...')
                          await new Promise(r => setTimeout(r, 2000))
                          await handleCheckPayment()
                        } catch (error: any) {
                          message.error(error.message || 'Erro ao simular')
                        } finally {
                          setPaymentChecking(false)
                        }
                      }}
                      style={{ borderRadius: 8 }}
                    >
                      🧪 Simular (Dev)
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status do pagamento */}
        {billingData && (
          <div style={{
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid',
            borderColor: paymentStatus === 'paid' ? '#bbf7d0' : paymentStatus === 'checking' ? '#bfdbfe' : '#fde68a',
            background: paymentStatus === 'paid' ? '#f0fdf4' : paymentStatus === 'checking' ? '#eff6ff' : '#fffbeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {paymentStatus === 'paid' && <CheckCircleOutlined style={{ color: '#047857', fontSize: 18 }} />}
              {paymentStatus === 'checking' && <LoadingOutlined style={{ color: '#3b82f6', fontSize: 18 }} />}
              {paymentStatus === 'pending' && <span style={{ fontSize: 16 }}>⏳</span>}
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: paymentStatus === 'paid' ? '#047857' : paymentStatus === 'checking' ? '#3b82f6' : '#92400e',
              }}>
                {paymentStatus === 'paid' ? 'Pagamento confirmado!' : paymentStatus === 'checking' ? 'Verificando...' : 'Aguardando pagamento'}
              </span>
            </div>
            {paymentStatus === 'pending' && (
              <Button
                type="primary"
                size="small"
                onClick={handleCheckPayment}
                loading={paymentChecking}
                style={{ background: '#047857', border: 'none', borderRadius: 6, fontWeight: 600 }}
              >
                ✅ Já paguei
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderStep3 = () => {
    const values = { ...formData, ...form.getFieldsValue() }
    const plan = AVAILABLE_PLANS[values.plan as keyof typeof AVAILABLE_PLANS]
    const cfg = plan ? PLAN_COLORS[plan.name] : null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Dados pessoais */}
        <div style={confirmCardStyle}>
          <p style={confirmLabelStyle}>Dados Pessoais</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={confirmRowStyle}>
              <span style={confirmKeyStyle}>Nome</span>
              <span style={confirmValStyle}>{values.name || '—'}</span>
            </div>
            <div style={confirmRowStyle}>
              <span style={confirmKeyStyle}>E-mail</span>
              <span style={confirmValStyle}>{values.email || '—'}</span>
            </div>
            {values.phone && (
              <div style={confirmRowStyle}>
                <span style={confirmKeyStyle}>Celular</span>
                <span style={confirmValStyle}>{values.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Plano */}
        {plan && cfg && (
          <div style={{ ...confirmCardStyle, borderColor: cfg.accent + '40' }}>
            <p style={confirmLabelStyle}>Plano Selecionado</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: cfg.bg, color: cfg.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  {cfg.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>
                    {plan.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{plan.description}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: cfg.accent }}>{plan.priceDisplay}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{plan.period}</div>
              </div>
            </div>
          </div>
        )}

        {/* Pagamento confirmado */}
        {paymentStatus === 'paid' && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <CheckCircleOutlined style={{ color: '#047857', fontSize: 16 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#047857' }}>
              Pagamento confirmado e processado com sucesso
            </span>
          </div>
        )}

        {/* Próximos passos */}
        <Alert
          message="Após criar sua conta, você será direcionado para configurar sua empresa, adicionar funcionários, definir capital inicial e cadastrar produtos."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderStep0()
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      default: return null
    }
  }

  // ── Shared styles ────────────────────────────────────────────────────────────

  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#374151' }
  const inputStyle: React.CSSProperties = { borderRadius: 9, height: 44, fontSize: 14 }
  const confirmCardStyle: React.CSSProperties = {
    padding: '14px 16px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#fafafa',
  }
  const confirmLabelStyle: React.CSSProperties = {
    margin: '0 0 10px',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#9ca3af',
  }
  const confirmRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
  const confirmKeyStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280' }
  const confirmValStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#111827' }

  // ── Left panel step indicator ────────────────────────────────────────────────

  const StepIndicator = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {STEPS.map((step, idx) => {
        const done = idx < currentStep
        const active = idx === currentStep
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* connector line + circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: done ? '#10b981' : active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                border: active ? '2px solid #10b981' : done ? 'none' : '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: done ? '#fff' : active ? '#047857' : 'rgba(255,255,255,0.5)',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}>
                {done ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{
                  width: 1,
                  height: 28,
                  background: idx < currentStep ? '#10b981' : 'rgba(255,255,255,0.12)',
                  margin: '3px 0',
                }} />
              )}
            </div>
            {/* label */}
            <div style={{ paddingTop: 4 }}>
              <p style={{
                margin: 0,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? 'rgba(255,255,255,0.95)' : done ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)',
                lineHeight: 1.2,
                transition: 'all 0.2s',
              }}>
                {step.title}
              </p>
              <p style={{
                margin: '2px 0 0',
                fontSize: 11,
                color: active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
              }}>
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )

  // ── Page ─────────────────────────────────────────────────────────────────────

  const stepInfo = STEPS[currentStep]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      background: '#f4f6f9',
    }}>
      {/* Left panel */}
      <div
        className="register-left-panel"
        style={{
          width: '36%',
          background: 'linear-gradient(160deg, #042f1e 0%, #064e3b 50%, #047857 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 280, height: 280,
          background: 'rgba(16,185,129,0.1)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 220, height: 220,
          background: 'rgba(16,185,129,0.08)', borderRadius: '50%',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{
              width: 40, height: 40,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span style={{ fontSize: 20 }}>🐾</span>
            </div>
            <span style={{
              fontSize: 19,
              fontWeight: 800,
              color: 'white',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '-0.3px',
            }}>
              PetFlow
            </span>
          </div>

          {/* Step indicator */}
          <StepIndicator />
        </div>

        {/* Bottom text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 500,
            margin: '0 0 4px',
          }}>
            Junte-se a centenas de petshops
          </p>
          <p style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            margin: 0,
          }}>
            © {new Date().getFullYear()} PetFlow SaaS
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        background: '#f4f6f9',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          {/* Form header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              background: 'rgba(4,120,87,0.08)',
              borderRadius: 20,
              marginBottom: 10,
              border: '1px solid rgba(4,120,87,0.15)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Passo {currentStep + 1} de {STEPS.length}
              </span>
            </div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#111827',
              fontFamily: "'Outfit', sans-serif",
              margin: 0,
              letterSpacing: '-0.4px',
              lineHeight: 1.2,
            }}>
              {stepInfo.title}
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '6px 0 0', fontWeight: 500 }}>
              {stepInfo.description}
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '28px 24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: 20,
          }}>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              icon={<ArrowLeftOutlined />}
              size="large"
              style={{
                height: 46,
                borderRadius: 10,
                fontWeight: 600,
                border: '1px solid #e5e7eb',
                color: '#374151',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                paddingInline: 20,
                opacity: currentStep === 0 ? 0.4 : 1,
              }}
            >
              Anterior
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                loading={loading}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{
                  flex: 1,
                  maxWidth: 280,
                  height: 46,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  background: 'linear-gradient(135deg, #047857, #059669)',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(4,120,87,0.3)',
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? 'Processando...' : 'Próximo'}
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                loading={loading}
                icon={!loading && <CheckCircleOutlined />}
                iconPosition="end"
                style={{
                  flex: 1,
                  maxWidth: 280,
                  height: 46,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  background: 'linear-gradient(135deg, #047857, #059669)',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(4,120,87,0.3)',
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            )}
          </div>

          {/* Login link */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>
              Já tem uma conta?{' '}
              <Link href="/login" style={{ color: '#047857', fontWeight: 700, textDecoration: 'none' }}>
                Fazer login
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Responsive: hide left panel on mobile */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .register-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
