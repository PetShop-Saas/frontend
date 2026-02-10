import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ManagementRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/unified-access-management')
  }, [router])

  return null
}
