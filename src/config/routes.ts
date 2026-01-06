// Configuração de rotas do sistema
export const ROUTES_CONFIG = {
  // Rotas principais
  DASHBOARD: '/',
  CUSTOMERS: '/customers',
  PETS: '/pets',
  APPOINTMENTS: '/appointments',
  CALENDAR: '/calendar',
  SERVICES: '/services',
  MEDICAL_RECORDS: '/medical-records',
  PRODUCTS: '/products',
  SALES: '/sales',
  FINANCIAL_REPORTS: '/financial-reports',
  SUPPLIERS: '/suppliers',
  PURCHASES: '/purchases',
  STOCK_ALERTS: '/stock-alerts',
  COMMUNICATIONS: '/communications',
  NOTIFICATIONS: '/notifications',
  
  // Rotas administrativas (unificadas)
  USER_ROLE_MANAGEMENT: '/user-role-management',
  SETTINGS: '/settings',
  
  // Rotas de autenticação
  LOGIN: '/login',
  PROFILE: '/profile'
}

// Configuração de sidebar por role
export const SIDEBAR_CONFIG = {
  ADMIN: [
    { key: 'dashboard', label: 'Dashboard', icon: 'DashboardOutlined', path: ROUTES_CONFIG.DASHBOARD },
    { key: 'customers', label: 'Clientes', icon: 'UserOutlined', path: ROUTES_CONFIG.CUSTOMERS },
    { key: 'pets', label: 'Pets', icon: 'HeartOutlined', path: ROUTES_CONFIG.PETS },
    { key: 'appointments', label: 'Agendamentos', icon: 'CalendarOutlined', path: ROUTES_CONFIG.APPOINTMENTS },
    { key: 'calendar', label: 'Calendário', icon: 'CalendarOutlined', path: ROUTES_CONFIG.CALENDAR },
    { key: 'services', label: 'Serviços', icon: 'ToolOutlined', path: ROUTES_CONFIG.SERVICES },
    { key: 'medical-records', label: 'Histórico Médico', icon: 'MedicineBoxOutlined', path: ROUTES_CONFIG.MEDICAL_RECORDS },
    { key: 'products', label: 'Produtos', icon: 'ShoppingOutlined', path: ROUTES_CONFIG.PRODUCTS },
    { key: 'sales', label: 'Vendas', icon: 'DollarOutlined', path: ROUTES_CONFIG.SALES },
    { key: 'financial-reports', label: 'Relatórios Financeiros', icon: 'BarChartOutlined', path: ROUTES_CONFIG.FINANCIAL_REPORTS },
    { key: 'suppliers', label: 'Fornecedores', icon: 'ShopOutlined', path: ROUTES_CONFIG.SUPPLIERS },
    { key: 'purchases', label: 'Compras', icon: 'ShoppingCartOutlined', path: ROUTES_CONFIG.PURCHASES },
    { key: 'stock-alerts', label: 'Alertas de Estoque', icon: 'ExclamationCircleOutlined', path: ROUTES_CONFIG.STOCK_ALERTS },
    { key: 'communications', label: 'Comunicação', icon: 'MessageOutlined', path: ROUTES_CONFIG.COMMUNICATIONS },
    { key: 'notifications', label: 'Notificações', icon: 'BellOutlined', path: ROUTES_CONFIG.NOTIFICATIONS },
    { key: 'user-role-management', label: 'Usuários e Permissões', icon: 'TeamOutlined', path: ROUTES_CONFIG.USER_ROLE_MANAGEMENT },
    { key: 'settings', label: 'Configurações', icon: 'SettingOutlined', path: ROUTES_CONFIG.SETTINGS }
  ],
  
  MANAGER: [
    { key: 'dashboard', label: 'Dashboard', icon: 'DashboardOutlined', path: ROUTES_CONFIG.DASHBOARD },
    { key: 'customers', label: 'Clientes', icon: 'UserOutlined', path: ROUTES_CONFIG.CUSTOMERS },
    { key: 'pets', label: 'Pets', icon: 'HeartOutlined', path: ROUTES_CONFIG.PETS },
    { key: 'appointments', label: 'Agendamentos', icon: 'CalendarOutlined', path: ROUTES_CONFIG.APPOINTMENTS },
    { key: 'calendar', label: 'Calendário', icon: 'CalendarOutlined', path: ROUTES_CONFIG.CALENDAR },
    { key: 'services', label: 'Serviços', icon: 'ToolOutlined', path: ROUTES_CONFIG.SERVICES },
    { key: 'medical-records', label: 'Histórico Médico', icon: 'MedicineBoxOutlined', path: ROUTES_CONFIG.MEDICAL_RECORDS },
    { key: 'products', label: 'Produtos', icon: 'ShoppingOutlined', path: ROUTES_CONFIG.PRODUCTS },
    { key: 'sales', label: 'Vendas', icon: 'DollarOutlined', path: ROUTES_CONFIG.SALES },
    { key: 'financial-reports', label: 'Relatórios Financeiros', icon: 'BarChartOutlined', path: ROUTES_CONFIG.FINANCIAL_REPORTS },
    { key: 'suppliers', label: 'Fornecedores', icon: 'ShopOutlined', path: ROUTES_CONFIG.SUPPLIERS },
    { key: 'purchases', label: 'Compras', icon: 'ShoppingCartOutlined', path: ROUTES_CONFIG.PURCHASES },
    { key: 'stock-alerts', label: 'Alertas de Estoque', icon: 'ExclamationCircleOutlined', path: ROUTES_CONFIG.STOCK_ALERTS },
    { key: 'communications', label: 'Comunicação', icon: 'MessageOutlined', path: ROUTES_CONFIG.COMMUNICATIONS },
    { key: 'notifications', label: 'Notificações', icon: 'BellOutlined', path: ROUTES_CONFIG.NOTIFICATIONS }
  ],
  
  ATTENDANT: [
    { key: 'dashboard', label: 'Dashboard', icon: 'DashboardOutlined', path: ROUTES_CONFIG.DASHBOARD },
    { key: 'customers', label: 'Clientes', icon: 'UserOutlined', path: ROUTES_CONFIG.CUSTOMERS },
    { key: 'pets', label: 'Pets', icon: 'HeartOutlined', path: ROUTES_CONFIG.PETS },
    { key: 'appointments', label: 'Agendamentos', icon: 'CalendarOutlined', path: ROUTES_CONFIG.APPOINTMENTS },
    { key: 'calendar', label: 'Calendário', icon: 'CalendarOutlined', path: ROUTES_CONFIG.CALENDAR },
    { key: 'services', label: 'Serviços', icon: 'ToolOutlined', path: ROUTES_CONFIG.SERVICES },
    { key: 'products', label: 'Produtos', icon: 'ShoppingOutlined', path: ROUTES_CONFIG.PRODUCTS },
    { key: 'sales', label: 'Vendas', icon: 'DollarOutlined', path: ROUTES_CONFIG.SALES },
    { key: 'stock-alerts', label: 'Alertas de Estoque', icon: 'ExclamationCircleOutlined', path: ROUTES_CONFIG.STOCK_ALERTS },
    { key: 'communications', label: 'Comunicação', icon: 'MessageOutlined', path: ROUTES_CONFIG.COMMUNICATIONS },
    { key: 'notifications', label: 'Notificações', icon: 'BellOutlined', path: ROUTES_CONFIG.NOTIFICATIONS }
  ],
  
  VETERINARIAN: [
    { key: 'dashboard', label: 'Dashboard', icon: 'DashboardOutlined', path: ROUTES_CONFIG.DASHBOARD },
    { key: 'customers', label: 'Clientes', icon: 'UserOutlined', path: ROUTES_CONFIG.CUSTOMERS },
    { key: 'pets', label: 'Pets', icon: 'HeartOutlined', path: ROUTES_CONFIG.PETS },
    { key: 'appointments', label: 'Agendamentos', icon: 'CalendarOutlined', path: ROUTES_CONFIG.APPOINTMENTS },
    { key: 'calendar', label: 'Calendário', icon: 'CalendarOutlined', path: ROUTES_CONFIG.CALENDAR },
    { key: 'services', label: 'Serviços', icon: 'ToolOutlined', path: ROUTES_CONFIG.SERVICES },
    { key: 'medical-records', label: 'Histórico Médico', icon: 'MedicineBoxOutlined', path: ROUTES_CONFIG.MEDICAL_RECORDS },
    { key: 'products', label: 'Produtos', icon: 'ShoppingOutlined', path: ROUTES_CONFIG.PRODUCTS },
    { key: 'sales', label: 'Vendas', icon: 'DollarOutlined', path: ROUTES_CONFIG.SALES },
    { key: 'stock-alerts', label: 'Alertas de Estoque', icon: 'ExclamationCircleOutlined', path: ROUTES_CONFIG.STOCK_ALERTS },
    { key: 'communications', label: 'Comunicação', icon: 'MessageOutlined', path: ROUTES_CONFIG.COMMUNICATIONS },
    { key: 'notifications', label: 'Notificações', icon: 'BellOutlined', path: ROUTES_CONFIG.NOTIFICATIONS }
  ]
}

// Função para obter sidebar baseada na role
export const getSidebarByRole = (role: string) => {
  return SIDEBAR_CONFIG[role as keyof typeof SIDEBAR_CONFIG] || SIDEBAR_CONFIG.ATTENDANT
}
