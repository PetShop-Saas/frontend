import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function UserRoleManagementRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/unified-access-management')
  }, [router])
  
  return null
}
