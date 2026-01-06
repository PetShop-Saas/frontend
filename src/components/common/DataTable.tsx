import React from 'react'
import { Table, Input, Space, Button } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
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
  pagination = { pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `Total: ${total} itens` }
}: DataTableProps) {
  return (
    <>
      {(title || onSearch || onRefresh || extraActions) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-lg font-semibold m-0">{title}</h3>}
          <Space>
            {onSearch && (
              <Input.Search
                placeholder={searchPlaceholder}
                onSearch={onSearch}
                style={{ width: 250 }}
                allowClear
              />
            )}
            {onRefresh && (
              <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                Atualizar
              </Button>
            )}
            {extraActions}
          </Space>
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
      />
    </>
  )
}











