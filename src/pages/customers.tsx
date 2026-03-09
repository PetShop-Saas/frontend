import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Modal, Form, Input, message, DatePicker, Select, Button, Steps, InputNumber, Switch, Row, Col, Upload, Avatar, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { apiService, extractArrayFromResponse } from '../services/api'
import { PlusOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, EnvironmentOutlined, SearchOutlined, EditOutlined, CameraOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons'
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'
import { formatCPFCNPJ, formatPhone, formatCEP } from '../utils/formatting'

const { Option } = Select
const { TextArea } = Input

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  photo?: string
  createdAt: string
  pets?: Pet[]
  pendingPayments?: number
  totalSpent?: number
}

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age?: number
  weight?: number
  color?: string
  photo?: string
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [hasPet, setHasPet] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [customerForm] = Form.useForm()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPets, setFilterPets] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadCustomers()
  }, [router])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getCustomers()
      setCustomers(extractArrayFromResponse(response, ['data', 'customers']))
    } catch (error) {
      message.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Obter todos os valores do formulário (incluindo campos de outros passos)
      const allValues = form.getFieldsValue()
      const customerName = allValues.name || values.name
      
      // Validar nome do cliente
      if (!customerName || !customerName.trim() || customerName.trim().length < 2) {
        message.error('Nome deve ter pelo menos 2 caracteres')
        return
      }

      // Preparar endereço completo
      const addressParts = []
      if (allValues.addressStreet) addressParts.push(allValues.addressStreet)
      if (allValues.addressNumber) addressParts.push(`nº ${allValues.addressNumber}`)
      if (allValues.addressComplement) addressParts.push(allValues.addressComplement)
      if (allValues.addressNeighborhood) addressParts.push(allValues.addressNeighborhood)
      if (allValues.addressCity) addressParts.push(allValues.addressCity)
      if (allValues.addressState) addressParts.push(allValues.addressState)
      if (allValues.addressZipCode) addressParts.push(`CEP: ${allValues.addressZipCode}`)
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined

      // Preparar dados do cliente - usar todos os valores do formulário
      const customerData: any = {
        name: customerName.trim(),
      }

      if (allValues.email?.trim()) customerData.email = allValues.email.trim()
      if (allValues.phone?.trim()) customerData.phone = allValues.phone.trim()
      if (fullAddress) customerData.address = fullAddress
      // Remover máscara do documento antes de enviar (apenas números)
      if (allValues.document?.trim()) {
        customerData.document = allValues.document.replace(/\D/g, '')
      }
      if (allValues.birthDate) customerData.birthDate = allValues.birthDate.format('YYYY-MM-DD')
      if (allValues.gender) customerData.gender = allValues.gender
      if (allValues.notes?.trim()) customerData.notes = allValues.notes.trim()

      // Criar cliente
      const newCustomer = await apiService.createCustomer(customerData) as any

      // Se tiver pet, criar o pet vinculado
      if (hasPet && allValues.petName) {
        const petData = {
          name: allValues.petName,
          species: allValues.petSpecies,
          breed: allValues.petBreed,
          age: allValues.petAge,
          weight: allValues.petWeight,
          color: allValues.petColor,
          notes: allValues.petNotes,
          customerId: newCustomer.id,
        }

        await apiService.createPet(petData)
      }

      message.success('Cliente criado com sucesso!')
      setShowModal(false)
      resetForm()
      loadCustomers()
    } catch (error: any) {
      // Tratamento de erro específico
      if (error?.message) {
        if (Array.isArray(error.message)) {
          message.error(error.message.join(', '))
        } else if (typeof error.message === 'string') {
          message.error(error.message)
        } else {
          message.error('Erro ao criar cliente')
        }
      } else {
        message.error('Erro ao criar cliente. Verifique os campos e tente novamente.')
      }
    }
  }

  const handleCancel = () => {
    setShowModal(false)
    resetForm()
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditing(false)
    setShowDetailsModal(true)
    // Preencher formulário de edição com dados do cliente
    customerForm.setFieldsValue({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    })
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedCustomer(null)
    setIsEditing(false)
    customerForm.resetFields()
  }

  const handleEditCustomer = async (values: any) => {
    if (!selectedCustomer) return

    try {
      await apiService.updateCustomer(selectedCustomer.id, values)
      message.success('Cliente atualizado com sucesso!')
      setIsEditing(false)
      
      // Atualizar o cliente na lista
      const updatedCustomers = customers.map(c => 
        c.id === selectedCustomer.id ? { ...c, ...values } : c
      )
      setCustomers(updatedCustomers)
      
      // Atualizar o cliente selecionado
      setSelectedCustomer({ ...selectedCustomer, ...values })
      
      loadCustomers()
    } catch (error) {
      message.error('Erro ao atualizar cliente')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    customerForm.resetFields()
  }

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('Você só pode fazer upload de arquivos JPG/PNG!')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('A imagem deve ser menor que 2MB!')
    }
    return isJpgOrPng && isLt2M
  }

  const resetForm = () => {
    form.resetFields()
    setCurrentStep(0)
    setHasPet(false)
  }

  const nextStep = async () => {
    try {
      if (currentStep === 0) {
        const values = await form.validateFields(['name', 'document', 'gender', 'email', 'phone'])
        if (!values.name || values.name.trim().length < 2) {
          message.error('Nome deve ter pelo menos 2 caracteres')
          return
        }
        setCurrentStep(1)
      } else {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      message.error('Por favor, preencha todos os campos obrigatórios')
    }
  }

  const prevStep = () => {
    setCurrentStep(0)
  }

  const handleCepSearch = async (e: any) => {
    const cepValue = e.target.value || form.getFieldValue('addressZipCode') || ''
    const cep = cepValue.replace(/\D/g, '')
    
    if (cep.length === 8) {
      setLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          form.setFieldsValue({
            addressStreet: data.logradouro || '',
            addressNeighborhood: data.bairro || '',
            addressCity: data.localidade || '',
            addressState: data.uf || '',
          })
          message.success('CEP encontrado!')
        } else {
          message.error('CEP não encontrado')
        }
      } catch (error) {
        message.error('Erro ao buscar CEP')
      } finally {
        setLoadingCep(false)
      }
    } else if (cep.length > 0) {
      message.warning('CEP deve ter 8 dígitos')
    }
  }

  const filteredCustomers = customers.filter(customer => {
    // Filtro de busca
    const matchesSearch = !searchTerm || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    
    // Filtro de pagamentos pendentes
    const matchesPaymentFilter = filterStatus === 'all' || 
      (filterStatus === 'pending' && (customer.pendingPayments || 0) > 0) ||
      (filterStatus === 'paid' && (customer.pendingPayments || 0) === 0)
    
    // Filtro de pets
    const petCount = customer.pets?.length || 0
    const matchesPetFilter = filterPets === 'all' ||
      (filterPets === 'with' && petCount > 0) ||
      (filterPets === 'without' && petCount === 0)
    
    return matchesSearch && matchesPaymentFilter && matchesPetFilter
  })

  const columns: ColumnsType<Customer> = [
    {
      title: 'Cliente',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-3 py-2">
          <Avatar 
            size={40} 
            src={record.photo || `https://ui-avatars.com/api/?name=${text}&size=40`}
            icon={<UserOutlined />}
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{text}</div>
            {record.email && <div className="text-xs text-gray-500 truncate">{record.email}</div>}
          </div>
        </div>
      ),
      width: 280,
      fixed: 'left' as const,
    },
    {
      title: 'Contato',
      key: 'contact',
      render: (_, record) => (
        <div className="py-2">
          {record.phone && (
            <div className="text-sm text-gray-600 flex items-center">
              <PhoneOutlined className="mr-1 text-gray-400" />
              {record.phone}
            </div>
          )}
        </div>
      ),
      width: 180,
    },
    {
      title: 'Pets',
      dataIndex: 'pets',
      key: 'pets',
      align: 'center' as const,
      render: (pets) => {
        const count = pets?.length || 0
        return (
          <div className="flex justify-center py-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${
              count > 0 
                ? 'bg-blue-50 text-blue-700' 
                : 'bg-gray-50 text-gray-600'
            }`}>
              {count}
            </span>
          </div>
        )
      },
      sorter: (a, b) => (a.pets?.length || 0) - (b.pets?.length || 0),
      width: 100,
    },
    {
      title: 'Pagamentos Pendentes',
      dataIndex: 'pendingPayments',
      key: 'pendingPayments',
      align: 'center' as const,
      render: (count) => {
        const paymentCount = count || 0
        return (
          <div className="flex justify-center py-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${
              paymentCount > 0 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {paymentCount}
            </span>
          </div>
        )
      },
      sorter: (a, b) => (a.pendingPayments || 0) - (b.pendingPayments || 0),
      width: 180,
    },
    {
      title: 'Total Gasto',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      align: 'right' as const,
      render: (amount) => (
        <div className="text-right py-2">
          <span className="font-semibold text-green-600">
            R$ {(amount || 0).toFixed(2)}
          </span>
        </div>
      ),
      sorter: (a, b) => (a.totalSpent || 0) - (b.totalSpent || 0),
      width: 140,
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right' as const,
      render: (_, record) => (
        <div className="flex justify-end gap-2 py-2">
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            title="Ver Detalhes"
            className="text-gray-600 hover:text-gray-900"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedCustomer(record)
              setIsEditing(true)
              setShowDetailsModal(true)
              customerForm.setFieldsValue({
                name: record.name,
                email: record.email,
                phone: record.phone,
                address: record.address,
              })
            }}
            title="Editar Cliente"
            className="text-blue-600 hover:text-blue-700"
          />
        </div>
      ),
      width: 100,
    },
  ]

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

  const steps = [
    {
      title: 'Dados do Cliente',
      content: (
        <div className="space-y-4">
          <Form.Item
            name="name"
            label="Nome Completo"
            rules={[
              { required: true, message: 'Por favor, insira o nome do cliente' },
              { 
                validator: (_, value) => {
                  if (!value || value.trim().length < 2) {
                    return Promise.reject(new Error('Nome deve ter pelo menos 2 caracteres'))
                  }
                  if (!value.trim()) {
                    return Promise.reject(new Error('Nome não pode ser apenas espaços'))
                  }
                  return Promise.resolve()
                }
              }
            ]}
            normalize={(value) => {
              const trimmed = value?.trim() || ''
              if (trimmed !== value) {
                // Força o update do valor
                setTimeout(() => {
                  form.setFieldValue('name', trimmed)
                }, 0)
              }
              return trimmed
            }}
          >
            <Input 
              placeholder="Digite o nome completo" 
              prefix={<UserOutlined />} 
              size="large"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="document"
              label="CPF/CNPJ"
              rules={[
                { required: true, message: 'Por favor, insira o documento' },
                { 
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    const raw = value.replace(/\D/g, '')
                    if (raw.length === 11 || raw.length === 14) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'))
                  }
                }
              ]}
            >
              <Input 
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                prefix={<IdcardOutlined />}
                size="large"
                maxLength={18}
                onChange={(e) => {
                  const formatted = formatCPFCNPJ(e.target.value)
                  if (formatted !== e.target.value) {
                    form.setFieldsValue({ document: formatted })
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="birthDate"
              label="Data de Nascimento"
            >
              <DatePicker 
                className="w-full"
                size="large"
                format="DD/MM/YYYY"
                placeholder="Selecione a data"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="gender"
              label="Gênero"
              rules={[{ required: true, message: 'Selecione o gênero' }]}
            >
              <Select placeholder="Selecione" size="large">
                <Option value="MALE">Masculino</Option>
                <Option value="FEMALE">Feminino</Option>
                <Option value="OTHER">Outro</Option>
                <Option value="PREFER_NOT_TO_SAY">Prefiro não informar</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="email"
              label="E-mail"
              rules={[{ type: 'email', message: 'E-mail inválido' }]}
            >
              <Input 
                placeholder="email@exemplo.com"
                prefix={<MailOutlined />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefone"
              rules={[
                { required: true, message: 'Por favor, insira o telefone' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    const raw = value.replace(/\D/g, '')
                    if (raw.length === 10 || raw.length === 11) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Telefone deve ter 10 ou 11 dígitos'))
                  }
                }
              ]}
            >
              <Input 
                placeholder="(00) 00000-0000"
                prefix={<PhoneOutlined />}
                size="large"
                maxLength={15}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value)
                  if (formatted !== e.target.value) {
                    form.setFieldsValue({ phone: formatted })
                  }
                }}
              />
            </Form.Item>
          </div>

          {/* Endereço com CEP */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-semibold mb-4 text-gray-700">Endereço</h4>
            
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="addressZipCode"
                  label="CEP"
                  rules={[
                    { 
                      pattern: /^\d{5}-?\d{3}$/, 
                      message: 'CEP inválido' 
                    },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve()
                        const raw = value.replace(/\D/g, '')
                        if (raw.length === 8) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('CEP deve ter 8 dígitos'))
                      }
                    }
                  ]}
                >
                  <Input
                    placeholder="00000-000"
                    suffix={<SearchOutlined />}
                    onBlur={handleCepSearch}
                    size="large"
                    disabled={loadingCep}
                    maxLength={9}
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value)
                      if (formatted !== e.target.value) {
                        form.setFieldsValue({ addressZipCode: formatted })
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={16}>
                <Form.Item
                  name="addressStreet"
                  label="Logradouro"
                >
                  <Input 
                    placeholder="Rua, Avenida, etc"
                    prefix={<EnvironmentOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <Form.Item
                  name="addressNumber"
                  label="Número"
                >
                  <Input 
                    placeholder="000"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={10}>
                <Form.Item
                  name="addressComplement"
                  label="Complemento"
                >
                  <Input 
                    placeholder="Apto, Bloco, etc"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="addressNeighborhood"
                  label="Bairro"
                >
                  <Input 
                    placeholder="Bairro"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={16}>
                <Form.Item
                  name="addressCity"
                  label="Cidade"
                >
                  <Input 
                    placeholder="Cidade"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="addressState"
                  label="UF"
                >
                  <Select placeholder="UF" size="large">
                    <Option value="AC">AC</Option>
                    <Option value="AL">AL</Option>
                    <Option value="AP">AP</Option>
                    <Option value="AM">AM</Option>
                    <Option value="BA">BA</Option>
                    <Option value="CE">CE</Option>
                    <Option value="DF">DF</Option>
                    <Option value="ES">ES</Option>
                    <Option value="GO">GO</Option>
                    <Option value="MA">MA</Option>
                    <Option value="MT">MT</Option>
                    <Option value="MS">MS</Option>
                    <Option value="MG">MG</Option>
                    <Option value="PA">PA</Option>
                    <Option value="PB">PB</Option>
                    <Option value="PR">PR</Option>
                    <Option value="PE">PE</Option>
                    <Option value="PI">PI</Option>
                    <Option value="RJ">RJ</Option>
                    <Option value="RN">RN</Option>
                    <Option value="RS">RS</Option>
                    <Option value="RO">RO</Option>
                    <Option value="RR">RR</Option>
                    <Option value="SC">SC</Option>
                    <Option value="SP">SP</Option>
                    <Option value="SE">SE</Option>
                    <Option value="TO">TO</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item
            name="notes"
            label="Observações"
          >
            <TextArea 
              rows={2}
              placeholder="Informações adicionais sobre o cliente"
            />
          </Form.Item>

          <Form.Item
            name="hasPet"
            valuePropName="checked"
          >
            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Switch checked={hasPet} onChange={setHasPet} className="mr-3" />
              <span className="text-gray-700">Cadastrar pet junto com o cliente</span>
            </div>
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Dados do Pet',
      content: (
        <div className="space-y-4">
          <Form.Item
            name="petName"
            label="Nome do Pet"
            rules={hasPet ? [{ required: true, message: 'Por favor, insira o nome do pet' }] : []}
          >
            <Input placeholder="Digite o nome do pet" size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="petSpecies"
              label="Espécie"
              rules={hasPet ? [{ required: true, message: 'Selecione a espécie' }] : []}
            >
              <Select placeholder="Selecione a espécie" size="large">
                <Option value="Cachorro">Cachorro</Option>
                <Option value="Gato">Gato</Option>
                <Option value="Ave">Ave</Option>
                <Option value="Roedor">Roedor</Option>
                <Option value="Outro">Outro</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="petBreed"
              label="Raça"
              rules={hasPet ? [{ required: true, message: 'Por favor, insira a raça' }] : []}
            >
              <Input placeholder="Digite a raça" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="petAge"
              label="Idade (anos)"
            >
              <InputNumber 
                className="w-full"
                placeholder="0"
                min={0}
                max={50}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="petWeight"
              label="Peso (kg)"
            >
              <InputNumber 
                className="w-full"
                placeholder="0.0"
                min={0}
                step={0.1}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="petColor"
              label="Cor"
            >
              <Input placeholder="Digite a cor" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            name="petNotes"
            label="Observações do Pet"
          >
            <TextArea 
              rows={3}
              placeholder="Informações adicionais sobre o pet (temperamento, cuidados especiais, etc.)"
            />
          </Form.Item>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gerencie seus clientes e seus pets</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowModal(true)}
            size="large"
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            Novo Cliente
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<UserOutlined />}
              size="large"
              className="md:col-span-2"
            />
            <Select
              placeholder="Filtrar por pagamentos"
              value={filterStatus}
              onChange={setFilterStatus}
              size="large"
              options={[
                { label: 'Todos', value: 'all' },
                { label: 'Com Pendências', value: 'pending' },
                { label: 'Sem Pendências', value: 'paid' },
              ]}
            />
            <Select
              placeholder="Filtrar por pets"
              value={filterPets}
              onChange={setFilterPets}
              size="large"
              options={[
                { label: 'Todos', value: 'all' },
                { label: 'Com Pets', value: 'with' },
                { label: 'Sem Pets', value: 'without' },
              ]}
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Lista de Clientes ({filteredCustomers.length})
              </h3>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} clientes`,
              position: ['bottomRight']
            }}
            scroll={{ x: 1200 }}
            className="custom-table"
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <UserOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhum cliente encontrado</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-6">
                    {searchTerm ? 'Tente ajustar seus filtros.' : 'Comece adicionando seu primeiro cliente.'}
                  </p>
                  {!searchTerm && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setShowModal(true)}
                      size="large"
                      className="bg-green-600 hover:bg-green-700 border-green-600"
                    >
                      Adicionar Primeiro Cliente
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </div>

        {/* Modal de Novo Cliente */}
        <Modal
          title={
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">Cadastro de Cliente</span>
              <span className="text-sm text-gray-500">Passo {currentStep + 1} de {steps.length}</span>
            </div>
          }
          open={showModal}
          onCancel={handleCancel}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Steps current={currentStep} className="mb-6">
              {steps.map((step, index) => (
                <Steps.Step key={index} title={step.title} />
              ))}
            </Steps>

            <div className="min-h-[400px]">
              {steps[currentStep].content}
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
              {currentStep > 0 && (
                <Button onClick={prevStep} size="large">
                  Voltar
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={nextStep} size="large" className="ml-auto">
                  Próximo
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  className="ml-auto bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Salvar Cliente
                </Button>
              )}
            </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes do Cliente */}
        <Modal
          title="Detalhes do Cliente"
          open={showDetailsModal}
          onCancel={handleCloseDetails}
          footer={
            isEditing ? [
              <Button key="cancel" onClick={handleCancelEdit}>
                Cancelar
              </Button>,
              <Button key="save" type="primary" onClick={() => customerForm.submit()} className="bg-green-600">
                Salvar
              </Button>
            ] : [
              <Button key="close" onClick={handleCloseDetails}>
                Fechar
              </Button>
            ]
          }
          width={800}
        >
          {selectedCustomer && (
            <div className="space-y-6">
              {!isEditing ? (
                /* Modo Visualização */
                <div className="space-y-6">
                  {/* Foto e Informações Pessoais */}
                  <div className="flex items-start space-x-6 pb-6 border-b border-gray-200">
                    <Avatar 
                      size={96} 
                      src={selectedCustomer.photo || `https://ui-avatars.com/api/?name=${selectedCustomer.name}&size=96`}
                      icon={<UserOutlined />}
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Informações Pessoais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <div>
                          <dt className="text-sm text-gray-500 mb-1">Nome Completo</dt>
                          <dd className="text-base text-gray-900 font-medium">{selectedCustomer.name}</dd>
                        </div>
                        {selectedCustomer.email && (
                          <div>
                            <dt className="text-sm text-gray-500 mb-1">E-mail</dt>
                            <dd className="text-base text-gray-900">{selectedCustomer.email}</dd>
                          </div>
                        )}
                        {selectedCustomer.phone && (
                          <div>
                            <dt className="text-sm text-gray-500 mb-1">Telefone</dt>
                            <dd className="text-base text-gray-900">{selectedCustomer.phone}</dd>
                          </div>
                        )}
                        {selectedCustomer.address && (
                          <div className="md:col-span-2">
                            <dt className="text-sm text-gray-500 mb-1">Endereço</dt>
                            <dd className="text-base text-gray-900">{selectedCustomer.address}</dd>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Modo Edição */
                <Form
                  form={customerForm}
                  layout="vertical"
                  onFinish={handleEditCustomer}
                >
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start space-x-6 mb-6">
                      <div className="flex-shrink-0">
                        <Avatar 
                          size={120} 
                          src={selectedCustomer.photo || `https://ui-avatars.com/api/?name=${selectedCustomer.name}&size=120`}
                          icon={<UserOutlined />}
                        />
                        <Upload
                          name="avatar"
                          listType="text"
                          beforeUpload={beforeUpload}
                          showUploadList={false}
                          customRequest={({ file }) => {
                            // Aqui você implementaria o upload real
                            message.info('Upload de foto (implementar integração real)')
                          }}
                        >
                          <Button icon={<CameraOutlined />} className="mt-2" block>
                            Trocar Foto
                          </Button>
                        </Upload>
                      </div>
                      <div className="flex-1">
                        <Form.Item
                          name="name"
                          label="Nome Completo"
                          rules={[{ required: true, message: 'Nome é obrigatório' }]}
                        >
                          <Input size="large" prefix={<UserOutlined />} />
                        </Form.Item>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="email"
                        label="E-mail"
                      >
                        <Input size="large" prefix={<MailOutlined />} />
                      </Form.Item>
                      <Form.Item
                        name="phone"
                        label="Telefone"
                      >
                        <Input size="large" prefix={<PhoneOutlined />} />
                      </Form.Item>
                      <Form.Item
                        name="address"
                        label="Endereço"
                        className="md:col-span-2"
                      >
                        <TextArea rows={2} />
                      </Form.Item>
                    </div>
                  </div>
                </Form>
              )}

              {/* Pets */}
              {selectedCustomer.pets && selectedCustomer.pets.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                    Pets ({selectedCustomer.pets.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedCustomer.pets.map((pet) => (
                      <div key={pet.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <Avatar 
                            size={56} 
                            src={pet.photo || `https://ui-avatars.com/api/?name=${pet.name}&size=56`}
                            icon={<UserOutlined />}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-base">{pet.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {pet.species}{pet.breed && ` - ${pet.breed}`}
                            </p>
                            <div className="flex gap-3 mt-2 text-sm text-gray-500">
                              {pet.age && <span>{pet.age} anos</span>}
                              {pet.weight && <span>{pet.weight} kg</span>}
                              {pet.color && <span>{pet.color}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Resumo</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {selectedCustomer.pets?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Pets cadastrados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">0</div>
                    <div className="text-xs text-gray-500 mt-1">Agendamentos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">0</div>
                    <div className="text-xs text-gray-500 mt-1">Compras realizadas</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
    </div>
  )
}
