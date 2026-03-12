import React from 'react'
import { Spin } from 'antd'

interface PageContainerProps {
  children: React.ReactNode
  loading?: boolean
}

export default function PageContainer({ children, loading = false }: PageContainerProps) {
  return (
    <Spin
      spinning={loading}
      size="large"
      tip="Carregando..."
      style={{ color: 'var(--primary-color)' } as React.CSSProperties}
    >
      <div
        style={{
          opacity: loading ? 0.45 : 1,
          transition: 'opacity 0.25s ease',
        }}
      >
        {children}
      </div>
    </Spin>
  )
}
