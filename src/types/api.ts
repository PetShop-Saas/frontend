/**
 * Tipos comuns para respostas e DTOs da API.
 * Reduz uso de `any` e melhora autocomplete e segurança de tipos.
 */

export interface ApiUser {
  id: string
  email: string
  name: string
  role: string
  planRole?: string
  tenantId: string
  isActive?: boolean
  avatar?: string | null
  userPermissions?: string | null
  userSidebarItems?: string | null
  createdAt?: string
  updatedAt?: string
  tenant?: {
    id: string
    name: string
    subdomain: string
  }
}

export interface AuthResponse {
  access_token: string
  user: ApiUser
}

export interface UserPermissionsResponse {
  permissions: string[]
  sidebarItems: string[]
  user?: ApiUser
}

export interface ApiMessage {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total?: number
}

export interface TenantBasic {
  id: string
  name: string
  subdomain: string
  plan?: string
  billingStatus?: string
  trialEndsAt?: string | null
}

export interface CustomerBasic {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

export interface ProductBasic {
  id: string
  name: string
  price?: number
  isStockItem?: boolean
  tenantId?: string
  isActive?: boolean
}
