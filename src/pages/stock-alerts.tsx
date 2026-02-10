import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Redirecionamento da página antiga de alertas para a nova página de estoque
export default function StockAlertsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/products?tab=alerts')
  }, [router])

  return null
}
