import React from 'react'
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
  iconColor?: string
  iconBg?: string
  accent?: string
  onClick?: () => void
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
  icon,
  iconColor = theme.colors.primary,
  iconBg,
  accent,
  onClick,
}: StatsCardProps) {
  const bg = iconBg || `${iconColor}18`
  const accentColor = accent || iconColor

  if (loading) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #f0f0f0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        height: 120,
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
    )
  }

  const displayValue = precision != null
    ? Number(value).toFixed(precision)
    : value

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #f0f0f0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.18s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={onClick ? e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.1)'
      } : undefined}
      onMouseLeave={onClick ? e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
      } : undefined}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
        borderRadius: '14px 14px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        {icon && (
          <div style={{
            width: 42,
            height: 42,
            background: bg,
            borderRadius: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            fontSize: 18,
          }}>
            {icon}
          </div>
        )}
        {prefix && !icon && (
          <span style={{ color: iconColor, fontSize: 20 }}>{prefix}</span>
        )}
      </div>

      <div style={{
        fontSize: 26,
        fontWeight: 800,
        color: '#111827',
        fontFamily: "'Outfit', sans-serif",
        lineHeight: 1,
        marginBottom: 6,
        ...(valueStyle || {}),
      }}>
        {displayValue}{suffix && <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 4 }}>{suffix}</span>}
      </div>

      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: trend ? 10 : 0,
      }}>
        {title}
      </div>

      {trend && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          color: trend.isPositive ? '#047857' : '#ef4444',
          background: trend.isPositive ? '#f0fdf4' : '#fef2f2',
          borderRadius: 20,
          padding: '2px 8px',
        }}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          <span style={{ color: '#9ca3af', fontWeight: 500 }}>vs anterior</span>
        </div>
      )}
    </div>
  )
}
