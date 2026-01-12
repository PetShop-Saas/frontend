import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService } from '../services/api'
import {
  Card,
  Button,
  DatePicker,
  Space,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  message,
  Empty,
  Select,
  Divider
} from 'antd'
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  CalendarOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface RevenueReport {
  totalRevenue: number
  completedRevenue: number
  pendingRevenue: number
  totalSales: number
  completedSales: number
  pendingSales: number
  averageTicket: number
}

interface ExpensesReport {
  totalExpenses: number
  purchaseExpenses: number
  operationalExpenses: number
  totalPurchases: number
  averagePurchase: number
}

interface ProfitLossReport {
  totalRevenue: number
  totalExpenses: number
  grossProfit: number
  profitMargin: number
}

interface CashFlowReport {
  totalInflow: number
  totalOutflow: number
  netCashFlow: number
  openingBalance: number
  closingBalance: number
}

export default function FinancialReports() {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ])
  const [reportType, setReportType] = useState<string>('revenue')
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null)
  const [expensesReport, setExpensesReport] = useState<ExpensesReport | null>(null)
  const [profitLossReport, setProfitLossReport] = useState<ProfitLossReport | null>(null)
  const [cashFlowReport, setCashFlowReport] = useState<CashFlowReport | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, dateRange, reportType])

  const loadReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return

    try {
      setLoading(true)
      const startDate = dateRange[0].format('YYYY-MM-DD')
      const endDate = dateRange[1].format('YYYY-MM-DD')

      switch (reportType) {
        case 'revenue':
          const revenue = await apiService.getRevenueReport(startDate, endDate)
          setRevenueReport(revenue as any)
          break
        case 'expenses':
          const expenses = await apiService.getExpensesReport(startDate, endDate)
          setExpensesReport(expenses as any)
          break
        case 'profit-loss':
          const profitLoss = await apiService.getProfitLossReport(startDate, endDate)
          setProfitLossReport(profitLoss as any)
          break
        case 'cash-flow':
          const cashFlow = await apiService.getCashFlowReport(startDate, endDate)
          setCashFlowReport(cashFlow as any)
          break
      }
    } catch (error) {
      message.error('Erro ao carregar relatório')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    message.info('Funcionalidade de exportação será implementada em breve')
  }

  const reportOptions = [
    { value: 'revenue', label: 'Receitas', icon: <RiseOutlined />, color: 'green' },
    { value: 'expenses', label: 'Despesas', icon: <FallOutlined />, color: 'red' },
    { value: 'profit-loss', label: 'Lucro/Prejuízo', icon: <BarChartOutlined />, color: 'blue' },
    { value: 'cash-flow', label: 'Fluxo de Caixa', icon: <LineChartOutlined />, color: 'purple' }
  ]

  const renderRevenueReport = () => {
    if (!revenueReport) return null

    return (
      <div className="space-y-6">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Receita Total"
                value={revenueReport.totalRevenue}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Receita Realizada"
                value={revenueReport.completedRevenue}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Receita Pendente"
                value={revenueReport.pendingRevenue}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ticket Médio"
                value={revenueReport.averageTicket}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total de Vendas"
                value={revenueReport.totalSales}
                valueStyle={{ color: '#6b7280' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Vendas Concluídas"
                value={revenueReport.completedSales}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Vendas Pendentes"
                value={revenueReport.pendingSales}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderExpensesReport = () => {
    if (!expensesReport) return null

    return (
      <div className="space-y-6">
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total de Despesas"
                value={expensesReport.totalExpenses}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Despesas com Compras"
                value={expensesReport.purchaseExpenses}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Despesas Operacionais"
                value={expensesReport.operationalExpenses}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total de Compras"
                value={expensesReport.totalPurchases}
                valueStyle={{ color: '#6b7280' }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Compra Média"
                value={expensesReport.averagePurchase}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#6b7280' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderProfitLossReport = () => {
    if (!profitLossReport) return null

    const isProfit = profitLossReport.grossProfit >= 0

    return (
      <div className="space-y-6">
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Receita Total"
                value={profitLossReport.totalRevenue}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Despesas Totais"
                value={profitLossReport.totalExpenses}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title={isProfit ? "Lucro Bruto" : "Prejuízo"}
                value={Math.abs(profitLossReport.grossProfit)}
                prefix="R$"
                precision={2}
                valueStyle={{ color: isProfit ? '#16a34a' : '#dc2626' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Card>
              <Statistic
                title="Margem de Lucro"
                value={profitLossReport.profitMargin}
                suffix="%"
                precision={2}
                valueStyle={{ 
                  color: profitLossReport.profitMargin >= 0 ? '#16a34a' : '#dc2626' 
                }}
              />
            </Card>
          </Col>
        </Row>
        </div>
    )
  }

  const renderCashFlowReport = () => {
    if (!cashFlowReport) return null

    const isPositive = cashFlowReport.netCashFlow >= 0

    return (
      <div className="space-y-6">
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Entradas"
                value={cashFlowReport.totalInflow}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Saídas"
                value={cashFlowReport.totalOutflow}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Fluxo Líquido"
                value={cashFlowReport.netCashFlow}
                prefix="R$"
                precision={2}
                valueStyle={{ color: isPositive ? '#16a34a' : '#dc2626' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Saldo Inicial"
                value={cashFlowReport.openingBalance}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#6b7280' }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Saldo Final"
                value={cashFlowReport.closingBalance}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderCurrentReport = () => {
    switch (reportType) {
      case 'revenue':
        return renderRevenueReport()
      case 'expenses':
        return renderExpensesReport()
      case 'profit-loss':
        return renderProfitLossReport()
      case 'cash-flow':
        return renderCashFlowReport()
      default:
        return null
    }
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
            <p className="text-gray-600">Análise financeira do seu petshop</p>
          </div>
          <div className="flex space-x-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadReport}
              loading={loading}
              size="large"
              className="px-6 py-3 hover:bg-gray-50 hover:border-gray-300"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#d1d5db',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              Atualizar
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              size="large"
              className="px-6 py-3 hover:bg-gray-50 hover:border-gray-300"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#d1d5db',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                size="large"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <Select
                value={reportType}
                onChange={setReportType}
                style={{ width: '100%' }}
                size="large"
              >
                {reportOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <Space>
                      {option.icon}
                      {option.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Report Content */}
        <Card>
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              {reportOptions.find(opt => opt.value === reportType)?.icon}
              <h2 className="text-xl font-semibold text-gray-900">
                {reportOptions.find(opt => opt.value === reportType)?.label}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              Período: {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
            </div>
            </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando relatório...</p>
            </div>
          ) : (
            renderCurrentReport()
          )}
        </Card>

        {/* Additional Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
          <Row gutter={16}>
            <Col span={8}>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarOutlined className="text-2xl text-green-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Receitas</div>
                <div className="text-xs text-gray-600">Vendas e serviços</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <FallOutlined className="text-2xl text-red-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Despesas</div>
                <div className="text-xs text-gray-600">Compras e operacionais</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BarChartOutlined className="text-2xl text-blue-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Análise</div>
                <div className="text-xs text-gray-600">Lucro e margem</div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}