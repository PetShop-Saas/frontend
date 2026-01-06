import React from 'react'
import { useRouter } from 'next/router'
import { usePermissions } from '../hooks/usePermissions'
import { Spin, Result, Button } from 'antd'
import { LockOutlined } from '@ant-design/icons'

interface WithPermissionProps {
  permission?: string
  resource?: string
  action?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPermissionProps = {}
) => {
  const WithPermissionComponent = (props: P) => {
    const { hasPermission, canAccess, loading } = usePermissions()
    const router = useRouter()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      )
    }

    let hasAccess = false

    if (options.permission) {
      hasAccess = hasPermission(options.permission)
    } else if (options.resource && options.action) {
      hasAccess = canAccess(options.resource, options.action)
    } else {
      // Se não especificar permissão, permitir acesso
      hasAccess = true
    }

    if (!hasAccess) {
      if (options.fallback) {
        return <>{options.fallback}</>
      }

      if (options.redirectTo) {
        router.push(options.redirectTo)
        return null
      }

      return (
        <Result
          status="403"
          title="403"
          subTitle="Você não tem permissão para acessar esta página."
          icon={<LockOutlined />}
          extra={
            <Button type="primary" onClick={() => router.push('/')}>
              Voltar ao Início
            </Button>
          }
        />
      )
    }

    return <WrappedComponent {...props} />
  }

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithPermissionComponent
}

// Hook para verificar permissões em componentes
export const usePermissionCheck = (permission?: string, resource?: string, action?: string) => {
  const { hasPermission, canAccess } = usePermissions()

  if (permission) {
    return hasPermission(permission)
  }

  if (resource && action) {
    return canAccess(resource, action)
  }

  return true
}

// Componente para renderizar condicionalmente baseado em permissões
export const PermissionGate: React.FC<{
  permission?: string
  resource?: string
  action?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}> = ({ permission, resource, action, fallback, children }) => {
  const hasAccess = usePermissionCheck(permission, resource, action)

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
