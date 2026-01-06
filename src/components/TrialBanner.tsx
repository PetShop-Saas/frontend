import React, { useEffect, useState } from 'react'
import { Alert, Button, Modal } from 'antd'
import { WarningOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'
import { useRouter } from 'next/router'

interface TrialStatus {
  tenantId: string
  tenantName: string
  plan: string
  billingStatus: string
  isTrialActive: boolean
  trialExpired: boolean
  trialEndsAt: string
  daysRemaining: number
  isFreeUser: boolean
  needsUpgrade: boolean
}

export const TrialBanner: React.FC = () => {
  const router = useRouter()
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [showModal, setShowModal] = useState(false)
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
        setTrialStatus(status)

        // Se o trial expirou, mostra modal automaticamente
        if (status.trialExpired && status.isFreeUser) {
          setShowModal(true)
        }
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/billing')
    setShowModal(false)
  }

  if (loading || !trialStatus || !trialStatus.isFreeUser || trialStatus.plan === 'ADMIN') {
    return null
  }

  // Trial expirado
  if (trialStatus.trialExpired) {
    return (
      <>
        <Alert
          message="Período de demonstração expirado"
          description={
            <div>
              Seu período de demonstração de 3 dias expirou. Para continuar usando o sistema, por favor assine um dos nossos planos.
              <Button 
                type="primary" 
                size="small" 
                onClick={handleUpgrade}
                style={{ marginLeft: 10 }}
              >
                Assinar Agora
              </Button>
            </div>
          }
          type="error"
          icon={<WarningOutlined />}
          banner
          closable={false}
        />

        <Modal
          title="Período de Demonstração Expirado"
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setShowModal(false)}>
              Fechar
            </Button>,
            <Button key="upgrade" type="primary" onClick={handleUpgrade}>
              Ver Planos
            </Button>,
          ]}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <WarningOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 20 }} />
            <h3>Seu período de demonstração expirou!</h3>
            <p>
              Para continuar usando todas as funcionalidades do sistema,
              escolha um plano que melhor se adequa às suas necessidades.
            </p>
            <p style={{ marginTop: 20, color: '#666' }}>
              <strong>Plano atual:</strong> {trialStatus.plan}<br />
              <strong>Expirou em:</strong> {new Date(trialStatus.trialEndsAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </Modal>
      </>
    )
  }

  // Trial ativo mas próximo de expirar (1 dia ou menos)
  if (trialStatus.isTrialActive && trialStatus.daysRemaining <= 1) {
    return (
      <Alert
        message={`Seu período de demonstração expira em ${trialStatus.daysRemaining} dia${trialStatus.daysRemaining !== 1 ? 's' : ''}`}
        description={
          <div>
            Aproveite nossos planos e continue usando o sistema sem interrupções.
            <Button 
              type="primary" 
              size="small" 
              onClick={handleUpgrade}
              style={{ marginLeft: 10 }}
            >
              Ver Planos
            </Button>
          </div>
        }
        type="warning"
        icon={<ClockCircleOutlined />}
        banner
        closable
      />
    )
  }

  // Trial ativo com mais de 1 dia
  if (trialStatus.isTrialActive) {
    return (
      <Alert
        message={`Período de demonstração - ${trialStatus.daysRemaining} dias restantes`}
        description={
          <div>
            Você está usando o plano FREE (demonstração). Conheça nossos planos e escolha o melhor para você.
            <Button 
              type="link" 
              size="small" 
              onClick={handleUpgrade}
            >
              Ver Planos
            </Button>
          </div>
        }
        type="info"
        icon={<ClockCircleOutlined />}
        banner
        closable
        style={{ marginBottom: 0 }}
      />
    )
  }

  return null
}

export default TrialBanner

