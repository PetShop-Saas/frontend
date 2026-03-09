import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Modal, Form, Input, message, Select, Button, Table, Tag, Avatar, Space, Popconfirm, InputNumber, Upload, Card, Divider, Row, Col } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { apiService, extractArrayFromResponse } from '../services/api'
import { 
  PlusOutlined, 
  HeartOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  CameraOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'

const { Option } = Select
const { TextArea } = Input

interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  age?: number
  weight?: number
  color?: string
  notes?: string
  customerId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  createdAt: string
  updatedAt: string
  photo?: string
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecies, setFilterSpecies] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()
  const [detailsForm] = Form.useForm()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [petsData, customersData] = await Promise.all([
        apiService.getPets(),
        apiService.getCustomers()
      ])
      
      const processedPets = extractArrayFromResponse<Record<string, unknown>>(petsData, ['data', 'pets'])
      const processedCustomers = extractArrayFromResponse<{ id: string; name: string; email?: string; phone?: string }>(customersData, ['data', 'customers'])
      
      // Mapear pets para incluir informações do cliente
      const petsWithCustomerInfo = processedPets.map((pet: any) => ({
        ...pet,
        customerName: pet.customer?.name || 'Cliente não encontrado',
        customerEmail: pet.customer?.email,
        customerPhone: pet.customer?.phone,
      }))
      
      setPets(petsWithCustomerInfo as Pet[])
      setCustomers(processedCustomers as Customer[])
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (isEditing && selectedPet) {
        await apiService.updatePet(selectedPet.id, values)
        message.success('Pet atualizado com sucesso!')
      } else {
        await apiService.createPet(values)
        message.success('Pet criado com sucesso!')
      }
      
      setShowModal(false)
      setIsEditing(false)
      setSelectedPet(null)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error('Erro ao salvar pet')
    }
  }

  const handleEdit = (pet: Pet) => {
    setSelectedPet(pet)
    setIsEditing(true)
    form.setFieldsValue({
      ...pet,
      customerId: pet.customerId
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await apiService.deletePet(id)
      message.success('Pet excluído com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao excluir pet')
    }
  }

  const handleViewDetails = (pet: Pet) => {
    setSelectedPet(pet)
    detailsForm.setFieldsValue(pet)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedPet(null)
    form.resetFields()
  }

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecies = !filterSpecies || pet.species === filterSpecies
    const matchesCustomer = !filterCustomer || pet.customerId === filterCustomer
    
    return matchesSearch && matchesSpecies && matchesCustomer
  })

  const speciesOptions = ['Cachorro', 'Gato', 'Pássaro', 'Peixe', 'Hamster', 'Coelho', 'Tartaruga', 'Outros']

  const columns: ColumnsType<Pet> = [
    {
      title: 'Pet',
      key: 'pet',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<HeartOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">{record.species}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Dono',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          {record.customerEmail && (
            <div className="text-sm text-gray-500">{record.customerEmail}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Raça',
      dataIndex: 'breed',
      key: 'breed',
      render: (text) => text || '-',
    },
    {
      title: 'Idade',
      dataIndex: 'age',
      key: 'age',
      render: (age) => age ? `${age} anos` : '-',
    },
    {
      title: 'Peso',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => weight ? `${weight} kg` : '-',
    },
    {
      title: 'Cor',
      dataIndex: 'color',
      key: 'color',
      render: (color) => color ? (
        <Tag color="blue">{color}</Tag>
      ) : '-',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="text-blue-600 hover:text-blue-800"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-green-600 hover:text-green-800"
          />
          <Popconfirm
            title="Tem certeza que deseja excluir este pet?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800"
            />
          </Popconfirm>
        </Space>
      ),
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

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pets</h1>
            <p className="text-gray-600">Gerencie os pets dos seus clientes</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 border-green-600"
            size="large"
          >
            Novo Pet
          </Button>
        </div>


        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome do pet, raça ou dono..."
                prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                />
            </div>
            <div className="flex gap-2">
              <Select
                placeholder="Espécie"
                value={filterSpecies}
                onChange={setFilterSpecies}
                allowClear
                size="large"
                style={{ minWidth: 120 }}
              >
                {speciesOptions.map(species => (
                  <Option key={species} value={species}>{species}</Option>
                ))}
              </Select>
              <Select
                placeholder="Cliente"
                value={filterCustomer}
                onChange={setFilterCustomer}
                allowClear
                size="large"
                style={{ minWidth: 150 }}
              >
                {customers.map(customer => (
                  <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                ))}
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
                size="large"
              >
                Atualizar
              </Button>
            </div>
          </div>
        </Card>

        {/* Pets Table */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Lista de Pets ({filteredPets.length})
              </h3>
                  </div>
                </div>
          <Table
            columns={columns}
            dataSource={filteredPets}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} pets`,
              position: ['bottomRight']
            }}
            scroll={{ x: 1200 }}
            className="custom-table"
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <HeartOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhum pet encontrado</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-6">
                    {searchTerm || filterSpecies || filterCustomer ? 'Tente ajustar seus filtros.' : 'Comece adicionando o primeiro pet.'}
                  </p>
                  {!searchTerm && !filterSpecies && !filterCustomer && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setShowModal(true)}
                      size="large"
                      className="bg-green-600 hover:bg-green-700 border-green-600"
                    >
                      Adicionar Primeiro Pet
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </Card>

        {/* Modal de Novo/Editar Pet */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <HeartOutlined className="text-green-600" />
              <span>{isEditing ? 'Editar Pet' : 'Novo Pet'}</span>
                </div>
          }
          open={showModal}
          onCancel={handleModalClose}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-6"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Nome do Pet"
                  rules={[{ required: true, message: 'Nome é obrigatório' }]}
                >
                  <Input placeholder="Ex: Rex" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="species"
                  label="Espécie"
                  rules={[{ required: true, message: 'Espécie é obrigatória' }]}
                >
                  <Select placeholder="Selecione a espécie">
                    {speciesOptions.map(species => (
                      <Option key={species} value={species}>{species}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="breed"
                  label="Raça"
                >
                  <Input placeholder="Ex: Golden Retriever" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="customerId"
                  label="Dono"
                  rules={[{ required: true, message: 'Dono é obrigatório' }]}
                >
                  <Select placeholder="Selecione o dono">
                    {customers.map(customer => (
                      <Option key={customer.id} value={customer.id}>
                        {customer.name} {customer.email && `(${customer.email})`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="age"
                  label="Idade (anos)"
                >
                  <InputNumber
                    min={0}
                    max={30}
                    placeholder="Ex: 3"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="weight"
                  label="Peso (kg)"
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    placeholder="Ex: 25.5"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="color"
                  label="Cor"
                >
                  <Input placeholder="Ex: Dourado" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="Observações"
            >
              <TextArea
                rows={3}
                placeholder="Informações adicionais sobre o pet..."
              />
            </Form.Item>

            <div className="flex justify-end space-x-2 pt-4">
              <Button onClick={handleModalClose}>
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-green-600 hover:bg-green-700 border-green-600"
              >
                {isEditing ? 'Atualizar' : 'Criar'} Pet
              </Button>
              </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <HeartOutlined className="text-green-600" />
              <span>Detalhes do Pet</span>
            </div>
          }
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={600}
        >
          {selectedPet && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<HeartOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">{selectedPet.name}</h3>
                    <p className="text-gray-600">{selectedPet.species}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Dono:</span>
                      <p className="text-gray-900">{selectedPet.customerName}</p>
                    </div>
                    {selectedPet.customerEmail && (
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-900">{selectedPet.customerEmail}</p>
                      </div>
                    )}
                    {selectedPet.customerPhone && (
                      <div>
                        <span className="font-medium text-gray-700">Telefone:</span>
                        <p className="text-gray-900">{selectedPet.customerPhone}</p>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedPet.age || '-'}</div>
                    <div className="text-sm text-gray-600">Anos</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedPet.weight || '-'}</div>
                    <div className="text-sm text-gray-600">Kg</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedPet.breed || '-'}</div>
                    <div className="text-sm text-gray-600">Raça</div>
                  </div>
                </Col>
              </Row>

              {selectedPet.color && (
                <>
                  <Divider />
                  <div>
                    <span className="font-medium text-gray-700">Cor:</span>
                    <Tag color="blue" className="ml-2">{selectedPet.color}</Tag>
                  </div>
                </>
              )}

              {selectedPet.notes && (
                <>
                  <Divider />
                  <div>
                    <span className="font-medium text-gray-700">Observações:</span>
                    <p className="mt-2 text-gray-900">{selectedPet.notes}</p>
        </div>
                </>
              )}

              <Divider />

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEdit(selectedPet)
                  }}
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Editar Pet
                </Button>
              </div>
          </div>
        )}
        </Modal>
    </div>
  )
}