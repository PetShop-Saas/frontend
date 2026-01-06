import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export const usePageTransition = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // Só mostra loading se for uma mudança real de página
      if (url !== router.asPath) {
        setIsLoading(true)
        setIsTransitioning(true)
      }
    }

    const handleRouteChangeComplete = () => {
      // Delay mínimo para transição suave
      setTimeout(() => {
        setIsLoading(false)
        setIsTransitioning(false)
      }, 50)
    }

    const handleRouteChangeError = () => {
      setIsLoading(false)
      setIsTransitioning(false)
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    router.events.on('routeChangeError', handleRouteChangeError)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
      router.events.off('routeChangeError', handleRouteChangeError)
    }
  }, [router])

  return { isLoading, isTransitioning }
}
