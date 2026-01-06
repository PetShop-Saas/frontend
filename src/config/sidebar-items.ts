// Configuração da Sidebar - Itens Disponíveis no Sistema

export interface SidebarItem {
  key: string
  label: string
  icon: string
  path: string
  module: string // Módulo que controla visibilidade
  category: 'core' | 'sales' | 'inventory' | 'medical' | 'financial' | 'admin' | 'hotel'
  adminOnly?: boolean
  description?: string
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  // CORE - Funcionalidades Básicas
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'DashboardOutlined',
    path: '/dashboard',
    module: 'dashboard',
    category: 'core',
    description: 'Visão geral do negócio'
  },
  {
    key: 'customers',
    label: 'Clientes',
    icon: 'TeamOutlined',
    path: '/customers',
    module: 'customers',
    category: 'core',
    description: 'Gestão de clientes'
  },
  {
    key: 'pets',
    label: 'Pets',
    icon: 'HeartOutlined',
    path: '/pets',
    module: 'pets',
    category: 'core',
    description: 'Cadastro de pets'
  },
  {
    key: 'appointments',
    label: 'Agendamentos',
    icon: 'CalendarOutlined',
    path: '/appointments',
    module: 'appointments',
    category: 'core',
    description: 'Controle de agendamentos'
  },
  {
    key: 'services',
    label: 'Serviços',
    icon: 'ToolOutlined',
    path: '/services',
    module: 'services',
    category: 'core',
    description: 'Serviços oferecidos'
  },
  
  // VENDAS E PRODUTOS
  {
    key: 'products',
    label: 'Produtos',
    icon: 'ShoppingOutlined',
    path: '/products',
    module: 'products',
    category: 'sales',
    description: 'Catálogo de produtos'
  },
  {
    key: 'sales',
    label: 'Vendas',
    icon: 'ShoppingCartOutlined',
    path: '/sales',
    module: 'sales',
    category: 'sales',
    description: 'Registro de vendas'
  },
  
  // ESTOQUE
  {
    key: 'suppliers',
    label: 'Fornecedores',
    icon: 'ShopOutlined',
    path: '/suppliers',
    module: 'inventory',
    category: 'inventory',
    description: 'Gestão de fornecedores'
  },
  {
    key: 'purchases',
    label: 'Compras',
    icon: 'ShoppingOutlined',
    path: '/purchases',
    module: 'inventory',
    category: 'inventory',
    description: 'Controle de compras'
  },
  {
    key: 'stock-movements',
    label: 'Movimentações de Estoque',
    icon: 'SwapOutlined',
    path: '/stock-movements',
    module: 'inventory',
    category: 'inventory',
    description: 'Entradas e saídas de estoque'
  },
  
  // MÉDICO/VETERINÁRIO
  {
    key: 'medical-records',
    label: 'Histórico Médico',
    icon: 'MedicineBoxOutlined',
    path: '/medical-records',
    module: 'medical',
    category: 'medical',
    description: 'Histórico médico dos pets'
  },
  
  // HOTEL
  {
    key: 'hotel',
    label: 'Hotel para Pets',
    icon: 'HomeOutlined',
    path: '/hotel',
    module: 'hotel',
    category: 'hotel',
    description: 'Hospedagem de pets'
  },
  
  // FINANCEIRO
  {
    key: 'cash-flow',
    label: 'Fluxo de Caixa',
    icon: 'DollarOutlined',
    path: '/cash-flow',
    module: 'financial',
    category: 'financial',
    description: 'Controle de caixa'
  },
  {
    key: 'financial-reports',
    label: 'Relatórios Financeiros',
    icon: 'BarChartOutlined',
    path: '/financial-reports',
    module: 'financial',
    category: 'financial',
    description: 'Relatórios e análises financeiras'
  },
  {
    key: 'billing',
    label: 'Minha Assinatura',
    icon: 'CreditCardOutlined',
    path: '/billing',
    module: 'core',
    category: 'financial',
    description: 'Informações de pagamento'
  },
  
  // COMUNICAÇÃO
  {
    key: 'communications',
    label: 'Comunicação',
    icon: 'MessageOutlined',
    path: '/communications',
    module: 'communications',
    category: 'core',
    description: 'Mensagens e comunicados'
  },
  {
    key: 'notifications',
    label: 'Notificações',
    icon: 'BellOutlined',
    path: '/notifications',
    module: 'core',
    category: 'core',
    description: 'Notificações do sistema'
  },
  
  // SUPORTE
  {
    key: 'tickets',
    label: 'Suporte',
    icon: 'CustomerServiceOutlined',
    path: '/tickets',
    module: 'core',
    category: 'core',
    description: 'Tickets de suporte'
  },
  
  // PÁGINAS CONSOLIDADAS
  {
    key: 'management',
    label: 'Central de Gestão',
    icon: 'ControlOutlined',
    path: '/management',
    module: 'core',
    category: 'admin',
    description: 'Gestão unificada de clientes, pets e usuários'
  },
  {
    key: 'operations',
    label: 'Operações',
    icon: 'ThunderboltOutlined',
    path: '/operations',
    module: 'core',
    category: 'core',
    description: 'Agendamentos, serviços e vendas'
  },
  {
    key: 'tenant-modules',
    label: 'Configurar Módulos',
    icon: 'AppstoreOutlined',
    path: '/tenant-modules',
    module: 'admin',
    category: 'admin',
    adminOnly: true,
    description: 'Configurar módulos habilitados por tenant'
  },
  
  // ADMIN
  {
    key: 'admin-dashboard',
    label: 'Admin Dashboard',
    icon: 'DashboardOutlined',
    path: '/admin-dashboard',
    module: 'admin',
    category: 'admin',
    adminOnly: true,
    description: 'Dashboard administrativo'
  },
  {
    key: 'admin-billing',
    label: 'Gestão de Billing',
    icon: 'DollarOutlined',
    path: '/admin-billing',
    module: 'admin',
    category: 'admin',
    adminOnly: true,
    description: 'Gestão de pagamentos dos clientes'
  },
  {
    key: 'user-role-management',
    label: 'Usuários e Permissões',
    icon: 'TeamOutlined',
    path: '/user-role-management',
    module: 'admin',
    category: 'admin',
    adminOnly: true,
    description: 'Gestão unificada de usuários, roles e permissões'
  },
  {
    key: 'audit-logs',
    label: 'Logs de Auditoria',
    icon: 'FileTextOutlined',
    path: '/audit-logs',
    module: 'admin',
    category: 'admin',
    description: 'Histórico de ações'
  },
  {
    key: 'backup',
    label: 'Backup & Restore',
    icon: 'DatabaseOutlined',
    path: '/backup',
    module: 'admin',
    category: 'admin',
    description: 'Backup dos dados'
  },
  {
    key: 'settings',
    label: 'Configurações',
    icon: 'SettingOutlined',
    path: '/settings',
    module: 'core',
    category: 'admin',
    description: 'Configurações do sistema'
  },
]

export const CATEGORY_LABELS: Record<string, string> = {
  core: 'Principal',
  sales: 'Vendas',
  inventory: 'Estoque',
  medical: 'Veterinário',
  financial: 'Financeiro',
  hotel: 'Hotel',
  admin: 'Administração',
}

export const MODULE_DEFAULTS = {
  FREE: ['dashboard', 'customers', 'pets', 'appointments', 'services', 'notifications'],
  BASIC: ['dashboard', 'customers', 'pets', 'appointments', 'services', 'products', 'sales', 'notifications', 'communications'],
  PRO: ['dashboard', 'customers', 'pets', 'appointments', 'services', 'products', 'sales', 'inventory', 'medical', 'financial', 'notifications', 'communications'],
  ENTERPRISE: ['dashboard', 'customers', 'pets', 'appointments', 'services', 'products', 'sales', 'inventory', 'medical', 'financial', 'hotel', 'notifications', 'communications', 'admin'],
}

