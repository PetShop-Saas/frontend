import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Redirecionamento da página antiga de alertas para a nova página de estoque
export default function StockAlertsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para inventory com filtro de estoque baixo
    router.replace('/inventory?onlyLowStock=true')
  }, [router])

  return null
}
