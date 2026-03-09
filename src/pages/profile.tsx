import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { apiService } from '../services/api'
import { useCep } from '../hooks/useCep'
import { formatPhone, formatCEP } from '../utils/formatting'
import { Form, message } from 'antd'

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  avatar?: string
}

interface TenantContactInfo {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  addressCep?: string
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
}

export default function Profile() {
  const [form] = Form.useForm()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [contactInfo, setContactInfo] = useState<TenantContactInfo>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: ''
  })
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { loading: cepLoading, searchCep } = useCep(form)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const userObj = JSON.parse(userData)
    setUser(userObj)
    setAvatar(userObj.avatar || null)
    setFormData({
      name: userObj.name,
      email: userObj.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    loadContactInfo()
    setLoading(false)
  }, [router]) // eslint-disable-line react-hooks/exhaustive-deps -- executa apenas no mount

  const parseAddressString = (addressStr: string) => {
    if (!addressStr) return {}
    
    const parts = addressStr.split(',').map((p) => p.trim()).filter(Boolean)
    const address: any = {}

    const cepMatch = addressStr.match(/CEP:\s*(\d{5}-?\d{3})|\b(\d{5}-?\d{3})\b/i)
    if (cepMatch) {
      address.cep = cepMatch[1] || cepMatch[2]
    }

    const stateIndex = parts.findIndex((p) => /^[A-Z]{2}$/.test(p))
    if (stateIndex >= 0) {
      address.state = parts[stateIndex]
      parts.splice(stateIndex, 1)
    }

    if (parts.length >= 1) {
      const streetMatch = parts[0].match(/^(.+?)(?:\s*,?\s*(?:nº|n\.|N°|Nº|No)\s*(\d+))?/i)
      if (streetMatch) {
        address.street = streetMatch[1].trim()
        if (streetMatch[2]) address.number = streetMatch[2]
      } else {
        address.street = parts[0]
      }
    }
    if (parts.length >= 2 && !address.number) {
      const numberMatch = parts[1].match(/(?:nº|n\.|N°|Nº|No)\s*(\d+)|^(\d+)$/i)
      if (numberMatch) {
        address.number = numberMatch[1] || numberMatch[2]
      }
    }
    if (parts.length >= 3) address.neighborhood = parts[2]
    if (parts.length >= 4) address.city = parts[3]

    return address
  }

  const loadContactInfo = async () => {
    try {
      const settingsData = await apiService.getPersonalizationSettings() as any
      if (settingsData) {
        const addressStr = settingsData.contactAddress || ''
        const parsedAddress = parseAddressString(addressStr)
        
        const contact = {
          siteName: settingsData.siteName || '',
          siteDescription: settingsData.siteDescription || '',
          contactEmail: settingsData.contactEmail || '',
          contactPhone: settingsData.contactPhone || '',
          addressCep: parsedAddress.cep || '',
          addressStreet: parsedAddress.street || '',
          addressNumber: parsedAddress.number || '',
          addressComplement: parsedAddress.complement || '',
          addressNeighborhood: parsedAddress.neighborhood || '',
          addressCity: parsedAddress.city || '',
          addressState: parsedAddress.state || ''
        }
        
        setContactInfo(contact)
        form.setFieldsValue(contact)
      }
    } catch (error) {
      console.error('Erro ao carregar informações de contato:', error)
    }
  }

  const buildAddressString = (fields: TenantContactInfo): string => {
    const parts = []
    if (fields.addressStreet) parts.push(fields.addressStreet)
    if (fields.addressNumber) parts.push(`Nº ${fields.addressNumber}`)
    if (fields.addressComplement) parts.push(fields.addressComplement)
    if (fields.addressNeighborhood) parts.push(fields.addressNeighborhood)
    if (fields.addressCity) parts.push(fields.addressCity)
    if (fields.addressState) parts.push(fields.addressState)
    if (fields.addressCep) parts.push(`CEP: ${fields.addressCep}`)
    return parts.join(', ')
  }

  const handleSaveContact = async () => {
    try {
      setSavingContact(true)
      const addressFields = form.getFieldsValue()
      const fullAddress = buildAddressString({ ...contactInfo, ...addressFields })
      
      const settingsToSave = {
        ...contactInfo,
        ...addressFields,
        contactAddress: fullAddress
      }
      
      await apiService.updateSettings(settingsToSave)
      setContactInfo({ ...contactInfo, ...addressFields })
      message.success('Informações de contato salvas com sucesso!')
    } catch (error: any) {
      message.error('Erro ao salvar informações de contato')
    } finally {
      setSavingContact(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('A imagem deve ter no máximo 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem válida')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatar(null)
    setAvatarFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Validações
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('As senhas não coincidem')
        setSaving(false)
        return
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        setError('A nova senha deve ter pelo menos 6 caracteres')
        setSaving(false)
        return
      }

      // Atualizar dados do usuário
      const updateData: any = {
        name: formData.name,
        email: formData.email
      }

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      // Upload do avatar se houver
      if (avatarFile) {
        const formDataAvatar = new FormData()
        formDataAvatar.append('avatar', avatarFile)
        const avatarResponse = await apiService.uploadAvatar(user?.id || '', formDataAvatar)
        updateData.avatar = avatarResponse.avatarUrl
      }

      await apiService.updateUser(user?.id || '', updateData)

      // Atualizar dados no localStorage
      const updatedUser = { 
        ...user, 
        name: formData.name, 
        email: formData.email,
        avatar: updateData.avatar || user?.avatar
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser as any)

      setSuccess('Perfil atualizado com sucesso!')
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Informações Pessoais */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informações Pessoais</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Avatar Section - Compacta */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {avatar ? (
                    <Image
                      className="h-16 w-16 rounded-full object-cover"
                      src={avatar}
                      alt="Avatar"
                      width={64}
                      height={64}
                      unoptimized
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xl font-medium text-green-600">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Foto do perfil
                    </label>
                    <p className="text-xs text-gray-500">
                      JPG, PNG ou GIF. Máximo 5MB.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Alterar
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    {avatar && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs leading-4 font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 text-sm"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>

          {/* Alterar Senha */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Alterar Senha</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                Deixe em branco se não quiser alterar a senha
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Senha atual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Conta */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informações da Conta</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Função</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID do Tenant</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{user?.tenantId}</p>
              </div>
            </div>
          </div>

          {/* Informações de Contato do Tenant */}
          <div className="bg-white rounded-lg shadow-sm lg:col-span-2">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Informações de Contato</h2>
              <button
                type="button"
                onClick={handleSaveContact}
                disabled={savingContact}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 text-sm"
              >
                {savingContact ? 'Salvando...' : 'Salvar Contato'}
              </button>
            </div>
            <div className="p-4">
              <Form form={form} layout="vertical">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Estabelecimento</label>
                    <input
                      type="text"
                      value={contactInfo.siteName}
                      onChange={(e) => setContactInfo({...contactInfo, siteName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Nome do seu petshop"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
                    <input
                      type="email"
                      value={contactInfo.contactEmail}
                      onChange={(e) => setContactInfo({...contactInfo, contactEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="contato@petshop.com"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={contactInfo.siteDescription}
                    onChange={(e) => setContactInfo({...contactInfo, siteDescription: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Descrição do seu petshop"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone de Contato</label>
                  <input
                    type="text"
                    value={contactInfo.contactPhone}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '')
                      const formatted = formatPhone(raw.slice(0, 11))
                      setContactInfo({...contactInfo, contactPhone: formatted})
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Form.Item name="addressCep" label="CEP">
                        <input
                          placeholder="00000-000"
                          maxLength={9}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            const formatted = formatCEP(value)
                            form.setFieldsValue({ addressCep: formatted })
                            if (value.length === 8) {
                              searchCep(value)
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </Form.Item>
                    </div>
                    <div className="md:col-span-2">
                      <Form.Item name="addressStreet" label="Logradouro">
                        <input
                          placeholder="Rua, Avenida, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <Form.Item name="addressNumber" label="Número">
                        <input
                          placeholder="Número"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <Form.Item name="addressNeighborhood" label="Bairro">
                        <input
                          placeholder="Bairro"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <Form.Item name="addressComplement" label="Complemento">
                        <input
                          placeholder="Apto/Bloco (opcional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <Form.Item name="addressCity" label="Cidade">
                        <input
                          placeholder="Cidade"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <Form.Item name="addressState" label="Estado (UF)">
                        <input
                          placeholder="SP"
                          maxLength={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
