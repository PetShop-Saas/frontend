import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import type { ApiUser, UserPermissionsResponse } from '@/types/api'

interface UserPermissions {
  permissions: string[]
  sidebarItems: string[]
}

export const useSecureAuth = () => {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        setIsAuthenticated(false)
        return
      }

      // Buscar dados do usuário do backend (não do localStorage)
      const userData = await apiService.getCurrentUser()
      const permResponse = await apiService.getUserPermissions(userData.id)

      setUser(userData)
      setPermissions({
        permissions: permResponse.permissions ?? [],
        sidebarItems: permResponse.sidebarItems ?? []
      })
      setIsAuthenticated(true)
    } catch (error) {
      // Se falhar, limpar token e redirecionar para login
      localStorage.removeItem('token')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Armazenar apenas o token
        localStorage.setItem('token', data.access_token)
        
        // Buscar dados do usuário do backend
        await checkAuth()
        
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || 'Erro ao fazer login' }
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setPermissions(null)
    setIsAuthenticated(false)
  }

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false
    return permissions.permissions.includes(permission)
  }

  const canAccess = (resource: string, action: string): boolean => {
    return hasPermission(`${resource}.${action}`) || hasPermission(`${resource}.*`)
  }

  return {
    user,
    permissions,
    loading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    canAccess,
    checkAuth
  }
}
