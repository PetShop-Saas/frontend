// Configuração de Tema do Sistema — UI V2
export const theme = {
  colors: {
    // Cores Primárias
    primary: '#047857',
    primaryHover: '#059669',
    primaryLight: '#10b981',
    primaryDark: '#064e3b',
    primaryGlow: 'rgba(4, 120, 87, 0.15)',

    // Cores de Status
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // KPI Card accents (variações do verde para distinção visual)
    accentTeal: '#0d9488',
    accentEmerald: '#059669',
    accentForest: '#166534',
    accentSage: '#4ade80',

    // Cores Neutras
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',

    // Background
    background: '#f4f6f9',
    cardBackground: '#ffffff',
    sidebarBackground: '#042f1e',
    sidebarGradient: 'linear-gradient(180deg, #042f1e 0%, #064e3b 60%, #065f46 100%)',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
    colored: '0 4px 14px 0 rgba(4, 120, 87, 0.25)',
  },

  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '14px',
      md: '15px',
      lg: '16px',
      xl: '18px',
      '2xl': '22px',
      '3xl': '28px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
    },
  },
}

// Configuração Ant Design — UI V2
export const antdTheme = {
  token: {
    colorPrimary: theme.colors.primary,
    colorSuccess: theme.colors.success,
    colorWarning: theme.colors.warning,
    colorError: theme.colors.error,
    colorInfo: theme.colors.info,
    borderRadius: 10,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    controlHeight: 38,
    boxShadow: theme.shadows.sm,
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f0f0f0',
  },
}
