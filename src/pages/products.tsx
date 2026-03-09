import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService, extractArrayFromResponse } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import {
  Card,
  Button,
  Table,
  Input,
  Modal,
  Form,
  InputNumber,
  Switch,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Empty,
  Row,
  Col,
  Statistic,
  Select,
  Tabs,
  Tooltip,
  DatePicker
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
  EditTwoTone,
  ShoppingCartOutlined,
  SwapOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getProductStatusConfig,
  getProductMovementTypeConfig,
  PRODUCT_STOCK_CONFIG,
  TAG_CLASS
} from '../constants/tagConfig'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs
const { RangePicker } = DatePicker

interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock?: number
  sku?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Campos de estoque
  isStockItem?: boolean
  reorderPoint?: number
  reorderQty?: number
  minStock?: number
  unit?: string
  costPrice?: number
  primarySupplierId?: string
  leadTimeDays?: number
}

interface InventoryItem {
  id: string
  name: string
  sku?: string
  unit?: string
  currentStock: number
  minStock: number
  reorderPoint: number
  reorderQty: number
  status: 'OK' | 'LOW' | 'OUT'
  needsRestock: boolean
  canReorder: boolean
  primarySupplier?: {
    id: string
    name: string
  }
  price: number
  costPrice?: number
}

interface StockMovement {
  id: string
  productId: string
  product: {
    id: string
    name: string
    sku?: string
  }
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER'
  quantity: number
  newStock?: number
  reason?: string
  reference?: string
  referenceType?: string
  notes?: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

export default function Products() {
  const router = useRouter()
  const { hasPermission, canAccessSidebarItem, user, sidebarItems } = usePermissions()
  const [activeTab, setActiveTab] = useState<string>('catalog')
  
  // Verificar se usuário tem acesso a funcionalidades de estoque
  // Usuários PRO_USER e ENTERPRISE_USER têm acesso a inventory
  // Verifica: permissão inventory.read OU /inventory nos sidebarItems OU planRole PRO/ENTERPRISE
  const hasInventoryAccess = hasPermission('inventory.read') || 
    canAccessSidebarItem('/inventory') ||
    (user && (user.role === 'PRO_USER' || user.role === 'ENTERPRISE_USER' || 
              user.planRole === 'PRO_USER' || user.planRole === 'ENTERPRISE_USER'))
  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMovements, setLoadingMovements] = useState(false)
  
