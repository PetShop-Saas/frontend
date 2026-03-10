import React from 'react'
import { Skeleton, Card, Row, Col } from 'antd'

interface PageSkeletonProps {
  type?: 'table' | 'cards' | 'detail' | 'dashboard'
  rows?: number
}

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div>
    <div className="flex gap-3 mb-4">
      <Skeleton.Input active style={{ width: 240 }} />
      <Skeleton.Input active style={{ width: 120 }} />
      <Skeleton.Button active style={{ marginLeft: 'auto' }} />
    </div>
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {[30, 20, 15, 15, 20].map((w, i) => (
          <Skeleton.Input key={i} active size="small" style={{ width: `${w}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex gap-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
          {[30, 20, 15, 15, 20].map((w, j) => (
            <Skeleton.Input key={j} active size="small" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  </div>
)

export const CardsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <Row gutter={[16, 16]}>
    {Array.from({ length: count }).map((_, i) => (
      <Col key={i} xs={24} sm={12} lg={6}>
        <Card>
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
      </Col>
    ))}
  </Row>
)

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Row gutter={[16, 16]}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Col key={i} xs={24} sm={12} xl={6}>
          <Card>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
      ))}
    </Row>
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </Col>
    </Row>
  </div>
)

export const DetailSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton active paragraph={{ rows: 0 }} style={{ width: 300 }} />
    <Card>
      <Skeleton active paragraph={{ rows: 4 }} />
    </Card>
    <Card>
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
  </div>
)

const PageSkeleton: React.FC<PageSkeletonProps> = ({ type = 'table', rows = 6 }) => {
  switch (type) {
    case 'cards':
      return <CardsSkeleton count={rows} />
    case 'dashboard':
      return <DashboardSkeleton />
    case 'detail':
      return <DetailSkeleton />
    default:
      return <TableSkeleton rows={rows} />
  }
}

export default PageSkeleton
