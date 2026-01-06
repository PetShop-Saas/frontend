import React from 'react'
import { Spin } from 'antd'

interface PageContainerProps {
  children: React.ReactNode
  loading?: boolean
}

export default function PageContainer({ children, loading = false }: PageContainerProps) {
  return (
    <Spin spinning={loading} size="large">
      <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {children}
      </div>
    </Spin>
  )
}
