import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePermissions } from '../hooks/usePermissions'

interface RouteGuardProps {
  children: React.ReactNode
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const router = useRouter()
  const { checkRouteAccess, loading, sidebarItems, user } = usePermissions()

  useEffect(() => {
    if (loading) {
      return
    }

    // Rotas públicas que sempre devem ter acesso
    const publicRoutes = ['/dashboard', '/login', '/', '/complete-registration', '/register']
    if (publicRoutes.includes(router.pathname)) {
      return
    }

    // Rotas admin que devem permitir acesso se o usuário for admin
    const adminRoutes = ['/pricing-management', '/admin-dashboard', '/admin-billing', '/unified-access-management', '/personalization', '/audit-logs', '/backup', '/settings']
    const isAdminRoute = adminRoutes.includes(router.pathname)
    
    if (isAdminRoute) {
      const userDataStr = localStorage.getItem('user')
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)
          const isAdmin = userData?.role === 'ADMIN' || userData?.planRole === 'ADMIN'
          if (isAdmin) {
            // Permitir acesso para admin mesmo se não estiver nos sidebarItems ainda
            return
          }
        } catch (e) {
          // Ignorar erro ao parsear
        }
      }
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
                } else if (!isAdminRoute) {
                  // Se não for rota admin e não estiver no cache, redirecionar
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
      
      // Se não há cache válido e não é rota admin, bloquear acesso até carregar do backend
      // Não redirecionar imediatamente para rotas admin, aguardar carregamento das permissões
      if (!isAdminRoute) {
        return
      }
    }

    // Verificar acesso normalmente
    const hasAccess = checkRouteAccess(router.pathname)
    
    if (!hasAccess) {
      // Se for rota admin e usuário for admin, permitir acesso mesmo sem estar nos sidebarItems
      if (isAdminRoute && user) {
        const isAdmin = user.role === 'ADMIN' || user.planRole === 'ADMIN'
        if (isAdmin) {
          return
        }
      }
      router.push('/dashboard')
    }
  }, [router.pathname, checkRouteAccess, loading, sidebarItems, router, user])

  return <>{children}</>
}
