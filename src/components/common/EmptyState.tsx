import React from 'react'
import { InboxOutlined } from '@ant-design/icons'

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  compact = false,
}) => {
  const iconSize = compact ? 22 : 32
  const paddingY = compact ? 24 : 40

  const resolvedAction = action ?? (actionLabel && onAction ? (
    <button
      onClick={onAction}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 16px',
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff',
        border: 'none',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-family)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary-color)')}
    >
      {actionLabel}
    </button>
  ) : null)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        paddingTop: paddingY,
        paddingBottom: paddingY,
      }}
    >
      <div
        style={{
          width: compact ? 52 : 72,
          height: compact ? 52 : 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: compact ? 10 : 14,
          color: '#10b981',
          fontSize: iconSize,
          flexShrink: 0,
        }}
      >
        {icon ?? <InboxOutlined style={{ fontSize: iconSize }} />}
      </div>

      {title && (
        <h3
          style={{
            fontFamily: 'var(--display-family)',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
      )}

      {!compact && description && (
        <p
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 13,
            color: 'var(--text-secondary)',
            margin: '6px 0 0',
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {resolvedAction && (
        <div style={{ marginTop: compact ? 10 : 16 }}>
          {resolvedAction}
        </div>
      )}
    </div>
  )
}

export default EmptyState
