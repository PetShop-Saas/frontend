import { apiService } from '../api'

// Mock fetch
global.fetch = jest.fn()

// Mock window.location
delete (window as any).location
window.location = { href: '' } as any

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'token') {
        return 'test-token-123'
      }
      return null
    })
    Storage.prototype.removeItem = jest.fn()
  })

  describe('login', () => {
    it('should call login endpoint with credentials', async () => {
      const mockResponse = {
        access_token: 'token-123',
        user: { id: '1', email: 'test@example.com' },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.login('test@example.com', 'password123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle 401 unauthorized', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: {
          get: jest.fn(() => null),
        },
      })

      await expect(apiService.login('test@example.com', 'wrong')).rejects.toThrow('Unauthorized')
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should handle other HTTP errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn(() => null),
        },
      })

      await expect(apiService.login('test@example.com', 'password')).rejects.toThrow('Não foi possível concluir a solicitação. Tente novamente.')
    })
  })

  describe('register', () => {
    it('should call register endpoint', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        id: '1',
        ...userData,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.register(userData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Customers', () => {
    it('should get all customers', async () => {
      const mockCustomers = [
        { id: '1', name: 'Customer 1' },
        { id: '2', name: 'Customer 2' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomers,
      })

      const result = await apiService.getCustomers()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customers'),
        expect.any(Object)
      )
      expect(result).toEqual(mockCustomers)
    })

    it('should create a customer', async () => {
      const newCustomer = { name: 'New Customer', email: 'new@example.com' }
      const mockResponse = { id: '1', ...newCustomer }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createCustomer(newCustomer)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customers'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newCustomer),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should update a customer', async () => {
      const updatedData = { name: 'Updated Customer' }
      const mockResponse = { id: '1', ...updatedData }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.updateCustomer('1', updatedData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customers/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updatedData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should delete a customer', async () => {
      const mockResponse = { success: true }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.deleteCustomer('1')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customers/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Pets', () => {
    it('should get all pets', async () => {
      const mockPets = [
        { id: '1', name: 'Dog', customerId: 'c1' },
        { id: '2', name: 'Cat', customerId: 'c2' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPets,
      })

      const result = await apiService.getPets()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets'),
        expect.any(Object)
      )
      expect(result).toEqual(mockPets)
    })

    it('should create a pet', async () => {
      const newPet = { name: 'Buddy', species: 'dog', customerId: 'c1' }
      const mockResponse = { id: '1', ...newPet }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createPet(newPet)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newPet),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should update a pet', async () => {
      const updatedData = { name: 'Updated Pet' }
      const mockResponse = { id: '1', ...updatedData }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.updatePet('1', updatedData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updatedData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should delete a pet', async () => {
      const mockResponse = { success: true }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.deletePet('1')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Products', () => {
    it('should get all products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 10.99 },
        { id: '2', name: 'Product 2', price: 20.99 },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      })

      const result = await apiService.getProducts()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.any(Object)
      )
      expect(result).toEqual(mockProducts)
    })

    it('should create a product', async () => {
      const newProduct = { name: 'New Product', price: 15.99 }
      const mockResponse = { id: '1', ...newProduct }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createProduct(newProduct)

      expect(result).toEqual(mockResponse)
    })

    it('should update a product', async () => {
      const updatedData = { name: 'Updated Product' }
      const mockResponse = { id: '1', ...updatedData }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.updateProduct('1', updatedData)

      expect(result).toEqual(mockResponse)
    })

    it('should delete a product', async () => {
      const mockResponse = { success: true }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.deleteProduct('1')

      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTrialStatus', () => {
    it('should fetch trial status for a tenant', async () => {
      const mockStatus = {
        plan: 'FREE',
        isTrialActive: true,
        daysRemaining: 3,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      })

      const result = await apiService.getTrialStatus('tenant-123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tenants/tenant-123/trial-status'),
        expect.any(Object)
      )
      expect(result).toEqual(mockStatus)
    })
  })

  describe('getAllTenants', () => {
    it('should fetch all tenants', async () => {
      const mockTenants = [
        { id: '1', name: 'Tenant 1' },
        { id: '2', name: 'Tenant 2' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTenants,
      })

      const result = await apiService.getAllTenants()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tenants'),
        expect.any(Object)
      )
      expect(result).toEqual(mockTenants)
    })
  })

  describe('createTenant', () => {
    it('should create a new tenant', async () => {
      const newTenant = {
        name: 'New Tenant',
        subdomain: 'new-tenant',
      }

      const mockResponse = {
        id: '123',
        ...newTenant,
        plan: 'FREE',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createTenant(newTenant)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tenants'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newTenant),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Services', () => {
    it('should get all services', async () => {
      const mockServices = [
        { id: '1', name: 'Service 1' },
        { id: '2', name: 'Service 2' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      })

      const result = await apiService.getServices()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/services'),
        expect.any(Object)
      )
      expect(result).toEqual(mockServices)
    })

    it('should create a service', async () => {
      const newService = { name: 'New Service', price: 50 }
      const mockResponse = { id: '1', ...newService }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createService(newService)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Appointments', () => {
    it('should get all appointments', async () => {
      const mockAppointments = [
        { id: '1', petId: 'p1', date: '2024-01-01' },
        { id: '2', petId: 'p2', date: '2024-01-02' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointments,
      })

      const result = await apiService.getAppointments()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/appointments'),
        expect.any(Object)
      )
      expect(result).toEqual(mockAppointments)
    })

    it('should create an appointment', async () => {
      const newAppointment = { petId: 'p1', date: '2024-01-01', serviceId: 's1' }
      const mockResponse = { id: '1', ...newAppointment }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createAppointment(newAppointment)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Sales', () => {
    it('should get all sales', async () => {
      const mockSales = [
        { id: '1', total: 100, date: '2024-01-01' },
        { id: '2', total: 200, date: '2024-01-02' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSales,
      })

      const result = await apiService.getSales()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/sales'),
        expect.any(Object)
      )
      expect(result).toEqual(mockSales)
    })

    it('should create a sale', async () => {
      const newSale = { items: [], total: 100 }
      const mockResponse = { id: '1', ...newSale }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createSale(newSale)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Dashboard', () => {
    it('should get dashboard stats', async () => {
      const mockDashboard = {
        totalCustomers: 100,
        totalSales: 5000,
        totalAppointments: 50,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      })

      const result = await apiService.getDashboardStats()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard'),
        expect.any(Object)
      )
      expect(result).toEqual(mockDashboard)
    })
  })

  describe('Notifications', () => {
    it('should get all notifications', async () => {
      const mockNotifications = [
        { id: '1', message: 'Test notification 1' },
        { id: '2', message: 'Test notification 2' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotifications,
      })

      const result = await apiService.getNotifications()

      expect(result).toEqual(mockNotifications)
    })

    it('should mark notification as read', async () => {
      const mockResponse = { success: true }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.markNotificationAsRead('1')

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Users', () => {
    it('should get all users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      })

      const result = await apiService.getUsers()

      expect(result).toEqual(mockUsers)
    })

    it('should create a user', async () => {
      const newUser = { name: 'New User', email: 'user@test.com' }
      const mockResponse = { id: '1', ...newUser }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createUser(newUser)

      expect(result).toEqual(mockResponse)
    })

    it('should update a user', async () => {
      const updatedData = { name: 'Updated User' }
      const mockResponse = { id: '1', ...updatedData }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.updateUser('1', updatedData)

      expect(result).toEqual(mockResponse)
    })

    it('should delete a user', async () => {
      const mockResponse = { success: true }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.deleteUser('1')

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Roles', () => {
    it('should get all roles', async () => {
      const mockRoles = [
        { id: '1', name: 'Admin' },
        { id: '2', name: 'User' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles,
      })

      const result = await apiService.getRoles()

      expect(result).toEqual(mockRoles)
    })

    it('should create a role', async () => {
      const newRole = {
        name: 'Manager',
        description: 'Manager role',
        permissions: ['read', 'write'],
        sidebarItems: ['dashboard'],
      }
      const mockResponse = { id: '1', ...newRole }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createRole(newRole)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Medical Records', () => {
    it('should get all medical records', async () => {
      const mockRecords = [
        { id: '1', petId: 'p1', diagnosis: 'Healthy' },
        { id: '2', petId: 'p2', diagnosis: 'Flu' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecords,
      })

      const result = await apiService.getMedicalRecords()

      expect(result).toEqual(mockRecords)
    })

    it('should create a medical record', async () => {
      const newRecord = { petId: 'p1', diagnosis: 'Healthy', treatment: 'None' }
      const mockResponse = { id: '1', ...newRecord }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createMedicalRecord(newRecord)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Suppliers', () => {
    it('should get all suppliers', async () => {
      const mockSuppliers = [
        { id: '1', name: 'Supplier 1' },
        { id: '2', name: 'Supplier 2' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuppliers,
      })

      const result = await apiService.getSuppliers()

      expect(result).toEqual(mockSuppliers)
    })

    it('should create a supplier', async () => {
      const newSupplier = { name: 'New Supplier', contact: 'contact@example.com' }
      const mockResponse = { id: '1', ...newSupplier }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createSupplier(newSupplier)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Purchases', () => {
    it('should get all purchases', async () => {
      const mockPurchases = [
        { id: '1', supplierId: 's1', total: 100 },
        { id: '2', supplierId: 's2', total: 200 },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPurchases,
      })

      const result = await apiService.getPurchases()

      expect(result).toEqual(mockPurchases)
    })

    it('should create a purchase', async () => {
      const newPurchase = { supplierId: 's1', items: [], total: 100 }
      const mockResponse = { id: '1', ...newPurchase }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiService.createPurchase(newPurchase)

      expect(result).toEqual(mockResponse)
    })
  })
})

