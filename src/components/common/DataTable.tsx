import React, { useState } from 'react'
import { Table, Input, Button, Space, Badge } from 'antd'
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons'
import type { ColumnType } from 'antd/es/table'

interface DataTableProps {
  title?: string
  dataSource: any[]
  columns: ColumnType<any>[]
  loading?: boolean
  rowKey?: string
  onRefresh?: () => void
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  extraActions?: React.ReactNode
  pagination?: any
}

export default function DataTable({
  title,
  dataSource,
  columns,
  loading,
  rowKey = 'id',
  onRefresh,
  searchPlaceholder = 'Buscar...',
  onSearch,
  extraActions,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total: number) => `${total} registros`,
    style: { padding: '12px 0' },
  },
}: DataTableProps) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const hasToolbar = title || onSearch || onRefresh || extraActions

  return (
    <div>
      {hasToolbar && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}>
          {/* Left: title + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {title && (
              <>
                <h3 style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--display-family)',
                }}>
                  {title}
                </h3>
                {!loading && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 24,
                    height: 20,
                    padding: '0 7px',
                    background: 'rgba(4, 120, 87, 0.1)',
                    color: '#047857',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {dataSource.length}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Right: search + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {onSearch && (
              <Input
                prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)', fontSize: 14 }} />}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={e => handleSearch(e.target.value)}
                allowClear
                style={{
                  width: 240,
                  height: 36,
                  borderRadius: 8,
                  fontSize: 13,
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-surface)',
                }}
              />
            )}
            {onRefresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
                style={{
                  height: 36,
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 12px',
                }}
              >
                Atualizar
              </Button>
            )}
            {extraActions}
          </div>
        </div>
      )}

      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
        scroll={{ x: 'max-content' }}
        className="custom-table"
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}
      />
    </div>
  )
}
