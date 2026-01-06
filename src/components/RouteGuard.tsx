import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePermissions } from '../hooks/usePermissions'

interface RouteGuardProps {
  children: React.ReactNode
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const router = useRouter()
  const { checkRouteAccess, loading, sidebarItems } = usePermissions()

  useEffect(() => {
    if (loading) {
      return
    }

    // Rotas públicas que sempre devem ter acesso
    const publicRoutes = ['/dashboard', '/login', '/', '/complete-registration', '/register']
    if (publicRoutes.includes(router.pathname)) {
      return
    }

    // Se os sidebarItems ainda não foram carregados (mas não está mais loading),
    // verificar se há dados no cache do localStorage
    if (!sidebarItems || sidebarItems.length === 0) {
      const userDataStr = localStorage.getItem('user')
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)
          // Apenas usar cache se existir userSidebarItems válido
          if (userData?.userSidebarItems) {
            try {
              const cachedSidebarItems = JSON.parse(userData.userSidebarItems)
              if (Array.isArray(cachedSidebarItems) && cachedSidebarItems.length > 0) {
                // Verificar se a rota está no cache
                if (cachedSidebarItems.includes(router.pathname)) {
                  return
                } else {
                  router.push('/dashboard')
                  return
                }
              }
            } catch (e) {
              // Ignorar erro ao parsear cache
            }
          }
        } catch (e) {
          // Ignorar erro ao parsear localStorage
        }
      }
      
      // Se não há cache válido, bloquear acesso até carregar do backend
      // Não redirecionar imediatamente, aguardar carregamento das permissões
      return
    }

    // Verificar acesso normalmente
    const hasAccess = checkRouteAccess(router.pathname)
    
    if (!hasAccess) {
      router.push('/dashboard')
    }
  }, [router.pathname, checkRouteAccess, loading, sidebarItems, router])

  return <>{children}</>
}
