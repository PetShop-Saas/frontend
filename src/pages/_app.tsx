import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { ConfigProvider, theme as antTheme } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import '../styles/globals.css'
import '../styles/sidebar.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../styles/calendar.css'
import PersistentLayout from '../components/Layout/PersistentLayout'
import { PermissionProvider } from '../hooks/usePermissions'
import { RouteGuard } from '../components/RouteGuard'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { isDark } = useTheme()

  const publicPages = ['/login', '/', '/complete-registration']
  const isPublicPage = publicPages.includes(router.pathname)

  useEffect(() => {
    const preloadPages = ['/dashboard', '/customers', '/pets', '/appointments']
    preloadPages.forEach(page => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = page
      document.head.appendChild(link)
    })
  }, [])

  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#047857',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          borderRadius: 8,
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      {isPublicPage ? (
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>
          <PermissionProvider>
            <PersistentLayout>
              <RouteGuard>
                <Component {...pageProps} />
              </RouteGuard>
            </PersistentLayout>
          </PermissionProvider>
        </ErrorBoundary>
      )}
    </ConfigProvider>
  )
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider>
      <AppContent {...props} />
    </ThemeProvider>
  )
}
