import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PlanBadge } from '../PlanBadge'
import { apiService } from '../../services/api'

jest.mock('../../services/api')

describe('PlanBadge', () => {
  const mockGetItem = jest.fn()

  beforeEach(() => {
    // Mock localStorage
    mockGetItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify({ tenantId: 'test-tenant-123' })
      }
      return null
    })
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockGetItem.mockClear()
  })

  it('should render ADMIN badge correctly', async () => {
    const mockTrialStatus = {
      plan: 'ADMIN',
      isTrialActive: false,
      trialExpired: false,
      daysRemaining: 0,
      isFreeUser: false,
    }

    ;(apiService.getTrialStatus as jest.Mock).mockResolvedValue(mockTrialStatus)

    render(<PlanBadge />)

    await waitFor(() => {
      expect(screen.getByText('ADMIN')).toBeInTheDocument()
    })
  })

  it('should render FREE DEMO badge with days remaining', async () => {
    const mockTrialStatus = {
      plan: 'FREE',
      isTrialActive: true,
      trialExpired: false,
      daysRemaining: 3,
      isFreeUser: true,
    }

    ;(apiService.getTrialStatus as jest.Mock).mockResolvedValue(mockTrialStatus)

    render(<PlanBadge />)

    await waitFor(() => {
      expect(screen.getByText('DEMO (3d)')).toBeInTheDocument()
    })
  })

  it('should render DEMO EXPIRADO when trial expired', async () => {
    const mockTrialStatus = {
      plan: 'FREE',
      isTrialActive: false,
      trialExpired: true,
      daysRemaining: 0,
      isFreeUser: true,
    }

    ;(apiService.getTrialStatus as jest.Mock).mockResolvedValue(mockTrialStatus)

    render(<PlanBadge />)

    await waitFor(() => {
      expect(screen.getByText('DEMO EXPIRADO')).toBeInTheDocument()
    })
  })

  it('should render PRO badge correctly', async () => {
    const mockTrialStatus = {
      plan: 'PRO',
      isTrialActive: false,
      trialExpired: false,
      daysRemaining: 0,
      isFreeUser: false,
    }

    ;(apiService.getTrialStatus as jest.Mock).mockResolvedValue(mockTrialStatus)

    render(<PlanBadge />)

    await waitFor(() => {
      expect(screen.getByText('PRO')).toBeInTheDocument()
    })
  })

  it('should render ENTERPRISE badge correctly', async () => {
    const mockTrialStatus = {
      plan: 'ENTERPRISE',
      isTrialActive: false,
      trialExpired: false,
      daysRemaining: 0,
      isFreeUser: false,
    }

    ;(apiService.getTrialStatus as jest.Mock).mockResolvedValue(mockTrialStatus)

    render(<PlanBadge />)

    await waitFor(() => {
      expect(screen.getByText('ENTERPRISE')).toBeInTheDocument()
    })
  })

  it('should not render when loading', () => {
    ;(apiService.getTrialStatus as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { container } = render(<PlanBadge />)
    expect(container.firstChild).toBeNull()
  })
})

