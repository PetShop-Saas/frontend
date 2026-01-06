import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface LayoutContextType {
  user: any
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  tenantLogo: string
  setTenantLogo: (logo: string) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [tenantLogo, setTenantLogo] = useState<string>('')
  const router = useRouter()

  // Carregar dados do usuário apenas uma vez
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const userObj = JSON.parse(userData)
        setUser(userObj)
      } catch (error) {
      }
    }
  }, [router])

  const value = {
    user,
    collapsed,
    setCollapsed,
    tenantLogo,
    setTenantLogo
  }

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  )
}
