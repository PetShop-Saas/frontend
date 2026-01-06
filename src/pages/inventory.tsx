import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Redirecionamento da página de inventory para products com aba de estoque
export default function InventoryRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para products com aba de estoque
    router.replace('/products?tab=stock')
  }, [router])

  return null
}
