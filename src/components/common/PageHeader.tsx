import React from 'react'
import { Space, Button, Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: Array<{ label: string; path?: string }>
  actions?: React.ReactNode
  extra?: React.ReactNode
}

export default function PageHeader({ title, subtitle, breadcrumb, actions, extra }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb className="mb-2">
          <Breadcrumb.Item href="/dashboard">
            <HomeOutlined />
          </Breadcrumb.Item>
          {breadcrumb.map((item, index) => (
            <Breadcrumb.Item key={index} href={item.path}>
              {item.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0">{title}</h1>
          {subtitle && (
            <p className="text-gray-500 mt-1 mb-0">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <Space size="middle">
            {actions}
          </Space>
        )}
      </div>
      
      {extra && (
        <div className="mt-4">
          {extra}
        </div>
      )}
    </div>
  )
}



