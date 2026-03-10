import React from 'react'
import { Button, Empty } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'}`}>
      {icon && (
        <div className="text-gray-300 dark:text-gray-600 mb-4" style={{ fontSize: compact ? 40 : 56 }}>
          {icon}
        </div>
      )}
      {!icon && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={null}
          style={{ marginBottom: 8 }}
        />
      )}
      <h3 className={`font-semibold text-gray-700 dark:text-gray-300 mt-2 ${compact ? 'text-base' : 'text-lg'}`}>
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
