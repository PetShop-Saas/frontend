import { useState, useEffect } from 'react'

export const usePageLoading = (initialLoading = true) => {
  const [loading, setLoading] = useState(initialLoading)
  const [data, setData] = useState<any>(null)

  const startLoading = () => setLoading(true)
  const stopLoading = () => setLoading(false)
  const setLoadingData = (newData: any) => {
    setData(newData)
    setLoading(false)
  }

  // Auto-stop loading após um tempo mínimo para melhor UX
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 500) // Tempo mínimo de loading

      return () => clearTimeout(timer)
    }
  }, [loading])

  return {
    loading,
    data,
    startLoading,
    stopLoading,
    setLoadingData
  }
}
