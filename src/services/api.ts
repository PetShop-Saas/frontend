import type { AuthResponse, ApiUser, UserPermissionsResponse } from '@/types/api'

export interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Pet {
  id: string
  name: string
  species: string
  breed?: string | null
  customerId: string
  createdAt?: string
  updatedAt?: string
}

export interface Service {
  id: string
  name: string
  price: number
  duration: number
  description?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  id: string
  name: string
  price: number
  cost?: number | null
  stock?: number | null
  sku?: string | null
  description?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Appointment {
  id: string
  date: string
  status: string
  notes?: string | null
  customerId: string
  petId: string
  serviceId: string
  createdAt?: string
  updatedAt?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  private handleAuthError(status: number): void {
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    if (status === 403) {
      window.location.href = '/dashboard'
      throw new Error('Forbidden')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...(options.headers as Record<string, string>)
    }
    if (options.body instanceof FormData) {
      delete headers['Content-Type']
    }
    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      this.handleAuthError(response.status)
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        try {
          const data = await response.json()
          const msg = Array.isArray(data?.message) ? data.message[0] : (data?.message || data?.error || '')
          if (msg) throw new Error(msg)
        } catch {
          // ignore parse errors
        }
      }
      if (response.status === 409) {
        throw new Error('Este e-mail ou subdomínio já está em uso. Tente outro.')
      }
      if (response.status === 400) {
        throw new Error('Alguns dados estão inválidos. Revise os campos e tente novamente.')
      }
      throw new Error('Não foi possível concluir a solicitação. Tente novamente.')
    }

