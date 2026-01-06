import Link from 'next/link'
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    // Aplicar classe no body para permitir scroll
    document.body.classList.add('landing-page')
    
    // Adicionar scroll suave para links âncora
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.hash) {
        e.preventDefault()
        const element = document.querySelector(target.hash)
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    }

    // Adicionar event listeners para todos os links âncora
    const anchorLinks = document.querySelectorAll('a[href^="#"]')
    anchorLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll)
    })
    
    // Cleanup ao desmontar
    return () => {
      document.body.classList.remove('landing-page')
      anchorLinks.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll)
      })
    }
  }, [])

  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <HeartOutlined className="text-white text-lg" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">PetShop SaaS</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Funcionalidades
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Planos
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contato
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/complete-registration"
                className="text-green-600 text-sm font-medium hover:text-green-700 transition-all duration-200"
              >
                Começar Agora
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                <a href="#features" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                  Funcionalidades
                </a>
                <a href="#pricing" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                  Planos
                </a>
                <a href="#contact" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                  Contato
                </a>
                <Link href="/login" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">
                  Entrar
                </Link>
                <Link href="/complete-registration" className="text-green-600 block px-3 py-2 rounded-md text-base font-medium">
                  Começar Agora
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 pt-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                O sistema completo para{' '}
                <span className="text-yellow-300">seu petshop</span>
              </h1>
              <p className="mt-6 text-xl text-green-100 leading-relaxed">
                Gerencie clientes, pets, agendamentos, vendas e muito mais em uma única plataforma. 
                Sistema white-label para petshops e clínicas veterinárias.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/complete-registration"
                  className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-200 text-center"
                >
                  Começar Agora
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition-all duration-200 text-center"
                >
                  Já tenho conta
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-6">
                <div className="flex items-center">
                  <CheckCircleOutlined className="text-yellow-300 text-xl mr-2" />
                  <span className="text-green-100">Sem cartão de crédito</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleOutlined className="text-yellow-300 text-xl mr-2" />
                  <span className="text-green-100">Setup em 5 minutos</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <UserOutlined className="text-2xl mr-2" />
                        <span className="font-semibold">Clientes</span>
                      </div>
                      <div className="text-2xl font-bold">1,247</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <HeartOutlined className="text-2xl mr-2" />
                        <span className="font-semibold">Pets</span>
                      </div>
                      <div className="text-2xl font-bold">2,891</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CalendarOutlined className="text-2xl mr-2" />
                        <span className="font-semibold">Agendamentos</span>
                      </div>
                      <div className="text-2xl font-bold">156</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <DollarOutlined className="text-2xl mr-2" />
                        <span className="font-semibold">Vendas</span>
                      </div>
                      <div className="text-2xl font-bold">R$ 45.2k</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Funcionalidades</h2>
            <p className="mt-2 text-4xl leading-8 font-bold tracking-tight text-gray-900 sm:text-5xl">
              Tudo que você precisa para gerenciar seu petshop
            </p>
            <p className="mt-4 max-w-3xl text-xl text-gray-600 mx-auto">
              Uma plataforma completa com todas as ferramentas necessárias para o sucesso do seu negócio.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserOutlined className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gestão de Clientes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cadastre e gerencie informações completas dos seus clientes com histórico de atendimentos e comunicação automatizada.
                </p>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <HeartOutlined className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Controle de Pets</h3>
                <p className="text-gray-600 leading-relaxed">
                  Mantenha o histórico completo dos pets com informações médicas, vacinas, tratamentos e prontuário veterinário.
                </p>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CalendarOutlined className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Agendamentos</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sistema completo de agendamento com lembretes automáticos, gestão de horários e integração com WhatsApp.
                </p>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <DollarOutlined className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Controle Financeiro</h3>
                <p className="text-gray-600 leading-relaxed">
                  Gerencie vendas, produtos, estoque, relatórios financeiros detalhados e controle de fluxo de caixa.
                </p>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChartOutlined className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Relatórios Avançados</h3>
                <p className="text-gray-600 leading-relaxed">
                  Relatórios detalhados de vendas, clientes, pets, performance do negócio e analytics em tempo real.
                </p>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <SettingOutlined className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">White Label</h3>
                <p className="text-gray-600 leading-relaxed">
                  Personalize completamente o sistema com sua marca, cores, logo e domínio personalizado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Planos</h2>
            <p className="mt-2 text-4xl leading-8 font-bold tracking-tight text-gray-900 sm:text-5xl">
              Escolha o plano ideal para seu petshop
            </p>
            <p className="mt-4 max-w-3xl text-xl text-gray-600 mx-auto">
              Planos flexíveis que crescem com seu negócio. Teste grátis por 30 dias em todos os planos.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Plano Starter */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-green-200 transition-colors duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                <p className="mt-2 text-gray-600">Perfeito para começar</p>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-gray-900">R$ 97</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Até 100 clientes</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Até 200 pets</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Agendamentos ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Link
                  href="/complete-registration"
                  className="mt-8 w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 block text-center"
                >
                  Começar Agora
                </Link>
              </div>
            </div>

            {/* Plano Professional - Destaque */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-8 rounded-2xl shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                  Mais Popular
                </span>
              </div>
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold">Professional</h3>
                <p className="mt-2 text-green-100">Para petshops em crescimento</p>
                <div className="mt-6">
                  <span className="text-5xl font-bold">R$ 197</span>
                  <span className="text-green-100">/mês</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-yellow-300 text-xl mr-3" />
                    <span>Até 500 clientes</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-yellow-300 text-xl mr-3" />
                    <span>Até 1.000 pets</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-yellow-300 text-xl mr-3" />
                    <span>Agendamentos + WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-yellow-300 text-xl mr-3" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-yellow-300 text-xl mr-3" />
                    <span>Histórico médico completo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-yellow-300 text-xl mr-3" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Link
                  href="/complete-registration"
                  className="mt-8 w-full bg-yellow-400 text-green-800 py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200 block text-center"
                >
                  Começar Agora
                </Link>
              </div>
            </div>

            {/* Plano Enterprise */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-green-200 transition-colors duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                <p className="mt-2 text-gray-600">Para grandes operações</p>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-gray-900">R$ 397</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Clientes ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Pets ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>White Label completo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>API personalizada</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Suporte dedicado</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                    <span>Treinamento personalizado</span>
                  </li>
                </ul>
                <Link
                  href="/complete-registration"
                  className="mt-8 w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 block text-center"
                >
                  Começar Agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Contato</h2>
            <p className="mt-2 text-4xl leading-8 font-bold tracking-tight text-gray-900 sm:text-5xl">
              Entre em contato conosco
            </p>
            <p className="mt-4 max-w-3xl text-xl text-gray-600 mx-auto">
              Tem alguma dúvida? Nossa equipe está pronta para ajudar você a transformar seu petshop.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MessageOutlined className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Email</h3>
              <p className="text-gray-600">contato@petshopsaas.com</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <BellOutlined className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">WhatsApp</h3>
              <p className="text-gray-600">(11) 99999-9999</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <TeamOutlined className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suporte</h3>
              <p className="text-gray-600">Segunda a Sexta, 9h às 18h</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para revolucionar seu petshop?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Junte-se a centenas de petshops que já transformaram seus negócios
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/complete-registration"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-200"
            >
              Começar Agora
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition-all duration-200"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="xl:grid xl:grid-cols-4 xl:gap-8">
            <div className="space-y-8 xl:col-span-2">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <HeartOutlined className="text-white text-lg" />
                </div>
                <span className="ml-3 text-2xl font-bold text-white">PetShop SaaS</span>
              </div>
              <p className="text-gray-400 text-lg max-w-md">
                O sistema completo para gerenciar seu petshop ou clínica veterinária. 
                Transforme seu negócio com tecnologia de ponta.
              </p>
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">500+</div>
                  <div className="text-gray-400">Petshops</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">50k+</div>
                  <div className="text-gray-400">Pets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">99.9%</div>
                  <div className="text-gray-400">Uptime</div>
                </div>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-green-400 tracking-wider uppercase">Produto</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#features" className="text-base text-gray-300 hover:text-green-400 transition-colors">Funcionalidades</a></li>
                    <li><a href="#pricing" className="text-base text-gray-300 hover:text-green-400 transition-colors">Planos</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-green-400 transition-colors">API</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-green-400 transition-colors">Integrações</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-green-400 tracking-wider uppercase">Suporte</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-300 hover:text-green-400 transition-colors">Documentação</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-green-400 transition-colors">Contato</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-green-400 transition-colors">Status</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-green-400 transition-colors">Comunidade</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-base text-gray-400">
                &copy; 2024 PetShop SaaS. Todos os direitos reservados.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Termos</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacidade</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

