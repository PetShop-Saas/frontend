import { useState, useEffect } from 'react'

interface UserPermissions {
  sidebarItems: string[]
  permissions: string[]
}

interface User {
  id: string
  email: string
  name: string
  role: string
  userPermissions?: string
  userSidebarItems?: string
}

export const useUserPermissions = (user: User | null) => {
  const [permissions, setPermissions] = useState<UserPermissions>({
    sidebarItems: [],
    permissions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const userPermissions = user.userPermissions ? JSON.parse(user.userPermissions) : []
      const userSidebarItems = user.userSidebarItems ? JSON.parse(user.userSidebarItems) : []

      setPermissions({
        sidebarItems: userSidebarItems,
        permissions: userPermissions
      })
    } catch (error) {
      // Fallback para permissões básicas
      setPermissions({
        sidebarItems: ['/dashboard'],
        permissions: ['dashboard.read']
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  const hasPermission = (permission: string): boolean => {
    return permissions.permissions.includes(permission) || 
           permissions.permissions.includes(permission.split('.')[0] + '.*')
  }

  const hasSidebarItem = (item: string): boolean => {
    return permissions.sidebarItems.includes(item)
  }

  return {
    permissions,
    hasPermission,
    hasSidebarItem,
    loading
  }
}
