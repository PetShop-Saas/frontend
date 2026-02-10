import React from 'react'
import { Card, Statistic } from 'antd'
import { theme } from '../../config/theme'

interface StatsCardProps {
  title: string
  value: number | string
  prefix?: React.ReactNode
  suffix?: string
  precision?: number
  valueStyle?: React.CSSProperties
  trend?: {
    value: number
    isPositive: boolean
  }
  loading?: boolean
  icon?: React.ReactNode
}

export default function StatsCard({ 
  title, 
  value, 
  prefix, 
  suffix, 
  precision, 
  valueStyle,
  trend,
  loading,
  icon 
}: StatsCardProps) {
  return (
    <Card loading={loading} variant="borderless" className="shadow-sm hover:shadow-md transition-shadow">
      {icon && (
        <div className="mb-2 text-2xl" style={{ color: theme.colors.primary }}>
          {icon}
        </div>
      )}
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        precision={precision}
        valueStyle={valueStyle}
      />
      {trend && (
        <div className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs período anterior
        </div>
      )}
    </Card>
  )
}











