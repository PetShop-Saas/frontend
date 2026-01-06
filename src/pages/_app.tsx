import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import '../styles/sidebar.css'
import PersistentLayout from '../components/Layout/PersistentLayout'
import { PermissionProvider } from '../hooks/usePermissions'
import { RouteGuard } from '../components/RouteGuard'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // Lista de páginas públicas que não devem usar o layout
  const publicPages = ['/login', '/', '/complete-registration', '/register']
  const isPublicPage = publicPages.includes(router.pathname)

  useEffect(() => {
    // Preload das páginas mais comuns
    const preloadPages = ['/dashboard', '/customers', '/pets', '/appointments']
    preloadPages.forEach(page => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = page
      document.head.appendChild(link)
    })
  }, [])

  // Renderização condicional baseada na rota
  if (isPublicPage) {
    return <Component {...pageProps} />
  }

  // Para todas as outras páginas, usar layout persistente
  return (
    <PermissionProvider>
      <PersistentLayout>
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
      </PersistentLayout>
    </PermissionProvider>
  )
}