  // Modais
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  
  // Estados
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [selectedProductForMovements, setSelectedProductForMovements] = useState<string | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterStock, setFilterStock] = useState<string | null>(null)
  const [movementFilters, setMovementFilters] = useState({
    startDate: null as any,
    endDate: null as any,
    type: null as string | null,
    productId: null as string | null,
  })
  
  const [purchaseSuggestions, setPurchaseSuggestions] = useState<any[]>([])
  const [form] = Form.useForm()
  const [detailsForm] = Form.useForm()
  const [adjustForm] = Form.useForm()
  const [purchaseForm] = Form.useForm()

  // ===== Helpers de Exportação =====
  const downloadCsv = (filename: string, rows: any[], headers?: string[]) => {
    if (!rows || rows.length === 0) {
      message.warning('Nada para exportar')
      return
    }
    const cols = headers || Object.keys(rows[0])
    const csv = [
      cols.join(','),
      ...rows.map((row) => cols.map((c) => {
        const val = row[c]
        const str = val == null ? '' : String(val)
        const escaped = '"' + str.replace(/"/g, '""') + '"'
        return escaped
      }).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportStockReport = async () => {
    try {
      const report = await apiService.getStockReport()
      const rows = extractArrayFromResponse(report, ['items'])
      if (!rows || rows.length === 0) {
        message.info('Relatório vazio')
        return
      }
      const normalized = rows.map((r: any) => ({
        produto: r.name || r.productName || '-',
        sku: r.sku || '-',
        unidade: r.unit || 'UN',
        estoque_atual: r.currentStock ?? r.stock ?? 0,
        minimo: r.minStock ?? r.min ?? 0,
        ponto_reposicao: r.reorderPoint ?? 0,
        fornecedor: r.primarySupplier?.name || r.supplierName || '-',
        preco_custo: r.costPrice ?? r.unitCost ?? '',
      }))
      downloadCsv(`relatorio-estoque-${dayjs().format('YYYYMMDD-HHmm')}.csv`, normalized)
    } catch (e) {
      message.error('Erro ao exportar relatório de estoque')
    }
  }

  const handleExportMovements = () => {
    const rows = stockMovements.map((m) => ({
      data: dayjs(m.createdAt).format('YYYY-MM-DD HH:mm'),
      produto: m.product?.name || '-',
      sku: m.product?.sku || '-',
      tipo: m.type,
      quantidade: m.quantity,
      estoque_final: m.newStock ?? '',
      motivo: m.reason || '',
      referencia: m.reference || '',
      referencia_tipo: m.referenceType || '',
    }))
    downloadCsv(`movimentacoes-${dayjs().format('YYYYMMDD-HHmm')}.csv`, rows)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Verificar se há parâmetro de tab na URL
    const tabParam = router.query.tab as string
    if (tabParam && ['catalog', 'stock', 'alerts', 'movements'].includes(tabParam)) {
      // Verificar permissões para abas de estoque
      if ((tabParam === 'stock' || tabParam === 'alerts' || tabParam === 'movements')) {
        if (!hasInventoryAccess) {
          message.warning('Você não tem permissão para acessar esta aba. Redirecionando para Catálogo.')
          setActiveTab('catalog')
          router.replace('/products', undefined, { shallow: true })
          return
        }
      }
      setActiveTab(tabParam)
    }

    loadSuppliers()
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, hasInventoryAccess])

  // Carregar dados quando a aba mudar
  useEffect(() => {
    if (activeTab === 'stock' || activeTab === 'alerts') {
      loadInventoryData()
    } else if (activeTab === 'movements') {
      loadMovements()
    } else {
      loadProducts()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const loadSuppliers = async () => {
    try {
      const suppliersData = await apiService.getSuppliers()
      setSuppliers(extractArrayFromResponse(suppliersData, ['data', 'suppliers']))
    } catch (error) {
      // Ignorar erro ao carregar fornecedores
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await apiService.getProducts()
      setProducts(extractArrayFromResponse(productsData, ['data', 'products']))
    } catch (error) {
      message.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (activeTab === 'alerts') {
        filters.onlyLowStock = true
      }
      if (searchTerm) filters.search = searchTerm
      if (filterStatus === 'low') filters.onlyLowStock = true
      if (filterStatus === 'out') filters.onlyOutOfStock = true

      const [inventoryData, statsData] = await Promise.all([
        apiService.getInventory(filters),
        apiService.getInventoryStats(),
      ])
      
      setInventory(extractArrayFromResponse(inventoryData, ['data', 'items']))
      setStats(statsData)
    } catch (error) {
      message.error('Erro ao carregar dados de estoque')
    } finally {
      setLoading(false)
    }
  }

  const loadMovements = async () => {
    try {
      setLoadingMovements(true)
      const filters: any = {}
      if (movementFilters.startDate) filters.startDate = movementFilters.startDate.format('YYYY-MM-DD')
      if (movementFilters.endDate) filters.endDate = movementFilters.endDate.format('YYYY-MM-DD')
      if (movementFilters.type) filters.type = movementFilters.type
      if (movementFilters.productId) filters.productId = movementFilters.productId

      const movementsData = await apiService.getStockMovements(filters)
      setStockMovements(extractArrayFromResponse(movementsData, ['data', 'items']))
    } catch (error) {
      message.error('Erro ao carregar movimentações')
    } finally {
      setLoadingMovements(false)
    }
  }

  const loadData = () => {
    if (activeTab === 'stock' || activeTab === 'alerts') {
      loadInventoryData()
    } else if (activeTab === 'movements') {
      loadMovements()
    } else {
      loadProducts()
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await apiService.createProduct(values)
      message.success('Produto criado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao criar produto')
    }
  }

  const handleUpdate = async (values: any) => {
    if (!selectedProduct) return

    try {
      await apiService.updateProduct(selectedProduct.id, values)
      message.success('Produto atualizado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar produto')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir este produto?',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await apiService.deleteProduct(id)
          message.success('Produto removido com sucesso!')
          loadData()
        } catch (error) {
          message.error('Erro ao remover produto')
        }
      },
    })
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditing(true)
    form.setFieldsValue({
      ...product,
      // Garantir que campos de estoque estejam presentes
      isStockItem: product.isStockItem ?? false,
      reorderPoint: product.reorderPoint ?? 0,
      reorderQty: product.reorderQty ?? 0,
      minStock: product.minStock ?? 0,
      unit: product.unit || 'UN',
      costPrice: product.costPrice ?? 0,
      primarySupplierId: product.primarySupplierId,
      leadTimeDays: product.leadTimeDays ?? 0,
    })
    setShowModal(true)
  }

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    detailsForm.setFieldsValue(product)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedProduct(null)
    form.resetFields()
  }

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      await apiService.updateProduct(id, { isActive: newStatus })
      message.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar status')
    }
  }

  const handleAdjustStock = async (values: any) => {
    if (!selectedItem) return

    try {
      await apiService.adjustStock(selectedItem.id, values.newStock, values.notes)
      message.success('Estoque ajustado com sucesso!')
      setShowAdjustModal(false)
      adjustForm.resetFields()
      setSelectedItem(null)
      loadInventoryData()
    } catch (error) {
      message.error('Erro ao ajustar estoque')
    }
  }

  const handleGeneratePurchaseOrder = async () => {
    try {
      const suggestions = await apiService.getPurchaseOrderSuggestions()
      setPurchaseSuggestions((suggestions as any[]) || [])
      purchaseForm.setFieldsValue({
        items: ((suggestions as any[]) || []).map((s: any) => ({
          productId: s.productId,
          quantity: s.suggestedQty,
          unitPrice: s.unitCost
        }))
      })
      setShowPurchaseModal(true)
    } catch (error) {
      message.error('Erro ao gerar sugestões de compra')
    }
  }

  const handleCreatePurchaseOrder = async (values: any) => {
    try {
      const payload = {
        supplierId: values.supplierId,
        expectedDate: values.expectedDate ? values.expectedDate.toISOString() : undefined,
        status: 'ORDERED',
        items: (values.items || []).map((it: any) => ({
          productId: it.productId,
          quantity: Number(it.quantity || 0),
          unitPrice: Number(it.unitPrice || 0)
        }))
      }
      if (!payload.supplierId) {
        message.warning('Selecione o fornecedor para o pedido')
        return
      }
      if (!payload.items || payload.items.length === 0) {
        message.warning('Adicione itens ao pedido')
        return
      }

      await apiService.createPurchase(payload)
      message.success('Pedido de compra criado com sucesso!')
      setShowPurchaseModal(false)
      purchaseForm.resetFields()
      setPurchaseSuggestions([])
      if (activeTab === 'movements') {
        loadMovements()
      } else {
        loadInventoryData()
      }
    } catch (error) {
      message.error('Erro ao criar pedido de compra')
    }
  }

  // Filtros para produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && product.isActive) ||
                         (filterStatus === 'inactive' && !product.isActive)
    
    const matchesStock = !filterStock ||
                        (filterStock === 'in_stock' && (product.stock ?? 0) > 0) ||
                        (filterStock === 'low_stock' && (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5) ||
                        (filterStock === 'out_of_stock' && (product.stock ?? 0) === 0)
    
    return matchesSearch && matchesStatus && matchesStock
  })

  // Filtros para estoque
  const filteredInventory = inventory.filter(item => {
    if (filterStatus === 'low' && item.status !== 'LOW' && item.status !== 'OUT') return false
    if (filterStatus === 'out' && item.status !== 'OUT') return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower) ||
        item.primarySupplier?.name.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const getStatusConfig = getProductStatusConfig
  const getStockConfig = PRODUCT_STOCK_CONFIG
  const getMovementTypeConfig = getProductMovementTypeConfig

  // ==================== COLUNAS DAS TABELAS ====================

  const catalogColumns = [
    {
      title: 'Produto',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<ShoppingOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            {record.description && (
              <div className="text-sm text-gray-500">{record.description}</div>
            )}
            {record.sku && (
              <div className="text-xs text-gray-400">SKU: {record.sku}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span className="text-lg font-bold text-green-600">
          R$ {price.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Estoque',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => {
        const config = getStockConfig(stock ?? 0)
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{stock ?? 0}</span>
            <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
              {config.label}
            </Tag>
          </div>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => {
        const config = getStatusConfig(isActive ? 'active' : 'inactive')
        return (
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="text-green-600 hover:text-green-800"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-green-600 hover:text-green-800"
          />
          <Popconfirm
            title="Tem certeza que deseja remover este produto?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const inventoryColumns = [
    {
      title: 'Produto',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: InventoryItem) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<ShoppingOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            {record.sku && (
              <div className="text-sm text-gray-500">SKU: {record.sku}</div>
            )}
            {record.primarySupplier && (
              <div className="text-xs text-gray-400">Fornecedor: {record.primarySupplier.name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Estoque Atual',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock: number, record: InventoryItem) => (
        <div>
          <span className={`text-lg font-bold ${record.status === 'OUT' ? 'text-red-600' : record.status === 'LOW' ? 'text-orange-600' : 'text-green-600'}`}>
            {stock} {record.unit || 'UN'}
          </span>
        </div>
      ),
    },
    {
      title: 'Ponto de Reposição',
      dataIndex: 'reorderPoint',
      key: 'reorderPoint',
      render: (point: number, record: InventoryItem) => (
        <span className="text-gray-600">{point} {record.unit || 'UN'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status)
        return (
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: InventoryItem) => (
        <Space size="small">
          <Tooltip title="Ajustar Estoque">
            <Button
              type="text"
              icon={<EditTwoTone />}
              onClick={() => {
                setSelectedItem(record)
                adjustForm.setFieldsValue({ newStock: record.currentStock })
                setShowAdjustModal(true)
              }}
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const movementsColumns = [
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Produto',
      key: 'product',
      render: (_: any, record: StockMovement) => (
        <div>
          <div className="font-medium">{record.product.name}</div>
          {record.product.sku && (
            <div className="text-sm text-gray-500">SKU: {record.product.sku}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config = getMovementTypeConfig(type)
        return (
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: StockMovement) => (
        <span className={`font-bold ${record.type === 'IN' ? 'text-green-600' : record.type === 'OUT' ? 'text-red-600' : 'text-blue-600'}`}>
          {record.type === 'IN' ? '+' : record.type === 'OUT' ? '-' : '='} {quantity}
        </span>
      ),
    },
    {
      title: 'Estoque Final',
      dataIndex: 'newStock',
      key: 'newStock',
      render: (newStock: number | undefined, record: StockMovement) => (
        <span className="font-medium">{newStock ?? record.quantity}</span>
      ),
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => reason || '-',
    },
    {
      title: 'Usuário',
      key: 'user',
      render: (_: any, record: StockMovement) => record.user?.name || '-',
    },
  ]

  // ==================== RENDERIZAÇÃO DAS ABAS ====================

  const renderCatalogTab = () => (
    <>
      {/* Filtros */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Search
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="large"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type={filterStatus === null ? 'primary' : 'default'}
              onClick={() => setFilterStatus(null)}
              className={filterStatus === null ? 'bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2' : 'px-6 py-2'}
            >
              Todos
            </Button>
            <Button
              type={filterStatus === 'active' ? 'primary' : 'default'}
              onClick={() => setFilterStatus(filterStatus === 'active' ? null : 'active')}
              className={filterStatus === 'active' ? 'bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2' : 'px-6 py-2'}
            >
              Ativos
            </Button>
            <Button
              type={filterStatus === 'inactive' ? 'primary' : 'default'}
              onClick={() => setFilterStatus(filterStatus === 'inactive' ? null : 'inactive')}
              className={filterStatus === 'inactive' ? 'bg-red-600 hover:bg-red-700 border-red-600 px-6 py-2' : 'px-6 py-2'}
            >
              Inativos
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={catalogColumns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} produtos`,
          }}
          locale={{
            emptyText: (
              <div className="text-center py-12">
                <ShoppingOutlined className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhum produto encontrado</h3>
                <p className="mt-2 text-sm text-gray-500 mb-6">
                  {searchTerm || filterStatus ? 'Tente ajustar seus filtros.' : 'Comece criando o primeiro produto.'}
                </p>
                {!searchTerm && !filterStatus && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowModal(true)}
                    size="large"
                    className="bg-green-600 hover:bg-green-700 border-green-600"
                  >
                    Criar Primeiro Produto
                  </Button>
                )}
              </div>
            )
          }}
        />
      </Card>
    </>
  )

  const renderStockTab = () => (
    <>
      <div className="flex justify-end">
        <Button onClick={handleExportStockReport} icon={<DatabaseOutlined />}>Exportar Relatório</Button>
      </div>
      {/* Estatísticas */}
      {stats && (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total de Itens"
                value={stats.totalItems}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Estoque OK"
                value={stats.okStockCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Estoque Baixo"
                value={stats.lowStockCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Estoque Zerado"
                value={stats.outOfStockCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Search
              placeholder="Buscar por produto, SKU ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={() => loadInventoryData()}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="large"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type={filterStatus === null ? 'primary' : 'default'}
              onClick={() => {
                setFilterStatus(null)
                loadInventoryData()
              }}
              className={filterStatus === null ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''}
            >
              Todos
            </Button>
            <Button
              type={filterStatus === 'low' ? 'primary' : 'default'}
              onClick={() => {
                setFilterStatus(filterStatus === 'low' ? null : 'low')
                loadInventoryData()
              }}
              className={filterStatus === 'low' ? 'bg-orange-600 hover:bg-orange-700 border-orange-600' : ''}
            >
              Estoque Baixo
            </Button>
            <Button
              type={filterStatus === 'out' ? 'primary' : 'default'}
              onClick={() => {
                setFilterStatus(filterStatus === 'out' ? null : 'out')
                loadInventoryData()
              }}
              className={filterStatus === 'out' ? 'bg-red-600 hover:bg-red-700 border-red-600' : ''}
            >
              Estoque Zerado
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={inventoryColumns}
          dataSource={filteredInventory}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} produtos`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Nenhum produto encontrado"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>
    </>
  )

  const renderAlertsTab = () => {
    const alertItems = inventory.filter(item => item.status === 'LOW' || item.status === 'OUT')
    
    return (
      <>
        {/* Botão de Gerar PO */}
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Alertas de Estoque</h3>
              <p className="text-sm text-gray-500">
                {alertItems.length} produto(s) precisam de reposição
              </p>
            </div>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={handleGeneratePurchaseOrder}
              className="bg-green-600 hover:bg-green-700 border-green-600"
              size="large"
            >
              Gerar Pedido de Compra
            </Button>
          </div>
        </Card>

        {/* Tabela de Alertas */}
        <Card>
          <Table
            columns={inventoryColumns}
            dataSource={alertItems}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} produtos`,
            }}
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <CheckCircleOutlined className="text-6xl text-green-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhum alerta no momento</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Todos os produtos estão com estoque adequado.
                  </p>
                </div>
              )
            }}
          />
        </Card>
      </>
    )
  }

  const renderMovementsTab = () => (
    <>
      {/* Filtros */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="text-base font-medium">Resumo</div>
          <div className="flex gap-2">
            <Button onClick={handleExportMovements}>Exportar CSV</Button>
            <Button onClick={loadMovements} icon={<ReloadOutlined />}>Atualizar</Button>
          </div>
        </div>
        {/* Resumo simples por tipo */}
        <Row gutter={16} className="mb-4">
          {['IN','OUT','ADJUSTMENT','TRANSFER'].map((t) => {
            const count = stockMovements.filter(m => m.type === t).length
            return (
              <Col span={6} key={t}>
                <Card size="small">
                  <div className="flex items-center justify-between">
                    <span>{getMovementTypeConfig(t).label}</span>
                    <Tag color={getMovementTypeConfig(t).color} className={TAG_CLASS}>{count}</Tag>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={movementFilters.startDate && movementFilters.endDate ? [movementFilters.startDate, movementFilters.endDate] : null}
              onChange={(dates) => {
                if (dates) {
                  setMovementFilters({
                    ...movementFilters,
                    startDate: dates[0],
                    endDate: dates[1],
                  })
                } else {
                  setMovementFilters({
                    ...movementFilters,
                    startDate: null,
                    endDate: null,
                  })
                }
              }}
              placeholder={['Data Inicial', 'Data Final']}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Tipo de Movimentação"
              allowClear
              value={movementFilters.type}
              onChange={(value) => setMovementFilters({ ...movementFilters, type: value })}
            >
              <Option value="IN">Entrada</Option>
              <Option value="OUT">Saída</Option>
              <Option value="ADJUSTMENT">Ajuste</Option>
              <Option value="TRANSFER">Transferência</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Produto"
              allowClear
              showSearch
              value={movementFilters.productId}
              onChange={(value) => setMovementFilters({ ...movementFilters, productId: value })}
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={loadMovements}
              className="bg-green-600 hover:bg-green-700 border-green-600"
              block
            >
              Filtrar
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={movementsColumns}
          dataSource={stockMovements}
          rowKey="id"
          loading={loadingMovements}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} movimentações`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Nenhuma movimentação encontrada"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>
    </>
  )

  // ==================== MODAIS ====================

  const renderProductModal = () => (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <ShoppingOutlined className="text-green-600" />
          <span>{isEditing ? 'Editar Produto' : 'Novo Produto'}</span>
        </div>
      }
      open={showModal}
      onCancel={handleModalClose}
      footer={null}
      width={900}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={isEditing ? handleUpdate : handleCreate}
        className="mt-4"
      >
        <Tabs defaultActiveKey="basic">
          <TabPane tab="Informações Básicas" key="basic">
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="name"
                  label="Nome do Produto"
                  rules={[{ required: true, message: 'Por favor, insira o nome do produto!' }]}
                >
                  <Input placeholder="Ex: Ração Premium" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="sku"
                  label="SKU"
                >
                  <Input placeholder="Ex: RAC001" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Descrição"
            >
              <Input.TextArea 
                placeholder="Descrição do produto (opcional)"
                rows={3}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Preço de Venda (R$)"
                  rules={[{ required: true, message: 'Por favor, insira o preço!' }]}
                >
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value: any) => value!.replace(/R\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Status"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch 
                    checkedChildren="Ativo" 
                    unCheckedChildren="Inativo"
                    defaultChecked
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Gestão de Estoque" key="stock">
            <Form.Item
              name="isStockItem"
              label="É item de estoque?"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch 
                checkedChildren="Sim" 
                unCheckedChildren="Não"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="unit"
                  label="Unidade"
                >
                  <Select placeholder="Selecione a unidade">
                    <Option value="UN">UN - Unidade</Option>
                    <Option value="KG">KG - Kilograma</Option>
                    <Option value="L">L - Litro</Option>
                    <Option value="M">M - Metro</Option>
                    <Option value="CX">CX - Caixa</Option>
                    <Option value="PK">PK - Pacote</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="costPrice"
                  label="Preço de Custo (R$)"
                >
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value: any) => value!.replace(/R\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="primarySupplierId"
                  label="Fornecedor Principal"
                >
                  <Select placeholder="Selecione o fornecedor" showSearch>
                    {suppliers.map(s => (
                      <Option key={s.id} value={s.id}>{s.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="minStock"
                  label="Estoque Mínimo"
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="reorderPoint"
                  label="Ponto de Reposição"
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="reorderQty"
                  label="Quantidade para Reposição"
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="leadTimeDays"
                  label="Prazo de Entrega (dias)"
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
          <Button onClick={handleModalClose}>
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            {isEditing ? 'Atualizar' : 'Criar'} Produto
          </Button>
        </div>
      </Form>
    </Modal>
  )

  const renderAdjustStockModal = () => (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <EditTwoTone className="text-green-600" />
          <span>Ajustar Estoque</span>
        </div>
      }
      open={showAdjustModal}
      onCancel={() => {
        setShowAdjustModal(false)
        adjustForm.resetFields()
        setSelectedItem(null)
      }}
      footer={null}
      width={600}
    >
      {selectedItem && (
        <Form
          form={adjustForm}
          layout="vertical"
          onFinish={handleAdjustStock}
          className="mt-4"
        >
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Produto: <span className="font-medium">{selectedItem.name}</span></div>
            <div className="text-sm text-gray-600">Estoque Atual: <span className="font-medium">{selectedItem.currentStock} {selectedItem.unit || 'UN'}</span></div>
          </div>

          <Form.Item
            name="newStock"
            label="Novo Estoque"
            rules={[{ required: true, message: 'Por favor, insira o novo estoque!' }]}
          >
            <InputNumber
              placeholder="Digite o novo estoque"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Observações"
          >
            <TextArea
              placeholder="Observações sobre o ajuste (opcional)"
              rows={3}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => {
              setShowAdjustModal(false)
              adjustForm.resetFields()
              setSelectedItem(null)
            }}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-green-600 hover:bg-green-700 border-green-600"
            >
              Confirmar Ajuste
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  )

  const renderPurchaseOrderModal = () => (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <ShoppingCartOutlined className="text-green-600" />
          <span>Gerar Pedido de Compra</span>
        </div>
      }
      open={showPurchaseModal}
      onCancel={() => {
        setShowPurchaseModal(false)
        purchaseForm.resetFields()
        setPurchaseSuggestions([])
      }}
      footer={null}
      width={800}
    >
      <Form
        form={purchaseForm}
        layout="vertical"
        onFinish={handleCreatePurchaseOrder}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="supplierId" label="Fornecedor" rules={[{ required: true, message: 'Selecione o fornecedor' }]}>
              <Select placeholder="Selecione o fornecedor" showSearch filterOption={(i,o)=> (o?.children as any)?.toLowerCase?.().includes(i.toLowerCase())}>
                {suppliers.map((s:any) => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="expectedDate" label="Data Prevista de Recebimento">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            {purchaseSuggestions.length} produto(s) com estoque baixo/zerado foram sugeridos para reposição.
          </p>
        </div>

        <Form.List name="items">
          {(fields) => (
            <>
              {fields.map((field, index) => {
                const suggestion = purchaseSuggestions[index]
                if (!suggestion) return null
                
                return (
                  <Card key={field.key} className="mb-4">
                    <Row gutter={16}>
                      <Col span={12}>
                        <div>
                          <strong>{suggestion.productName}</strong>
                          {suggestion.productSku && (
                            <div className="text-sm text-gray-500">SKU: {suggestion.productSku}</div>
                          )}
                          <div className="text-sm text-gray-500">
                            Estoque atual: {suggestion.currentStock} {suggestion.unit}
                          </div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'quantity']}
                          label="Quantidade"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'unitPrice']}
                          label="Preço Unitário"
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={0}
                            prefix="R$"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                )
              })}
            </>
          )}
        </Form.List>

        <div className="flex justify-end space-x-2 pt-4">
          <Button onClick={() => {
            setShowPurchaseModal(false)
            purchaseForm.resetFields()
            setPurchaseSuggestions([])
          }}>
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            Criar Pedido de Compra
          </Button>
        </div>
      </Form>
    </Modal>
  )

  // ==================== RENDERIZAÇÃO PRINCIPAL ====================

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos e Estoque</h1>
            <p className="text-gray-600">Gerencie seu catálogo de produtos e estoque</p>
          </div>
          <div className="flex space-x-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              size="large"
              className="px-6 py-3"
            >
              Atualizar
            </Button>
            {activeTab === 'catalog' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields()
                  setIsEditing(false)
                  setSelectedProduct(null)
                  setShowModal(true)
                }}
                className="bg-green-600 hover:bg-green-700 border-green-600 px-6 py-3"
                size="large"
              >
                Novo Produto
              </Button>
            )}
            {(activeTab === 'stock' || activeTab === 'alerts') && (
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleGeneratePurchaseOrder}
                className="bg-green-600 hover:bg-green-700 border-green-600 px-6 py-3"
                size="large"
              >
                Gerar Pedido de Compra
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              // Verificar permissões para abas de estoque
              if ((key === 'stock' || key === 'alerts' || key === 'movements')) {
                if (!hasInventoryAccess) {
                  message.warning('Você não tem permissão para acessar esta aba.')
                  return
                }
              }
              setActiveTab(key)
              router.push(`/products?tab=${key}`, undefined, { shallow: true })
            }}
          >
            <TabPane
              tab={
                <span>
                  <AppstoreOutlined />
                  Catálogo
                </span>
              }
              key="catalog"
            >
              {renderCatalogTab()}
            </TabPane>
            {(hasInventoryAccess) && (
              <>
                <TabPane
                  tab={
                    <span>
                      <DatabaseOutlined />
                      Estoque
                    </span>
                  }
                  key="stock"
                >
                  {renderStockTab()}
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <WarningOutlined />
                      Alertas
                    </span>
                  }
                  key="alerts"
                >
                  {renderAlertsTab()}
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <SwapOutlined />
                      Movimentações
                    </span>
                  }
                  key="movements"
                >
                  {renderMovementsTab()}
                </TabPane>
              </>
            )}
          </Tabs>
        </Card>

        {/* Modais */}
        {renderProductModal()}
        {renderAdjustStockModal()}
        {renderPurchaseOrderModal()}

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ShoppingOutlined className="text-green-600" />
              <span>Detalhes do Produto</span>
            </div>
          }
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={600}
        >
          {selectedProduct && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<ShoppingOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-gray-600">
                      {selectedProduct.description || 'Sem descrição'}
                    </p>
                    {selectedProduct.sku && (
                      <p className="text-sm text-gray-500">
                        SKU: {selectedProduct.sku}
                      </p>
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preço:</span>
                          <span className="font-bold text-green-600">
                            R$ {selectedProduct.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estoque:</span>
                          <span className="font-medium">
                            {selectedProduct.stock ?? 0} unidades
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Tag color={selectedProduct.isActive ? 'green' : 'red'} className={TAG_CLASS}>
                            {selectedProduct.isActive ? 'Ativo' : 'Inativo'}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="flex justify-end space-x-2 mt-6">
                <Button onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEdit(selectedProduct)
                  }}
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Editar Produto
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
