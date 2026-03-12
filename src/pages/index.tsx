import Link from 'next/link'
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { logger } from '../utils/logger'
import {
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  StarOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  ShopOutlined,
  MessageOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [planPricings, setPlanPricings] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const [loadingPrices, setLoadingPrices] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prices, activePromotions] = await Promise.all([
          apiService.getPublicPlanPricings(),
          apiService.getPublicPromotions()
        ])
        setPlanPricings(prices)
        setPromotions(activePromotions)
      } catch (error) {
        logger.error('Erro ao carregar dados:', error)
        setPlanPricings([
          { plan: 'BASIC', price: 59.9 },
          { plan: 'PRO', price: 129.9 },
          { plan: 'ENTERPRISE', price: 229.9 }
        ])
        setPromotions([])
      } finally {
        setLoadingPrices(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    document.body.classList.add('landing-page')
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.hash) {
        e.preventDefault()
        const element = document.querySelector(target.hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
    const anchorLinks = document.querySelectorAll('a[href^="#"]')
    anchorLinks.forEach(link => link.addEventListener('click', handleSmoothScroll))
    return () => {
      document.body.classList.remove('landing-page')
      anchorLinks.forEach(link => link.removeEventListener('click', handleSmoothScroll))
    }
  }, [])

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: 'rgba(4, 47, 30, 0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(16, 185, 129, 0.15)',
  }

  const heroStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #042f1e 0%, #064e3b 60%, #065f46 100%)',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: '80px',
  }

  const statsBarStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #021a12 0%, #042f1e 50%, #021a12 100%)',
    borderTop: '1px solid rgba(16, 185, 129, 0.2)',
    borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
  }

  const ctaFinalStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #042f1e 0%, #047857 50%, #064e3b 100%)',
    position: 'relative',
    overflow: 'hidden',
  }

  const footerStyle: React.CSSProperties = {
    background: '#0a0a0a',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  }

  const proBadgeStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #047857, #064e3b)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    boxShadow: '0 0 40px rgba(16, 185, 129, 0.15), 0 20px 60px rgba(0,0,0,0.3)',
  }

  const browserMockStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(16, 185, 129, 0.08)',
  }

  const testimonials = [
    {
      name: 'Carla Mendonça',
      shop: 'PetCare Premium',
      text: 'O PetFlow transformou nossa clínica. Saímos de planilhas bagunçadas para um sistema completo em menos de uma semana. Nossa equipe adorou a facilidade.',
      role: 'Fundadora',
    },
    {
      name: 'Rafael Torres',
      shop: 'Mundo Animal',
      text: 'Os relatórios financeiros me deram clareza que nunca tive antes. Identifiquei que 30% do faturamento vinha de apenas 15% dos clientes. Mudou nossa estratégia.',
      role: 'Proprietário',
    },
    {
      name: 'Juliana Costa',
      shop: 'VetClínica São Paulo',
      text: 'O agendamento integrado com WhatsApp reduziu em 80% as faltas dos clientes. A comunicação automática é incrível.',
      role: 'Diretora Clínica',
    },
  ]

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fff', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={navStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '24px', lineHeight: 1 }}>🐾</span>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                color: '#fff',
                letterSpacing: '-0.5px',
              }}>
                PetFlow
              </span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { href: '#features', label: 'Funcionalidades' },
                { href: '#pricing', label: 'Planos' },
                { href: '#contact', label: 'Contato' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Entrar
              </Link>
              <Link
                href="/complete-registration"
                style={{
                  background: '#10b981',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.35)' }}
              >
                Começar Agora
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '8px' }}
              aria-label="Abrir menu"
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div
              style={{
                borderTop: '1px solid rgba(16,185,129,0.15)',
                paddingBottom: '16px',
              }}
            >
              {[
                { href: '#features', label: 'Funcionalidades' },
                { href: '#pricing', label: 'Planos' },
                { href: '#contact', label: 'Contato' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.8)',
                    padding: '12px 16px',
                    fontSize: '15px',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ padding: '12px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  href="/login"
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    padding: '10px 20px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  Entrar
                </Link>
                <Link
                  href="/complete-registration"
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Começar Agora
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={heroStyle}>
        {/* Decorative glow orbs */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '80px', paddingBottom: '100px', position: 'relative' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              {/* Pill badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '100px',
                padding: '6px 14px',
                marginBottom: '28px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ color: '#6ee7b7', fontSize: '13px', fontWeight: 500 }}>
                  Novo: White Label disponível em todos os planos
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(40px, 6vw, 68px)',
                lineHeight: 1.08,
                color: '#fff',
                letterSpacing: '-2px',
                margin: 0,
                marginBottom: '24px',
              }}>
                O sistema que seu{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  petshop
                </span>{' '}
                merecia
              </h1>

              <p style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '18px',
                lineHeight: 1.7,
                maxWidth: '480px',
                marginBottom: '36px',
              }}>
                Gerencie clientes, pets, agendamentos, finanças e muito mais em uma plataforma completa. Do pequeno pet shop à grande rede veterinária.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
                <Link
                  href="/complete-registration"
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '14px 28px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 0 30px rgba(16,185,129,0.4)',
                    transition: 'all 0.2s',
                    display: 'inline-block',
                  }}
                >
                  Começar grátis
                </Link>
                <Link
                  href="/login"
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    padding: '14px 28px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.18)',
                    transition: 'all 0.2s',
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  Ver demonstração →
                </Link>
              </div>

              {/* Social proof badges */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  { icon: '✓', text: 'Sem cartão de crédito' },
                  { icon: '⚡', text: 'Setup em 5 minutos' },
                  { icon: '🔒', text: 'Trial de 30 dias' },
                ].map(badge => (
                  <div key={badge.text} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '14px' }}>{badge.icon}</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 500 }}>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="hidden lg:block" style={{ position: 'relative' }}>
              <div style={browserMockStyle}>
                {/* Browser chrome */}
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
                  </div>
                  <div style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.35)',
                    fontFamily: 'monospace',
                  }}>
                    app.petflow.com.br/dashboard
                  </div>
                </div>

                {/* Dashboard content */}
                <div style={{ padding: '24px', background: '#0d1f17' }}>
                  {/* Header bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', fontFamily: "'Outfit', sans-serif" }}>Dashboard</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Março 2026</div>
                    </div>
                    <div style={{
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      color: '#10b981',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      ↑ 23% este mês
                    </div>
                  </div>

                  {/* Metric cards grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { icon: <UserOutlined />, label: 'Clientes', value: '1.247', change: '+12', color: '#10b981' },
                      { icon: <HeartOutlined />, label: 'Pets', value: '2.891', change: '+28', color: '#f472b6' },
                      { icon: <CalendarOutlined />, label: 'Agendamentos', value: '156', change: 'hoje', color: '#60a5fa' },
                      { icon: <DollarOutlined />, label: 'Receita', value: 'R$45.2k', change: '+8%', color: '#fbbf24' },
                    ].map(metric => (
                      <div
                        key={metric.label}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '10px',
                          padding: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ color: metric.color, fontSize: '16px' }}>{metric.icon}</div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: metric.color,
                            background: `${metric.color}18`,
                            padding: '2px 7px',
                            borderRadius: '100px',
                          }}>
                            {metric.change}
                          </span>
                        </div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '20px', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                          {metric.value}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px' }}>{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mini bar chart */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Receita — últimos 7 dias
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px' }}>
                      {[35, 55, 40, 70, 45, 85, 65].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            borderRadius: '4px 4px 0 0',
                            background: i === 5
                              ? 'linear-gradient(180deg, #10b981, #059669)'
                              : 'rgba(16,185,129,0.25)',
                            transition: 'height 0.3s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-24px',
                background: 'rgba(10, 25, 18, 0.95)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '12px',
                padding: '12px 16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '210px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  🐶
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Novo agendamento</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>Rex • Banho e Tosa • 14h00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={statsBarStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '48px 24px' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Petshops', icon: <ShopOutlined /> },
              { value: '50k+', label: 'Pets cadastrados', icon: <HeartOutlined /> },
              { value: '99.9%', label: 'Uptime garantido', icon: <BarChartOutlined /> },
              { value: 'R$2M+', label: 'Processados', icon: <DollarOutlined /> },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(32px, 4vw, 48px)',
                  color: '#10b981',
                  letterSpacing: '-1px',
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '6px', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: '#fff', padding: '100px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
              color: '#059669',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: '100px',
              marginBottom: '16px',
            }}>
              Funcionalidades
            </div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: '#0a0a0a',
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              margin: '0 0 16px',
            }}>
              Tudo que você precisa,<br />em um só lugar
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
              Uma plataforma pensada para o dia a dia de petshops e clínicas veterinárias.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <UserOutlined />,
                color: '#059669',
                bg: 'rgba(5,150,105,0.1)',
                title: 'Gestão de Clientes',
                desc: 'Cadastro completo com histórico de atendimentos, comunicação automatizada e segmentação por perfil.',
              },
              {
                icon: <HeartOutlined />,
                color: '#ec4899',
                bg: 'rgba(236,72,153,0.1)',
                title: 'Controle de Pets',
                desc: 'Prontuário veterinário, histórico de vacinas, tratamentos e ficha médica completa para cada animal.',
              },
              {
                icon: <CalendarOutlined />,
                color: '#3b82f6',
                bg: 'rgba(59,130,246,0.1)',
                title: 'Agendamentos',
                desc: 'Sistema de agenda inteligente com lembretes automáticos via WhatsApp e gestão de horários da equipe.',
              },
              {
                icon: <DollarOutlined />,
                color: '#f59e0b',
                bg: 'rgba(245,158,11,0.1)',
                title: 'Financeiro',
                desc: 'Controle de caixa, fluxo financeiro, contas a pagar/receber e DRE simplificado em tempo real.',
              },
              {
                icon: <SettingOutlined />,
                color: '#8b5cf6',
                bg: 'rgba(139,92,246,0.1)',
                title: 'White Label',
                desc: 'Sua marca, suas cores, seu domínio. Personalize completamente a experiência para seus clientes.',
              },
              {
                icon: <BarChartOutlined />,
                color: '#06b6d4',
                bg: 'rgba(6,182,212,0.1)',
                title: 'Relatórios',
                desc: 'Analytics avançados de faturamento, clientes ativos, serviços mais vendidos e desempenho da equipe.',
              },
            ].map(feat => (
              <div
                key={feat.title}
                style={{
                  background: '#fff',
                  border: '1px solid #f3f4f6',
                  borderRadius: '16px',
                  padding: '28px',
                  transition: 'all 0.25s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = '#d1fae5'
                  el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = '#f3f4f6'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: feat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: feat.color,
                  marginBottom: '20px',
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: '#111827', marginBottom: '10px' }}>
                  {feat.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #fff 100%)', padding: '100px 0' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
              color: '#059669',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: '100px',
              marginBottom: '16px',
            }}>
              Planos e Preços
            </div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: '#0a0a0a',
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              margin: '0 0 16px',
            }}>
              Simples e transparente
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
              Teste grátis por 30 dias, sem cartão de crédito. Cancele quando quiser.
            </p>

            {/* Active promotions */}
            {promotions.length > 0 && (
              <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                {promotions
                  .filter(promo => promo.code)
                  .map(promo => {
                    const planNames: Record<string, string> = { BASIC: 'Starter', PRO: 'Pro', ENTERPRISE: 'Enterprise' }
                    const planName = promo.plan ? planNames[promo.plan] || promo.plan : 'Todos os planos'
                    return (
                      <div
                        key={promo.id}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#fff',
                          padding: '8px 18px',
                          borderRadius: '100px',
                          boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>Cupom: {promo.code}</span>
                        <span>
                          {promo.discountType === 'PERCENTAGE'
                            ? `${promo.discountValue}% OFF`
                            : `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(promo.discountValue)} OFF`}
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '100px', fontSize: '12px' }}>
                          {planName}
                        </span>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* Starter */}
            {(() => {
              const basicPrice = planPricings.find(p => p.plan === 'BASIC')
              const basicDirectPromo = promotions.find(p => !p.code && (!p.plan || p.plan === 'BASIC'))
              const basicPriceFormatted = basicPrice
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(basicPrice.price)
                : 'R$ 59,90'
              let finalPrice = basicPrice?.price || 59.9
              if (basicDirectPromo && basicPrice) {
                if (basicDirectPromo.discountType === 'PERCENTAGE') {
                  finalPrice = basicPrice.price * (1 - basicDirectPromo.discountValue / 100)
                } else {
                  finalPrice = Math.max(0, basicPrice.price - basicDirectPromo.discountValue)
                }
              }
              const finalPriceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice)
              return (
                <div style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '32px',
                }}>
                  <div style={{ marginBottom: '28px' }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '22px', color: '#111827', margin: '0 0 4px' }}>Starter</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Perfeito para começar</p>
                    {basicDirectPromo && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{
                          background: 'rgba(5,150,105,0.1)',
                          color: '#059669',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          {basicDirectPromo.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: '28px' }}>
                    {basicDirectPromo && (
                      <div style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'line-through', marginBottom: '4px' }}>
                        {basicPriceFormatted}/mês
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '42px', color: '#111827', letterSpacing: '-1px' }}>
                        {loadingPrices ? '...' : (basicDirectPromo ? finalPriceFormatted : basicPriceFormatted)}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '15px' }}>/mês</span>
                    </div>
                  </div>
                  <Link
                    href="/complete-registration"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: '#111827',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '15px',
                      textDecoration: 'none',
                      marginBottom: '28px',
                      transition: 'background 0.2s',
                    }}
                  >
                    Começar grátis
                  </Link>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Até 100 clientes', 'Até 200 pets', 'Agendamentos ilimitados', 'Relatórios básicos', 'Suporte por email'].map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#374151' }}>
                        <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px', flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            {/* Pro (highlighted) */}
            {(() => {
              const proPrice = planPricings.find(p => p.plan === 'PRO')
              const proDirectPromo = promotions.find(p => !p.code && (!p.plan || p.plan === 'PRO'))
              const proPriceFormatted = proPrice
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proPrice.price)
                : 'R$ 129,90'
              let finalPrice = proPrice?.price || 129.9
              if (proDirectPromo && proPrice) {
                if (proDirectPromo.discountType === 'PERCENTAGE') {
                  finalPrice = proPrice.price * (1 - proDirectPromo.discountValue / 100)
                } else {
                  finalPrice = Math.max(0, proPrice.price - proDirectPromo.discountValue)
                }
              }
              const finalPriceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice)
              return (
                <div style={{ ...proBadgeStyle, borderRadius: '20px', padding: '32px', position: 'relative' }}>
                  {/* Most popular tag */}
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    color: '#78350f',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '5px 16px',
                    borderRadius: '100px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(251,191,36,0.4)',
                  }}>
                    Mais Popular
                  </div>
                  <div style={{ marginBottom: '28px' }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '22px', color: '#fff', margin: '0 0 4px' }}>Pro</h3>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: 0 }}>Para petshops em crescimento</p>
                    {proDirectPromo && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{
                          background: 'rgba(251,191,36,0.2)',
                          color: '#fbbf24',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          {proDirectPromo.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: '28px' }}>
                    {proDirectPromo && (
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textDecoration: 'line-through', marginBottom: '4px' }}>
                        {proPriceFormatted}/mês
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '42px', color: '#fbbf24', letterSpacing: '-1px' }}>
                        {loadingPrices ? '...' : (proDirectPromo ? finalPriceFormatted : proPriceFormatted)}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>/mês</span>
                    </div>
                  </div>
                  <Link
                    href="/complete-registration"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: '#fbbf24',
                      color: '#78350f',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '15px',
                      textDecoration: 'none',
                      marginBottom: '28px',
                      boxShadow: '0 4px 16px rgba(251,191,36,0.4)',
                    }}
                  >
                    Começar grátis
                  </Link>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Até 500 clientes', 'Até 1.000 pets', 'Agendamentos + WhatsApp', 'Relatórios avançados', 'Histórico médico completo', 'Suporte prioritário'].map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                        <CheckCircleOutlined style={{ color: '#fbbf24', fontSize: '16px', flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            {/* Enterprise */}
            {(() => {
              const enterprisePrice = planPricings.find(p => p.plan === 'ENTERPRISE')
              const enterpriseDirectPromo = promotions.find(p => !p.code && (!p.plan || p.plan === 'ENTERPRISE'))
              const enterprisePriceFormatted = enterprisePrice
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(enterprisePrice.price)
                : 'R$ 229,90'
              let finalPrice = enterprisePrice?.price || 229.9
              if (enterpriseDirectPromo && enterprisePrice) {
                if (enterpriseDirectPromo.discountType === 'PERCENTAGE') {
                  finalPrice = enterprisePrice.price * (1 - enterpriseDirectPromo.discountValue / 100)
                } else {
                  finalPrice = Math.max(0, enterprisePrice.price - enterpriseDirectPromo.discountValue)
                }
              }
              const finalPriceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice)
              return (
                <div style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '32px',
                }}>
                  <div style={{ marginBottom: '28px' }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '22px', color: '#111827', margin: '0 0 4px' }}>Enterprise</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Para grandes operações</p>
                    {enterpriseDirectPromo && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{
                          background: 'rgba(5,150,105,0.1)',
                          color: '#059669',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          {enterpriseDirectPromo.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: '28px' }}>
                    {enterpriseDirectPromo && (
                      <div style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'line-through', marginBottom: '4px' }}>
                        {enterprisePriceFormatted}/mês
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '42px', color: '#111827', letterSpacing: '-1px' }}>
                        {loadingPrices ? '...' : (enterpriseDirectPromo ? finalPriceFormatted : enterprisePriceFormatted)}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '15px' }}>/mês</span>
                    </div>
                  </div>
                  <Link
                    href="/complete-registration"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: '#111827',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '15px',
                      textDecoration: 'none',
                      marginBottom: '28px',
                    }}
                  >
                    Falar com vendas
                  </Link>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Clientes ilimitados', 'Pets ilimitados', 'White Label completo', 'API personalizada', 'Suporte dedicado 24/7', 'Treinamento personalizado'].map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#374151' }}>
                        <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px', flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#f9fafb', padding: '100px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
              color: '#059669',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: '100px',
              marginBottom: '16px',
            }}>
              Depoimentos
            </div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: '#0a0a0a',
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              margin: 0,
            }}>
              Quem usa, recomenda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div
                key={t.name}
                style={{
                  background: '#fff',
                  border: '1px solid #f3f4f6',
                  borderRadius: '16px',
                  padding: '28px',
                }}
              >
                <div style={{ display: 'flex', gap: '4px', marginBottom: '18px' }}>
                  {[...Array(5)].map((_, i) => (
                    <StarOutlined key={i} style={{ color: '#fbbf24', fontSize: '14px' }} />
                  ))}
                </div>
                <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.7, margin: '0 0 24px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #047857, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '15px',
                    flexShrink: 0,
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{t.role} · {t.shop}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: '#fff', padding: '100px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
              color: '#059669',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: '100px',
              marginBottom: '16px',
            }}>
              Contato
            </div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 44px)',
              color: '#0a0a0a',
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              margin: '0 0 12px',
            }}>
              Fale com nossa equipe
            </h2>
            <p style={{ color: '#6b7280', fontSize: '17px', maxWidth: '480px', margin: '0 auto' }}>
              Estamos prontos para ajudar você a transformar seu petshop.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MessageOutlined />, color: '#059669', bg: 'rgba(5,150,105,0.1)', title: 'Email', info: 'contato@petflow.com.br' },
              { icon: <BellOutlined />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', title: 'WhatsApp', info: '(11) 99999-9999' },
              { icon: <TeamOutlined />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', title: 'Suporte', info: 'Seg a Sex, 9h–18h' },
            ].map(c => (
              <div key={c.title} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: c.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  color: c.color,
                  margin: '0 auto 16px',
                }}>
                  {c.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827', marginBottom: '6px' }}>{c.title}</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>{c.info}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={ctaFinalStyle}>
        {/* Glow decoration */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '100px 24px', textAlign: 'center', position: 'relative' }}>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 56px)',
            color: '#fff',
            letterSpacing: '-2px',
            lineHeight: 1.1,
            margin: '0 0 20px',
          }}>
            Pronto para transformar<br />seu petshop?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Junte-se a mais de 500 petshops que já escolheram o PetFlow para crescer.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/complete-registration"
              style={{
                background: '#10b981',
                color: '#fff',
                padding: '15px 32px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 0 40px rgba(16,185,129,0.4)',
              }}
            >
              Começar grátis — 30 dias
            </Link>
            <Link
              href="/login"
              style={{
                color: 'rgba(255,255,255,0.85)',
                padding: '15px 32px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={footerStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '72px 24px 40px' }}>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
            {/* Brand col */}
            <div className="xl:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🐾</span>
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: '22px',
                  color: '#fff',
                  letterSpacing: '-0.5px',
                }}>
                  PetFlow
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', lineHeight: 1.7, maxWidth: '280px', margin: 0 }}>
                O sistema completo para gerenciar seu petshop ou clínica veterinária. Tecnologia de ponta para o mercado pet.
              </p>
              {/* Footer stats */}
              <div style={{ display: 'flex', gap: '28px', marginTop: '8px' }}>
                {[
                  { v: '500+', l: 'Petshops' },
                  { v: '50k+', l: 'Pets' },
                  { v: '99.9%', l: 'Uptime' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '22px', color: '#10b981', letterSpacing: '-0.5px' }}>{s.v}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                title: 'Produto',
                links: [
                  { href: '#features', label: 'Funcionalidades' },
                  { href: '#pricing', label: 'Planos' },
                  { href: '#', label: 'API' },
                  { href: '#', label: 'Integrações' },
                ],
              },
              {
                title: 'Suporte',
                links: [
                  { href: '#', label: 'Documentação' },
                  { href: '#contact', label: 'Contato' },
                  { href: '#', label: 'Status' },
                  { href: '#', label: 'Comunidade' },
                ],
              },
              {
                title: 'Empresa',
                links: [
                  { href: '#', label: 'Sobre nós' },
                  { href: '#', label: 'Blog' },
                  { href: '#', label: 'Carreiras' },
                  { href: '#', label: 'Parceiros' },
                ],
              },
            ].map(col => (
              <div key={col.title}>
                <div style={{
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}>
                  {col.title}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{
            marginTop: '60px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>
              &copy; 2026 PetFlow. Todos os direitos reservados.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Termos', 'Privacidade', 'Cookies'].map(item => (
                <a
                  key={item}
                  href="#"
                  style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
