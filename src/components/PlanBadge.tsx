import React, { useEffect, useState } from 'react'
import { Tag, Tooltip } from 'antd'
import { 
  CrownOutlined, 
  RocketOutlined, 
  ThunderboltOutlined, 
  ExperimentOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons'
import { apiService } from '../services/api'
import { useRouter } from 'next/router'

interface TrialStatus {
  plan: string
  isTrialActive: boolean
  trialExpired: boolean
  daysRemaining: number
  isFreeUser: boolean
}

export const PlanBadge: React.FC = () => {
  const router = useRouter()
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrialStatus()
  }, [])

  const loadTrialStatus = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      if (user.tenantId) {
        const status = await apiService.getTrialStatus(user.tenantId) as any

        // Mapear planRole do usuário para plano de exibição
        const roleToPlanMap: Record<string, string> = {
          'ADMIN': 'ADMIN',
          'ENTERPRISE_USER': 'ENTERPRISE',
          'PRO_USER': 'PRO',
          'BASIC_USER': 'BASIC',
          'FREE_USER': 'FREE',
        }
        const userPlanFromRole = roleToPlanMap[user?.planRole] || null

        // Se o tenant está em FREE (trial), mas o usuário possui planRole pago,
        // priorizar o plano do usuário para exibição do badge
        if (status?.plan === 'FREE' && userPlanFromRole && userPlanFromRole !== 'FREE') {
          setTrialStatus({
            ...status,
            plan: userPlanFromRole,
            isFreeUser: false,
          })
        } else {
          setTrialStatus(status)
        }
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  if (loading || !trialStatus) {
    return null
  }

  const getPlanConfig = () => {
    const plan = trialStatus.plan

    // Plano ADMIN (Administrador)
    if (plan === 'ADMIN') {
      return {
        icon: <CrownOutlined />,
        text: 'ADMIN',
        color: '#f5222d',
        bgColor: '#fff1f0',
        borderColor: '#ffa39e',
        tooltip: 'Plano Administrador - Acesso total ao sistema',
        pulse: false
      }
    }

    // Plano FREE (Demo)
    if (plan === 'FREE') {
      const expired = trialStatus.trialExpired
      const warning = trialStatus.daysRemaining <= 1

      return {
        icon: <ExperimentOutlined />,
        text: expired ? 'DEMO EXPIRADO' : `DEMO (${trialStatus.daysRemaining}d)`,
        color: expired ? '#ff4d4f' : warning ? '#faad14' : '#13c2c2',
        bgColor: expired ? '#fff1f0' : warning ? '#fffbe6' : '#e6fffb',
        borderColor: expired ? '#ffccc7' : warning ? '#ffe58f' : '#87e8de',
        tooltip: expired 
          ? 'Seu período de demonstração expirou. Faça upgrade para continuar.' 
          : `Período de demonstração - ${trialStatus.daysRemaining} dia(s) restante(s)`,
        pulse: expired || warning
      }
    }

    // Planos Pagos
    switch (plan) {
      case 'BASIC':
        return {
          icon: <ThunderboltOutlined />,
          text: 'BÁSICO',
          color: '#1890ff',
          bgColor: '#e6f7ff',
          borderColor: '#91d5ff',
          tooltip: 'Plano Básico - Recursos essenciais para seu negócio',
          pulse: false
        }
      
      case 'PRO':
        return {
          icon: <RocketOutlined />,
          text: 'PRO',
          color: '#722ed1',
          bgColor: '#f9f0ff',
          borderColor: '#d3adf7',
          tooltip: 'Plano Pro - Recursos avançados e suporte prioritário',
          pulse: false
        }
      
      case 'ENTERPRISE':
        return {
          icon: <CrownOutlined />,
          text: 'ENTERPRISE',
          color: '#faad14',
          bgColor: '#fffbe6',
          borderColor: '#ffe58f',
          tooltip: 'Plano Enterprise - Recursos ilimitados e suporte dedicado',
          pulse: false
        }
      
      default:
        return {
          icon: <ClockCircleOutlined />,
          text: plan,
          color: '#8c8c8c',
          bgColor: '#fafafa',
          borderColor: '#d9d9d9',
          tooltip: `Plano: ${plan}`,
          pulse: false
        }
    }
  }

  const config = getPlanConfig()

  const handleClick = () => {
    router.push('/billing')
  }

  return (
    <Tooltip title={config.tooltip} placement="bottom">
      <Tag
        icon={config.icon}
        color={config.color}
        onClick={handleClick}
        style={{
          margin: 0,
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: 600,
          border: `2px solid ${config.borderColor}`,
          backgroundColor: config.bgColor,
          color: config.color,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          animation: config.pulse ? 'pulse 2s infinite' : 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {config.text}
      </Tag>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </Tooltip>
  )
}

export default PlanBadge

