import { NextRequest, NextResponse } from 'next/server'

// Mapeamento de rotas para permissões necessárias
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'dashboard.read',
  '/customers': 'customers.read',
  '/pets': 'pets.read',
  '/appointments': 'appointments.read',
  '/calendar': 'appointments.calendar',
  '/services': 'services.read',
  '/products': 'products.read',
  '/sales': 'sales.read',
  '/suppliers': 'suppliers.read',
  '/purchases': 'purchases.read',
  '/medical-records': 'medical-records.read',
  '/hotel': 'hotel.read',
  '/cash-flow': 'cash-flow.read',
  '/financial-reports': 'financial-reports.read',
  '/billing': 'billing.read',
  '/communications': 'communications.read',
  '/notifications': 'notifications.read',
  '/tickets': 'tickets.read',
  '/operations': 'operations.read',
  '/admin-dashboard': 'admin.dashboard',
  '/admin-billing': 'admin.billing',
  '/unified-access-management': 'users.read',
  '/personalization': 'admin.personalization',
  '/audit-logs': 'audit.read',
  '/backup': 'backup.read',
  // Removido '/settings' para evitar redirecionamento
  // Removido '/stock-movements' - consolidado em /products
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir acesso livre para landing page e login
  if (pathname === '/' || pathname === '/login') {
    return NextResponse.next()
  }
  
  // Verificar se a rota precisa de permissão
  const requiredPermission = ROUTE_PERMISSIONS[pathname]
  
  if (!requiredPermission) {
    return NextResponse.next()
  }

  // Verificar se o usuário está autenticado
  // Como estamos usando localStorage no frontend, vamos permitir acesso
  // e deixar o Layout fazer a verificação de autenticação
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - settings (settings page - sem middleware)
     * - index (landing page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|settings|^$).*)',
  ],
}