    return response.json()
  }

  private async requestText(endpoint: string, options: RequestInit = {}): Promise<string | null> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      this.handleAuthError(response.status)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const text = await response.text()
    if (text === '') return null
    try {
      return JSON.parse(text)
    } catch (e) {
      return text
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }


  // Customers endpoints
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/customers')
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.request<void>(`/customers/${id}`, {
      method: 'DELETE'
    })
  }

  // Pets endpoints
  async getPets(): Promise<Pet[]> {
    return this.request<Pet[]>('/pets')
  }

  async createPet(data: Partial<Pet>): Promise<Pet> {
    return this.request<Pet>('/pets', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
    return this.request<Pet>(`/pets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deletePet(id: string): Promise<void> {
    return this.request<void>(`/pets/${id}`, {
      method: 'DELETE'
    })
  }

  // Appointments endpoints
  async getAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/appointments')
  }

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteAppointment(id: string): Promise<void> {
    return this.request<void>(`/appointments/${id}`, {
      method: 'DELETE'
    })
  }

  // Services endpoints
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/services')
  }

  async createService(data: Partial<Service>): Promise<Service> {
    return this.request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    return this.request<Service>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteService(id: string): Promise<void> {
    return this.request<void>(`/services/${id}`, {
      method: 'DELETE'
    })
  }

  // Products endpoints
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products')
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE'
    })
  }

  // Sales endpoints
  async getSales() {
    return this.request('/sales')
  }

  async createSale(data: any) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateSale(id: string, data: any) {
    return this.request(`/sales/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteSale(id: string) {
    return this.request(`/sales/${id}`, {
      method: 'DELETE'
    })
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/notifications')
  }

  async getUnreadNotifications() {
    return this.request('/notifications/unread')
  }

  async getUnreadCount() {
    return this.request('/notifications/unread/count')
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    })
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read/all', {
      method: 'PATCH'
    })
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    })
  }

  // Auth / usuário atual
  async getCurrentUser(): Promise<ApiUser> {
    return this.request<ApiUser>('/auth/me')
  }

  async getAllPermissions() {
    return this.request('/permissions/all')
  }

  async getAllRoles() {
    return this.request('/permissions/roles')
  }

  async assignPermissionsToUser(userId: string, permissions: string[]) {
    return this.request(`/permissions/users/${userId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissions })
    })
  }

  async assignSidebarToUser(userId: string, sidebarItems: any[]) {
    return this.request(`/permissions/users/${userId}/sidebar`, {
      method: 'POST',
      body: JSON.stringify({ sidebarItems })
    })
  }

  // Settings endpoints
  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    })
  }

  async getSetting(key: string) {
    return this.request(`/settings/${key}`)
  }

  async getSettingValue(key: string): Promise<string | null> {
    return this.requestText(`/settings/${key}/value`)
  }

  async updateSetting(key: string, value: any) {
    return this.request(`/settings/${key}/set`, {
      method: 'POST',
      body: JSON.stringify({ value })
    })
  }

  async getUsers() {
    return this.request('/users')
  }

  getAllUsers() {
    return this.getUsers()
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`)
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    })
  }

  async uploadAvatar(id: string, formData: FormData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/users/${id}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    })

    if (!response.ok) {
      this.handleAuthError(response.status)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getMedicalRecords() {
    return this.request('/medical-records')
  }

  async createMedicalRecord(data: any) {
    return this.request('/medical-records', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateMedicalRecord(id: string, data: any) {
    return this.request(`/medical-records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteMedicalRecord(id: string) {
    return this.request(`/medical-records/${id}`, {
      method: 'DELETE'
    })
  }

  // Suppliers endpoints
  async getSuppliers() {
    return this.request('/suppliers')
  }

  async createSupplier(data: any) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateSupplier(id: string, data: any) {
    return this.request(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE'
    })
  }

  // Communications endpoints
  async getCommunicationHistory() {
    return this.request('/communications/history')
  }

  async getCommunications(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/communications${queryString}`)
  }

  async getCommunicationById(id: string) {
    return this.request(`/communications/${id}`)
  }

  async sendPromotionalMessage(customerIds: string[], message: string) {
    return this.request('/communications/promotional', {
      method: 'POST',
      body: JSON.stringify({ customerIds, message })
    })
  }

  async sendBirthdayMessage(customerId: string) {
    return this.request('/communications/birthday', {
      method: 'POST',
      body: JSON.stringify({ customerId })
    })
  }

  async sendAppointmentReminder(appointmentId: string) {
    return this.request('/communications/appointment-reminder', {
      method: 'POST',
      body: JSON.stringify({ appointmentId })
    })
  }

  async scheduleMessage(data: any) {
    return this.request('/communications/schedule', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getCommunicationStats(startDate: string, endDate: string) {
    return this.request(`/communications/stats?startDate=${startDate}&endDate=${endDate}`)
  }

  // Financial Reports endpoints
  async getRevenueReport(startDate: string, endDate: string) {
    return this.request(`/financial-reports/revenue?startDate=${startDate}&endDate=${endDate}`)
  }

  async getExpensesReport(startDate: string, endDate: string) {
    return this.request(`/financial-reports/expenses?startDate=${startDate}&endDate=${endDate}`)
  }

  async getProfitLossReport(startDate: string, endDate: string) {
    return this.request(`/financial-reports/profit-loss?startDate=${startDate}&endDate=${endDate}`)
  }

  // Purchases endpoints
  async getPurchases() {
    return this.request('/purchases')
  }

  async createPurchase(data: any) {
    return this.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePurchase(id: string, data: any) {
    return this.request(`/purchases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async updatePurchaseStatus(id: string, status: string) {
    return this.request(`/purchases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }

  async receivePurchase(id: string) {
    return this.request(`/purchases/${id}/receive`, {
      method: 'POST'
    })
  }

  async deletePurchase(id: string) {
    return this.request(`/purchases/${id}`, {
      method: 'DELETE'
    })
  }

  // Stock Alerts endpoints
  async getStockAlerts() {
    return this.request('/stock-alerts')
  }

  async getActiveStockAlerts() {
    return this.request('/stock-alerts/active')
  }

  async createStockAlert(data: any) {
    return this.request('/stock-alerts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateStockAlert(id: string, data: any) {
    return this.request(`/stock-alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteStockAlert(id: string) {
    return this.request(`/stock-alerts/${id}`, {
      method: 'DELETE'
    })
  }

  async checkAndCreateAlerts() {
    return this.request('/stock-alerts/check', {
      method: 'POST'
    })
  }

  async getInventory(params?: {
    onlyLowStock?: boolean;
    onlyOutOfStock?: boolean;
    supplierId?: string;
    search?: string;
  }) {
    if (!params) {
      return this.request('/inventory')
    }
    
    const queryParams = new URLSearchParams()
    if (params.onlyLowStock !== undefined) {
      queryParams.append('onlyLowStock', String(params.onlyLowStock))
    }
    if (params.onlyOutOfStock !== undefined) {
      queryParams.append('onlyOutOfStock', String(params.onlyOutOfStock))
    }
    if (params.supplierId) {
      queryParams.append('supplierId', params.supplierId)
    }
    if (params.search) {
      queryParams.append('search', params.search)
    }
    
    const queryString = queryParams.toString()
    return this.request(`/inventory${queryString ? `?${queryString}` : ''}`)
  }

  async getLowStockItems() {
    return this.request('/inventory/low-stock')
  }

  async getInventoryStats() {
    return this.request('/inventory/stats')
  }

  async getPurchaseOrderSuggestions(supplierId?: string) {
    const queryString = supplierId ? `?supplierId=${supplierId}` : ''
    return this.request(`/inventory/purchase-suggestions${queryString}`)
  }

  async adjustStock(productId: string, newStock: number, notes?: string) {
    return this.request(`/inventory/${productId}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ newStock, notes })
    })
  }

  // Audit Logs endpoints
  async getAuditLogs(filters?: {
    userId?: string;
    entity?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.entity) params.append('entity', filters.entity)
    if (filters?.action) params.append('action', filters.action)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    return this.request(`/audit-logs?${params.toString()}`)
  }

  async getAuditLogStats(startDate: string, endDate: string) {
    return this.request(`/audit-logs/stats?startDate=${startDate}&endDate=${endDate}`)
  }

  async getRecentAuditLogs(limit: number = 10) {
    return this.request(`/audit-logs/recent?limit=${limit}`)
  }

  // Backup endpoints
  async createBackup() {
    return this.request('/backup/create', {
      method: 'POST'
    })
  }

  async restoreBackup(backupData: any) {
    return this.request('/backup/restore', {
      method: 'POST',
      body: JSON.stringify({ backupData })
    })
  }

  async getBackups() {
    return this.request('/backup/list')
  }

  async deleteBackup(filename: string) {
    return this.request(`/backup/${filename}`, {
      method: 'DELETE'
    })
  }

  async getAdminDashboard() {
    return this.request('/admin/dashboard')
  }

  async getAdminAnalytics() {
    return this.request('/admin/analytics')
  }

  async getAllTenants() {
    return this.request('/admin/tenants')
  }

  async getTenantById(id: string) {
    return this.request(`/admin/tenants/${id}`)
  }

  async createTenant(data: { name: string; subdomain: string; isActive?: boolean }) {
    return this.request('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTenant(id: string, data: { name?: string; subdomain?: string; isActive?: boolean }) {
    return this.request(`/admin/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteTenant(id: string) {
    return this.request(`/admin/tenants/${id}`, {
      method: 'DELETE'
    })
  }

  async getTenantData(tenantId: string) {
    return this.request(`/admin/tenants/${tenantId}/data`)
  }

  async getTenantStats(tenantId: string) {
    return this.request(`/admin/tenants/${tenantId}/stats`)
  }

  async getTrialStatus(tenantId: string) {
    return this.request(`/tenants/${tenantId}/trial-status`)
  }

  // Roles endpoints
  async getRoles() {
    return this.request('/roles')
  }

  async getRoleById(id: string) {
    return this.request(`/roles/${id}`)
  }

  async createRole(data: { name: string; description: string; permissions: string[]; sidebarItems: string[]; isActive?: boolean }) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[]; sidebarItems?: string[]; isActive?: boolean }) {
    return this.request(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteRole(id: string) {
    return this.request(`/roles/${id}`, {
      method: 'DELETE'
    })
  }

  async getRoleByUserRole(userRole: string) {
    return this.request(`/roles/user/${userRole}`)
  }

  async getSidebarItems(userRole: string) {
    return this.request(`/roles/sidebar/${userRole}`)
  }

  async getPermissions(userRole: string) {
    return this.request(`/roles/permissions/${userRole}`)
  }

  async getUserPermissions(userId: string): Promise<UserPermissionsResponse> {
    if (!userId) {
      return this.request<UserPermissionsResponse>('/permissions/user')
    }
    return this.request<UserPermissionsResponse>(`/permissions/user/${userId}`)
  }

  async createDefaultRoles() {
    return this.request('/roles/create-defaults', {
      method: 'POST'
    })
  }

  // Billing endpoints
  async getBillingHistory() {
    return this.request('/billing/history')
  }

  async getBillingInfo() {
    return this.request('/billing/info')
  }

  async createBillingEntry(data: any) {
    return this.request('/billing/create-entry', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateBillingStatus(id: string, status: string, paidAt?: Date) {
    return this.request(`/billing/update-status/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, paidAt })
    })
  }

  async updateTenantPlan(plan: string, monthlyPrice?: number, transactionId?: string, promotionId?: string) {
    return this.request('/billing/update-plan', {
      method: 'PATCH',
      body: JSON.stringify({ plan, monthlyPrice, transactionId, promotionId })
    })
  }

  // Pricing endpoints
  async getAllPlanPricings() {
    return this.request('/pricing/plans')
  }

  async getActivePlanPricing(plan: string, date?: string) {
    const query = date ? `?date=${date}` : ''
    return this.request(`/pricing/plans/${plan}${query}`)
  }

  async createPlanPricing(data: {
    plan: string
    price: number
    currency?: string
    validFrom?: string
    validUntil?: string
    description?: string
  }) {
    return this.request('/pricing/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePlanPricing(id: string, data: {
    price?: number
    validFrom?: string
    validUntil?: string
    description?: string
    isActive?: boolean
  }) {
    return this.request(`/pricing/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deletePlanPricing(id: string) {
    return this.request(`/pricing/plans/${id}`, {
      method: 'DELETE'
    })
  }

  async getAllPromotions() {
    return this.request('/pricing/promotions')
  }

  async getActivePromotions(plan?: string, date?: string) {
    const params = new URLSearchParams()
    if (plan) params.append('plan', plan)
    if (date) params.append('date', date)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/pricing/promotions/active${query}`)
  }

  async getPromotionById(id: string) {
    return this.request(`/pricing/promotions/${id}`)
  }

  async getPromotionByCode(code: string) {
    return this.request(`/pricing/promotions/code/${code}`)
  }

  async createPromotion(data: {
    name: string
    description?: string
    code?: string
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
    discountValue: number
    planPricingId?: string
    minMonths?: number
    maxMonths?: number
    validFrom: string
    validUntil?: string
    usageLimit?: number
  }) {
    return this.request('/pricing/promotions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePromotion(id: string, data: {
    name?: string
    description?: string
    code?: string
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT'
    discountValue?: number
    planPricingId?: string
    minMonths?: number
    maxMonths?: number
    validFrom?: string
    validUntil?: string
    usageLimit?: number
    isActive?: boolean
  }) {
    return this.request(`/pricing/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deletePromotion(id: string) {
    return this.request(`/pricing/promotions/${id}`, {
      method: 'DELETE'
    })
  }

  async calculatePrice(plan: string, months: number, promotionCode?: string, date?: string) {
    const params = new URLSearchParams()
    params.append('plan', plan)
    params.append('months', months.toString())
    if (promotionCode) params.append('promotionCode', promotionCode)
    if (date) params.append('date', date)
    return this.request(`/pricing/calculate?${params.toString()}`)
  }

  async getPublicPlanPricings() {
    const url = `${API_BASE_URL}/pricing/public/plans`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar preços dos planos')
    }

    return response.json()
  }

  async getPublicPromotions(plan?: string) {
    const url = `${API_BASE_URL}/pricing/public/promotions${plan ? `?plan=${plan}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar promoções')
    }

    return response.json()
  }

  async updateTenantBillingStatus(billingStatus: string) {
    return this.request('/billing/update-billing-status', {
      method: 'PATCH',
      body: JSON.stringify({ billingStatus })
    })
  }

  // Tickets endpoints
  async getTickets() {
    return this.request('/tickets')
  }

  async getTicketById(id: string) {
    return this.request(`/tickets/${id}`)
  }

  async createTicket(data: any) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTicketStatus(id: string, status: string) {
    return this.request(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }

  async assignTicket(id: string, assignedTo: string) {
    return this.request(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo })
    })
  }

  async addTicketMessage(id: string, data: any) {
    return this.request(`/tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getTicketMessages(id: string) {
    return this.request(`/tickets/${id}/messages`)
  }

  async deleteTicket(id: string) {
    return this.request(`/tickets/${id}`, {
      method: 'DELETE'
    })
  }

  async getAdminBillingOverview() {
    return this.request('/admin/billing/overview')
  }

  async getAdminPendingPayments() {
    return this.request('/admin/billing/pending')
  }

  async getAdminRevenueStats() {
    return this.request('/admin/billing/revenue')
  }

  async suspendTenant(id: string) {
    return this.request(`/admin/tenants/${id}/suspend`, {
      method: 'PUT'
    })
  }

  async activateTenant(id: string) {
    return this.request(`/admin/tenants/${id}/activate`, {
      method: 'PUT'
    })
  }

  // Stock Movements endpoints
  async createStockMovement(data: any) {
    return this.request('/stock-movements', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getStockMovements(filters?: any) {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.productId) params.append('productId', filters.productId)
    
    return this.request(`/stock-movements?${params.toString()}`)
  }

  async getStockMovementsByProduct(productId: string) {
    return this.request(`/stock-movements/product/${productId}`)
  }

  async getStockReport() {
    return this.request('/stock-movements/report')
  }

  // Cash Flow endpoints
  async createCashFlowEntry(data: any) {
    return this.request('/cash-flow', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getCashFlowEntries(filters?: any) {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.category) params.append('category', filters.category)
    
    return this.request(`/cash-flow?${params.toString()}`)
  }

  async getCashFlowBalance(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return this.request(`/cash-flow/balance?${params.toString()}`)
  }

  async getCashFlowReport(startDate: string, endDate: string) {
    return this.request(`/cash-flow/report?startDate=${startDate}&endDate=${endDate}`)
  }

  async updateCashFlowEntry(id: string, data: any) {
    return this.request(`/cash-flow/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteCashFlowEntry(id: string) {
    return this.request(`/cash-flow/${id}`, {
      method: 'DELETE'
    })
  }

  // Hotel - Quartos
  async createHotelRoom(data: any) {
    return this.request('/hotel/rooms', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getHotelRooms() {
    return this.request('/hotel/rooms')
  }

  async getAvailableRooms(checkIn: string, checkOut: string) {
    return this.request(`/hotel/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`)
  }

  async updateHotelRoom(id: string, data: any) {
    return this.request(`/hotel/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteHotelRoom(id: string) {
    return this.request(`/hotel/rooms/${id}`, {
      method: 'DELETE'
    })
  }

  // Hotel - Reservas/Hospedagens
  async createHotelBooking(data: any) {
    return this.request('/hotel/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getHotelBookings(filters?: any) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    
    return this.request(`/hotel/bookings?${params.toString()}`)
  }

  async getHotelBookingById(id: string) {
    return this.request(`/hotel/bookings/${id}`)
  }

  async checkInHotel(id: string) {
    return this.request(`/hotel/bookings/${id}/check-in`, {
      method: 'PATCH'
    })
  }

  async checkOutHotel(id: string, paymentData?: any) {
    return this.request(`/hotel/bookings/${id}/check-out`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData || {})
    })
  }

  async cancelHotelBooking(id: string) {
    return this.request(`/hotel/bookings/${id}/cancel`, {
      method: 'PATCH'
    })
  }

  async updateHotelBookingPayment(id: string, paymentData: any) {
    return this.request(`/hotel/bookings/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData)
    })
  }

  // Hotel - Relatórios Diários
  async createHotelDailyReport(data: any) {
    return this.request('/hotel/daily-reports', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getHotelDailyReports(bookingId: string) {
    return this.request(`/hotel/daily-reports/${bookingId}`)
  }

  async updateHotelDailyReport(id: string, data: any) {
    return this.request(`/hotel/daily-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Hotel - Serviços Extras
  async addHotelServiceUsage(data: any) {
    return this.request('/hotel/service-usage', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getHotelServiceUsage(bookingId: string) {
    return this.request(`/hotel/service-usage/${bookingId}`)
  }

  // Hotel - Estatísticas
  async getHotelStats() {
    return this.request('/hotel/stats')
  }

  // Sidebar Management
  async updateUserSidebarItems(userId: string, sidebarItems: string[]) {
    return this.request(`/users/${userId}/sidebar-items`, {
      method: 'PUT',
      body: JSON.stringify({ sidebarItems })
    })
  }

  async updateRoleSidebarItems(roleId: string, sidebarItems: string[]) {
    return this.request(`/roles/${roleId}/sidebar-items`, {
      method: 'PATCH',
      body: JSON.stringify({ sidebarItems })
    })
  }

  async updateTenantModules(tenantId: string, modules: string[]) {
    return this.request(`/tenants/${tenantId}/modules`, {
      method: 'PATCH',
      body: JSON.stringify({ modules })
    })
  }

  // Personalization endpoints
  async getPersonalizationSettings() {
    return this.request('/settings/personalization')
  }

  async updatePersonalizationSettings(settings: any) {
    return this.request('/settings/personalization', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    })
  }

  // Email Templates endpoints
  async getEmailTemplatesList() {
    return this.request('/settings/email-templates/list')
  }

  async getEmailTemplate(templateName: string) {
    return this.request(`/settings/email-templates/${templateName}`)
  }

  async updateEmailTemplate(templateName: string, template: { html: string; text: string; subject?: string }) {
    return this.request(`/settings/email-templates/${templateName}`, {
      method: 'PATCH',
      body: JSON.stringify(template)
    })
  }

  async resetEmailTemplate(templateName: string) {
    return this.request(`/settings/email-templates/${templateName}/reset`, {
      method: 'POST'
    })
  }

  // User preferences endpoints
  async getUserPreferences() {
    return this.request('/users/me/preferences')
  }

  async updateUserPreferences(preferences: any) {
    return this.request('/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    })
  }

  // Payment endpoints (AbacatePay)
  async createBilling(amount: number, description: string, plan?: string, promotionId?: string) {
    return this.request('/payments/create-billing', {
      method: 'POST',
      body: JSON.stringify({ amount, description, plan, promotionId })
    })
  }

  async createBillingPublic(amount: number, description: string, customerEmail: string, customerName: string, plan?: string, customerPhone?: string) {
    const response = await fetch(`${API_BASE_URL}/payments/create-billing-public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, description, plan, customerEmail, customerName, customerPhone })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao criar cobrança')
    }

    return response.json()
  }

  async checkBillingStatus(billingId: string) {
    const response = await fetch(`${API_BASE_URL}/payments/billing/${billingId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao verificar status')
    }

    return response.json()
  }

  async createPixQRCode(amount: number, description?: string, customerEmail?: string, customerName?: string) {
    if (customerEmail && customerName) {
      const response = await fetch(`${API_BASE_URL}/payments/pix/qrcode-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, description, customerEmail, customerName })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar QRCode PIX')
      }

      return response.json()
    }
    return this.request('/payments/pix/qrcode', {
      method: 'POST',
      body: JSON.stringify({ amount, description })
    })
  }

  async checkPixStatus(qrcodeId: string) {
    const response = await fetch(`${API_BASE_URL}/payments/pix/${qrcodeId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao verificar status PIX')
    }

    return response.json()
  }

  async simulatePixPayment(qrcodeId: string) {
    const response = await fetch(`${API_BASE_URL}/payments/pix/${qrcodeId}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao simular pagamento')
    }

    return response.json()
  }

  async uploadImage(file: File, category: string, metadata?: any) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    
    return this.request('/images/upload', {
      method: 'POST',
      body: formData
    })
  }

  async getImageUrl(imageId: string) {
    const token = localStorage.getItem('token')
    return `${API_BASE_URL}/images/${imageId}?token=${token}`
  }

  async getImageByCategory(category: string) {
    const token = localStorage.getItem('token')
    return `${API_BASE_URL}/images/category/${category}/active?token=${token}`
  }
}

export const apiService = new ApiService()

