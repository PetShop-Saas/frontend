import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { apiService } from '../../services/api'

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/profile'
  })
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />
  }
}))

jest.mock('../../services/api', () => ({
  apiService: {
    getUserPreferences: jest.fn(),
    updateUser: jest.fn(),
    changePassword: jest.fn(),
    updateUserPreferences: jest.fn(),
    uploadAvatar: jest.fn()
  }
}))

const mockUser = {
  id: 'user-1',
  name: 'João Silva',
  email: 'joao@petflow.com',
  role: 'MANAGER',
  tenantId: 'tenant-abc',
  avatar: undefined
}

function setupLocalStorage() {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => {
        if (key === 'token') return 'fake-token'
        if (key === 'user') return JSON.stringify(mockUser)
        return null
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    writable: true
  })
}

describe('Profile page', () => {
  beforeEach(() => {
    setupLocalStorage()
    ;(apiService.getUserPreferences as jest.Mock).mockResolvedValue({
      enableNotifications: true,
      enableEmailNotifications: false,
      enablePushNotifications: true,
      emailMarketing: false
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render profile page title', async () => {
    const Profile = (await import('../../pages/profile')).default
    render(<Profile />)

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
    })
  })

  it('should display Dados Pessoais tab', async () => {
    const Profile = (await import('../../pages/profile')).default
    render(<Profile />)

    await waitFor(() => {
      expect(screen.getByText('Dados Pessoais')).toBeInTheDocument()
    })
  })

  it('should display Alterar Senha tab', async () => {
    const Profile = (await import('../../pages/profile')).default
    render(<Profile />)

    await waitFor(() => {
      expect(screen.getByText('Alterar Senha')).toBeInTheDocument()
    })
  })

  it('should display Notificações tab', async () => {
    const Profile = (await import('../../pages/profile')).default
    render(<Profile />)

    await waitFor(() => {
      expect(screen.getByText('Notificações')).toBeInTheDocument()
    })
  })

  it('should show user name in the form', async () => {
    const Profile = (await import('../../pages/profile')).default
    render(<Profile />)

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Seu nome completo') as HTMLInputElement
      expect(input.value).toBe('João Silva')
    })
  })

  it('should show user email in the form', async () => {
    const Profile = (await import('../../pages/profile')).default
    render(<Profile />)

    await waitFor(() => {
      const input = screen.getByPlaceholderText('seu@email.com') as HTMLInputElement
      expect(input.value).toBe('joao@petflow.com')
    })
  })

  it('should call updateUser on form submit', async () => {
    ;(apiService.updateUser as jest.Mock).mockResolvedValue({ success: true })
    const Profile = (await import('../../pages/profile')).default
    render(<Profile />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument()
    })

    const submitBtn = screen.getByRole('button', { name: /salvar alterações/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(apiService.updateUser).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@petflow.com'
      })
    })
  })
})
