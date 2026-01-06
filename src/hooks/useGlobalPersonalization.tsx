import { useEffect } from 'react'
import { usePersonalization } from './usePersonalization'

export function useGlobalPersonalization() {
  const { settings } = usePersonalization()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Aplicar configurações de fonte
    if (settings.fontFamily) {
      document.documentElement.style.setProperty('--font-family', settings.fontFamily)
      document.body.style.fontFamily = settings.fontFamily
    }

    if (settings.fontSize) {
      document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`)
      document.body.style.fontSize = `${settings.fontSize}px`
    }

    // Aplicar configurações de cores
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor)
      document.documentElement.style.setProperty('--ant-primary-color', settings.primaryColor)
    }

    if (settings.secondaryColor) {
      document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor)
    }

    if (settings.sidebarColor) {
      document.documentElement.style.setProperty('--sidebar-color', settings.sidebarColor)
    }

    if (settings.headerColor) {
      document.documentElement.style.setProperty('--header-color', settings.headerColor)
    }

    // Aplicar configurações de bordas
    if (settings.borderRadius) {
      document.documentElement.style.setProperty('--border-radius', `${settings.borderRadius}px`)
    }

    // Aplicar configurações do site
    if (settings.siteName) {
      document.title = settings.siteName
    }

    if (settings.siteDescription) {
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.siteDescription)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = settings.siteDescription
        document.head.appendChild(meta)
      }
    }

    // Aplicar configurações de logo/banner
    if (settings.logoUrl) {
      const favicon = document.querySelector('link[rel="icon"]')
      if (favicon) {
        favicon.setAttribute('href', settings.logoUrl)
      } else {
        const link = document.createElement('link')
        link.rel = 'icon'
        link.href = settings.logoUrl
        document.head.appendChild(link)
      }
    }

  }, [settings])

  return settings
}
