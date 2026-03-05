import { useState, useEffect, createContext, useContext } from 'react'
import { apiService } from '../services/api'

interface User {
  id: string
  name: string
  email: string
  role: string
  planRole?: string
  userSidebarItems?: string
}

interface PermissionContextType {
  user: User | null
  permissions: string[]
  sidebarItems: any[]
  loading: boolean
  hasPermission: (permission: string) => boolean
  canAccess: (resource: string, action: string) => boolean
  canAccessSidebarItem: (itemKey: string) => boolean
  checkRouteAccess: (pathname: string) => boolean
  refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export const usePermissions = () => {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [sidebarItems, setSidebarItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setUser(null)
        setPermissions([])
        setSidebarItems([])
        return
      }

      // Tentar carregar dados do usuário atual
      let userData: any = null
      try {
        userData = await apiService.getCurrentUser() as any
      } catch (error: any) {
        // Se falhar, tentar usar dados do localStorage
        const userDataStr = localStorage.getItem('user')
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr)
          } catch (e) {
            // Ignorar erro ao parsear
          }
        }
      }

      // Buscar permissões e sidebar items
      // O endpoint /permissions/user retorna dados do usuário autenticado atual
      let userPermissionsData: any = { permissions: [], sidebarItems: [] }
      try {
        // Não precisa passar userId, o endpoint retorna dados do usuário autenticado
        userPermissionsData = await apiService.getUserPermissions('') as any
      } catch (error: any) {
        // Se falhar, tentar usar dados do localStorage (cache do usuário)
        // Mas apenas se o usuário já tinha sidebarItems salvos anteriormente
        if (userData?.userSidebarItems) {
          try {
            const cachedSidebarItems = JSON.parse(userData.userSidebarItems)
            if (Array.isArray(cachedSidebarItems) && cachedSidebarItems.length > 0) {
              userPermissionsData.sidebarItems = cachedSidebarItems
            }
          } catch (e) {
            // Ignorar erro ao parsear
          }
        }
        
        // Se ainda não tem sidebarItems após tentar cache, deixar vazio
        // Isso força o sistema a sempre buscar do backend na próxima vez
        if (!userPermissionsData.sidebarItems || userPermissionsData.sidebarItems.length === 0) {
          userPermissionsData.sidebarItems = []
        }
      }
      
      setUser(userData)
      setPermissions(userPermissionsData.permissions || [])
      setSidebarItems(userPermissionsData.sidebarItems || [])
      
      // Atualizar localStorage com dados atualizados do backend
      if (userData && userPermissionsData.sidebarItems && userPermissionsData.sidebarItems.length > 0) {
        const updatedUser = {
          ...userData,
          userSidebarItems: JSON.stringify(userPermissionsData.sidebarItems)
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      // Se houver erro, limpar dados
      setUser(null)
      setPermissions([])
      setSidebarItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions()
  }, [])

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const canAccess = (resource: string, action: string): boolean => {
    const permission = `${resource}.${action}`
    return hasPermission(permission)
  }

  const canAccessSidebarItem = (itemKey: string): boolean => {
    // Verificar se o item está na lista de sidebar items permitidos
    const hasAccess = sidebarItems.includes(itemKey)
    return hasAccess
  }

  const checkRouteAccess = (pathname: string): boolean => {
    // Rotas públicas sempre têm acesso
    const publicRoutes = ['/dashboard', '/login', '/', '/complete-registration']
    if (publicRoutes.includes(pathname)) {
      return true
    }

    // Se não há sidebarItems carregados, bloquear acesso até carregar
    // (dados devem vir sempre do backend)
    if (!sidebarItems || sidebarItems.length === 0) {
      return false
    }

    // Mapear rotas para itens da sidebar
    const routeToSidebarItem: { [key: string]: string } = {
      '/customers': '/customers',
      '/pets': '/pets',
      '/appointments': '/appointments',
      '/calendar': '/calendar',
      '/services': '/services',
      '/operations': '/operations',
      '/products': '/products',
      '/sales': '/sales',
      '/suppliers': '/suppliers',
      '/purchases': '/purchases',
      '/medical-records': '/medical-records',
      '/hotel': '/hotel',
      '/cash-flow': '/cash-flow',
      '/financial-reports': '/financial-reports',
      '/billing': '/billing',
      '/communications': '/communications',
      '/notifications': '/notifications',
      '/tickets': '/tickets',
      '/management': '/management',
      '/unified-access-management': '/unified-access-management',
      '/personalization': '/personalization',
      '/audit-logs': '/audit-logs',
      '/backup': '/backup',
      '/settings': '/settings',
      '/pricing-management': '/pricing-management',
      '/admin-dashboard': '/admin-dashboard',
      '/admin-billing': '/admin-billing',
    }

    const sidebarItem = routeToSidebarItem[pathname]
    
    // Se não é uma rota protegida, permitir acesso
    if (!sidebarItem) {
      return true
    }

    // Verificar se o usuário tem acesso ao item da sidebar
    return canAccessSidebarItem(sidebarItem)
  }

  const refreshPermissions = async () => {
    await loadPermissions()
  }

  const value: PermissionContextType = {
    user,
    permissions,
    sidebarItems,
    loading,
    hasPermission,
    canAccess,
    canAccessSidebarItem,
    checkRouteAccess,
    refreshPermissions
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}
