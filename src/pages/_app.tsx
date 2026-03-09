import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import '../styles/sidebar.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../styles/calendar.css'
import PersistentLayout from '../components/Layout/PersistentLayout'
import { PermissionProvider } from '../hooks/usePermissions'
import { RouteGuard } from '../components/RouteGuard'
import { ErrorBoundary } from '../components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // Lista de páginas públicas que não devem usar o layout
  const publicPages = ['/login', '/', '/complete-registration']
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
    return (
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    )
  }

  // Para todas as outras páginas, usar layout persistente
  return (
    <ErrorBoundary>
      <PermissionProvider>
        <PersistentLayout>
          <RouteGuard>
            <Component {...pageProps} />
          </RouteGuard>
        </PersistentLayout>
      </PermissionProvider>
    </ErrorBoundary>
  )
}

