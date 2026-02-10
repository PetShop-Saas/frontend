import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService } from '../services/api'
import {
  Card,
  Button,
  Table,
  Input,
  Modal,
  Form,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Empty,
  Row,
  Col,
  Select,
  DatePicker
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  HeartOutlined,
  ExperimentOutlined,
  ToolOutlined,
  ScissorOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MEDICAL_RECORD_TYPE_OPTIONS, getTagOption, TAG_CLASS } from '../constants/tagConfig'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input

interface MedicalRecord {
  id: string
  date: string
  type: string
  title: string
  description?: string
  veterinarian?: string
  notes?: string
  petId: string
  petName: string
  petBreed: string
  customerName: string
  customerEmail: string
  customerPhone: string
  createdAt: string
  updatedAt: string
}

interface Pet {
  id: string
  name: string
  breed: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterPet, setFilterPet] = useState<string | null>(null)
  const router = useRouter()
  const [form] = Form.useForm()
  const [detailsForm] = Form.useForm()

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
      const [recordsData, petsData] = await Promise.all([
        apiService.getMedicalRecords(),
        apiService.getPets()
      ])
      
      // Verificar se é um array direto ou objeto com propriedade
      const recordsArray = Array.isArray(recordsData) ? recordsData : (recordsData as any)?.records || []
      const petsArray = Array.isArray(petsData) ? petsData : (petsData as any)?.pets || []
      
      setRecords(recordsArray)
      setPets(petsArray)
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await apiService.createMedicalRecord(values)
      message.success('Registro médico criado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao criar registro médico')
    }
  }

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsEditing(true)
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date)
    })
    setShowModal(true)
  }

  const handleUpdate = async (values: any) => {
    if (!selectedRecord) return

    try {
      await apiService.updateMedicalRecord(selectedRecord.id, values)
      message.success('Registro médico atualizado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar registro médico')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir este registro médico?',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await apiService.deleteMedicalRecord(id)
          message.success('Registro médico removido com sucesso!')
          loadData()
        } catch (error) {
          message.error('Erro ao remover registro médico')
        }
      },
    })
  }

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record)
    detailsForm.setFieldsValue(record)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedRecord(null)
    form.resetFields()
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !filterType || record.type === filterType
    const matchesPet = !filterPet || record.petId === filterPet
    
    return matchesSearch && matchesType && matchesPet
  })

  const typeOptions = MEDICAL_RECORD_TYPE_OPTIONS
  const getTypeConfig = (type: string) => getTagOption(MEDICAL_RECORD_TYPE_OPTIONS, type)

  const columns = [
    {
      title: 'Pet',
      dataIndex: 'petName',
      key: 'petName',
      render: (text: string, record: MedicalRecord) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<UserOutlined />}
            className="bg-green-100 text-green-600"
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.petBreed}</div>
            <div className="text-xs text-gray-400">{record.customerName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config = getTypeConfig(type)
        return (
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <span className="font-medium text-gray-900">{title}</span>
      ),
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Veterinário',
      dataIndex: 'veterinarian',
      key: 'veterinarian',
      render: (veterinarian: string) => (
        veterinarian ? (
          <span className="text-gray-600">{veterinarian}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="text-green-600 hover:text-green-800"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-green-600 hover:text-green-800"
          />
          <Popconfirm
            title="Tem certeza que deseja remover este registro médico?"
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

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Histórico Médico</h1>
            <p className="text-gray-600">Gerencie os registros médicos dos pets</p>
          </div>
          <div className="flex space-x-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              size="large"
              className="px-6 py-3 hover:bg-gray-50 hover:border-gray-300"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#d1d5db',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              Atualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-3"
              style={{
                backgroundColor: '#16a34a',
                borderColor: '#16a34a'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d'
                e.currentTarget.style.borderColor = '#15803d'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a'
                e.currentTarget.style.borderColor = '#16a34a'
              }}
              size="large"
            >
              Novo Registro
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="Buscar registros médicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined className="text-gray-400" />}
                size="large"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type={filterType === null ? 'primary' : 'default'}
                onClick={() => setFilterType(null)}
                className={filterType === null ? 'bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2' : 'px-6 py-2'}
                style={filterType === null ? {
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a'
                } : {
                  backgroundColor: '#ffffff',
                  borderColor: '#d1d5db',
                  color: '#374151'
                }}
                onMouseEnter={(e) => {
                  if (filterType === null) {
                    e.currentTarget.style.backgroundColor = '#15803d'
                    e.currentTarget.style.borderColor = '#15803d'
                  } else {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterType === null) {
                    e.currentTarget.style.backgroundColor = '#16a34a'
                    e.currentTarget.style.borderColor = '#16a34a'
                  } else {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }
                }}
              >
                Todos
              </Button>
              {typeOptions.map(option => (
                <Button
                  key={option.value}
                  type={filterType === option.value ? 'primary' : 'default'}
                  onClick={() => setFilterType(filterType === option.value ? null : option.value)}
                  className={filterType === option.value ? 'bg-green-600 hover:bg-green-700 border-green-600 px-6 py-2' : 'px-6 py-2'}
                  style={filterType === option.value ? {
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a'
                  } : {
                    backgroundColor: '#ffffff',
                    borderColor: '#d1d5db',
                    color: '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (filterType === option.value) {
                      e.currentTarget.style.backgroundColor = '#15803d'
                      e.currentTarget.style.borderColor = '#15803d'
                    } else {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                      e.currentTarget.style.borderColor = '#9ca3af'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterType === option.value) {
                      e.currentTarget.style.backgroundColor = '#16a34a'
                      e.currentTarget.style.borderColor = '#16a34a'
                    } else {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                      e.currentTarget.style.borderColor = '#d1d5db'
                    }
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Records Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
            }}
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <MedicineBoxOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Nenhum registro médico encontrado</h3>
                  <p className="mt-2 text-sm text-gray-500 mb-6">
                    {searchTerm || filterType ? 'Tente ajustar seus filtros.' : 'Comece criando o primeiro registro médico.'}
                  </p>
                  {!searchTerm && !filterType && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setShowModal(true)}
                      size="large"
                      className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-3"
                      style={{
                        backgroundColor: '#16a34a',
                        borderColor: '#16a34a'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#15803d'
                        e.currentTarget.style.borderColor = '#15803d'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#16a34a'
                        e.currentTarget.style.borderColor = '#16a34a'
                      }}
                    >
                      Criar Primeiro Registro
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </Card>

        {/* Modal de Novo/Editar Registro */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <MedicineBoxOutlined className="text-green-600" />
              <span>{isEditing ? 'Editar Registro Médico' : 'Novo Registro Médico'}</span>
            </div>
          }
          open={showModal}
          onCancel={handleModalClose}
          footer={null}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={isEditing ? handleUpdate : handleCreate}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="petId"
                  label="Pet"
                  rules={[{ required: true, message: 'Por favor, selecione um pet!' }]}
                >
                  <Select placeholder="Selecione um pet">
                    {pets.map(pet => (
                      <Option key={pet.id} value={pet.id}>
                        {pet.name} - {pet.customerName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Data"
                  rules={[{ required: true, message: 'Por favor, selecione a data!' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Tipo"
                  rules={[{ required: true, message: 'Por favor, selecione o tipo!' }]}
                >
                  <Select placeholder="Selecione o tipo">
                    {typeOptions.map(type => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="veterinarian"
                  label="Veterinário"
                >
                  <Input placeholder="Nome do veterinário" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="title"
              label="Título"
              rules={[{ required: true, message: 'Por favor, insira o título!' }]}
            >
              <Input placeholder="Ex: Vacina antirrábica" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Descrição"
            >
              <TextArea 
                placeholder="Descrição do procedimento (opcional)"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Observações"
            >
              <TextArea 
                placeholder="Observações adicionais (opcional)"
                rows={3}
              />
            </Form.Item>

            <div className="flex justify-end space-x-2 pt-4">
              <Button onClick={handleModalClose}>
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-2"
                style={{
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#15803d'
                  e.currentTarget.style.borderColor = '#15803d'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#16a34a'
                  e.currentTarget.style.borderColor = '#16a34a'
                }}
              >
                {isEditing ? 'Atualizar' : 'Criar'} Registro
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <MedicineBoxOutlined className="text-green-600" />
              <span>Detalhes do Registro Médico</span>
            </div>
          }
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={700}
        >
          {selectedRecord && (
            <div className="mt-6">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Avatar 
                      size={80} 
                      icon={<MedicineBoxOutlined />}
                      className="bg-green-100 text-green-600 mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedRecord.title}
                    </h3>
                    <p className="text-gray-600">
                      {dayjs(selectedRecord.date).format('DD/MM/YYYY')}
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pet:</span>
                          <span className="font-medium">{selectedRecord.petName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tutor:</span>
                          <span className="font-medium">{selectedRecord.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo:</span>
                          <Tag color={getTypeConfig(selectedRecord.type).color} className={TAG_CLASS}>
                            {getTypeConfig(selectedRecord.type).label}
                          </Tag>
                        </div>
                        {selectedRecord.veterinarian && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Veterinário:</span>
                            <span className="font-medium">{selectedRecord.veterinarian}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedRecord.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                        <p className="text-sm text-gray-600">{selectedRecord.description}</p>
                      </div>
                    )}
                    {selectedRecord.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                        <p className="text-sm text-gray-600">{selectedRecord.notes}</p>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEdit(selectedRecord)
                  }}
                  className="bg-green-600 hover:bg-green-700 hover:border-green-700 border-green-600 px-6 py-2"
                  style={{
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#15803d'
                    e.currentTarget.style.borderColor = '#15803d'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#16a34a'
                    e.currentTarget.style.borderColor = '#16a34a'
                  }}
                >
                  Editar Registro
                </Button>
              </div>
          </div>
        )}
        </Modal>
      </div>
    </div>
  )
}