import { Input, Select, Card, Row, Col } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { Customer, Appointment } from '@/services/api'

const { Option } = Select

interface AppointmentFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: string
  onStatusChange: (value: string) => void
  filterCustomer: string
  onCustomerChange: (value: string) => void
  customers: Customer[]
  appointments: Appointment[]
}

export function AppointmentFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterCustomer,
  onCustomerChange,
  customers,
}: AppointmentFiltersProps) {
  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'SCHEDULED', label: 'Agendado' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'IN_PROGRESS', label: 'Em Andamento' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'CANCELLED', label: 'Cancelado' },
    { value: 'NO_SHOW', label: 'Não Compareceu' },
  ]

  return (
    <Card size="small" className="mb-4">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={24} md={8}>
          <Input
            placeholder="Buscar por cliente, pet ou serviço..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filtrar por status"
            value={filterStatus}
            onChange={onStatusChange}
            style={{ width: '100%' }}
            suffixIcon={<FilterOutlined />}
          >
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filtrar por cliente"
            value={filterCustomer}
            onChange={onCustomerChange}
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
            allowClear
          >
            {customers.map(customer => (
              <Option key={customer.id} value={customer.id}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={4}>
          <div className="text-right text-sm text-gray-500">
            {filterStatus || filterCustomer || searchTerm
              ? 'Filtros ativos'
              : 'Mostrando todos'}
          </div>
        </Col>
      </Row>
    </Card>
  )
}
