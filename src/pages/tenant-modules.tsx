import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function TenantModulesRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/unified-access-management')
  }, [router])
  
  return null
}
