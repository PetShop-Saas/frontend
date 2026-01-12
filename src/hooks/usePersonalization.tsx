import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface PersonalizationSettings {
  bannerUrl: string
  logoUrl: string
  bannerHeight: number
  logoSize: number
  primaryColor: string
  secondaryColor: string
  sidebarColor: string
  headerColor: string
  borderRadius: number
  fontSize: number
  fontFamily: string
  sidebarCollapsed: boolean
  showBanner: boolean
  showLogo: boolean
  siteName: string
  siteDescription: string
  siteTagline: string
}

export function usePersonalization() {
  const [settings, setSettings] = useState<PersonalizationSettings>({
    bannerUrl: '',
    logoUrl: '',
    bannerHeight: 80,
    logoSize: 60,
    primaryColor: '#16a34a',
    secondaryColor: '#15803d',
    sidebarColor: '#064e3b',
    headerColor: '#ffffff',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    sidebarCollapsed: false,
    showBanner: true,
    showLogo: true,
    siteName: 'PetFlow',
    siteDescription: 'Sistema de gestão para petshops',
    siteTagline: 'Cuidando do seu melhor amigo'
  })
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await apiService.getPersonalizationSettings()
      
      if (data) {
        const personalizationData = {
          bannerUrl: typeof (data as any).bannerUrl === 'string' ? (data as any).bannerUrl : '',
          logoUrl: typeof (data as any).logoUrl === 'string' ? (data as any).logoUrl : '', 
          bannerHeight: (data as any).bannerHeight || 80,
          logoSize: (data as any).logoSize || 60,
          primaryColor: typeof (data as any).primaryColor === 'string' ? (data as any).primaryColor : '#16a34a',
          secondaryColor: typeof (data as any).secondaryColor === 'string' ? (data as any).secondaryColor : '#15803d',
          sidebarColor: typeof (data as any).sidebarColor === 'string' ? (data as any).sidebarColor : '#064e3b',
          headerColor: typeof (data as any).headerColor === 'string' ? (data as any).headerColor : '#ffffff',
          borderRadius: (data as any).borderRadius || 8,
          fontSize: (data as any).fontSize || 14,
          fontFamily: (data as any).fontFamily || 'Inter, sans-serif',
          sidebarCollapsed: (data as any).sidebarCollapsed || false,
          showBanner: (data as any).showBanner !== false,
          showLogo: (data as any).showLogo !== false,
          siteName: (data as any).siteName || 'PetShop',
          siteDescription: (data as any).siteDescription || 'Sistema de gestão para petshops',
          siteTagline: (data as any).siteTagline || 'Cuidando do seu melhor amigo'
        }
        
        // Converter URLs de imagens para URLs com token
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        if (personalizationData.bannerUrl && personalizationData.bannerUrl.startsWith('/images/')) {
          personalizationData.bannerUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${personalizationData.bannerUrl}?token=${token}`
        }
        if (personalizationData.logoUrl && personalizationData.logoUrl.startsWith('/images/')) {
          personalizationData.logoUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${personalizationData.logoUrl}?token=${token}`
        }
        
        setSettings(personalizationData)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // Escutar eventos de atualização de personalização
  useEffect(() => {
    const handlePersonalizationUpdate = (event: CustomEvent) => {
      const newSettings = event.detail
      setSettings(prev => ({ ...prev, ...newSettings }))
    }

    window.addEventListener('personalizationUpdated', handlePersonalizationUpdate as EventListener)
    
    return () => {
      window.removeEventListener('personalizationUpdated', handlePersonalizationUpdate as EventListener)
    }
  }, [])

  return { settings, loading, loadSettings }
}
