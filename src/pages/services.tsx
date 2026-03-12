import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiService, extractArrayFromResponse } from '../services/api'
import {
  Button,
  Table,
  Input,
  Modal,
  Form,
  InputNumber,
  Switch,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { ACTIVE_INACTIVE_OPTIONS, getTagOption, TAG_CLASS } from '../constants/tagConfig'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'

const { Search } = Input

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
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
      const servicesData = await apiService.getServices()
      
      setServices(extractArrayFromResponse(servicesData, ['data', 'services']))
    } catch (error) {
      message.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await apiService.createService(values)
      message.success('Serviço criado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao criar serviço')
    }
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setIsEditing(true)
    form.setFieldsValue(service)
    setShowModal(true)
  }

  const handleUpdate = async (values: any) => {
    if (!selectedService) return

    try {
      await apiService.updateService(selectedService.id, values)
      message.success('Serviço atualizado com sucesso!')
      handleModalClose()
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar serviço')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir este serviço?',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await apiService.deleteService(id)
          message.success('Serviço removido com sucesso!')
          loadData()
        } catch (error) {
          message.error('Erro ao remover serviço')
        }
      },
    })
  }

  const handleViewDetails = (service: Service) => {
    setSelectedService(service)
    detailsForm.setFieldsValue(service)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setIsEditing(false)
    setSelectedService(null)
    form.resetFields()
  }

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      await apiService.updateService(id, { isActive: newStatus })
      message.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao atualizar status')
    }
  }

  const filteredServices = services.filter(service => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      (service.name?.toLowerCase().includes(term)) ||
      (service.description?.toLowerCase().includes(term))
    const matchesStatus = !filterStatus ||
      (filterStatus === 'active' && service.isActive) ||
      (filterStatus === 'inactive' && !service.isActive)
    return matchesSearch && matchesStatus
  })

  const statusOptions = ACTIVE_INACTIVE_OPTIONS
  const getStatusConfig = (isActive: boolean) => getTagOption(ACTIVE_INACTIVE_OPTIONS, isActive ? 'active' : 'inactive')

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            icon={<SettingOutlined />}
            style={{ background: 'rgba(4,120,87,0.12)', color: '#047857', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{text}</div>
            {record.description && (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{record.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span style={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>
          R$ {(price ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Duração',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {duration ? `${duration} min` : '—'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => {
        const config = getStatusConfig(isActive)
        return (
          <Tag color={config.color} icon={config.icon} className={TAG_CLASS}>
            {config.label}
          </Tag>
        )
      },
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
            style={{ color: 'var(--primary-color)' }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: 'var(--primary-color)' }}
          />
          <Popconfirm
            title="Tem certeza que deseja remover este serviço?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Serviços"
        subtitle="Gerencie os serviços oferecidos pelo seu petshop"
        breadcrumb={[{ label: 'Serviços' }]}
        actions={
          <>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
              style={{
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
              }}
            >
              Atualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowModal(true)}
              style={{
                height: 36,
                borderRadius: 8,
                background: 'var(--primary-color)',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Novo Serviço
            </Button>
          </>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        {/* Busca e Filtros */}
        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 16,
          padding: '14px 16px',
          background: 'var(--bg-surface)',
          borderRadius: 10,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Search
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
              style={{ borderRadius: 8, height: 36 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              type={filterStatus === null ? 'primary' : 'default'}
              onClick={() => setFilterStatus(null)}
              style={{
                height: 36, borderRadius: 8, fontWeight: 500,
                ...(filterStatus === null
                  ? { background: 'var(--primary-color)', border: 'none' }
                  : { border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }),
              }}
            >
              Todos
            </Button>
            {statusOptions.map(option => (
              <Button
                key={option.value}
                type={filterStatus === option.value ? 'primary' : 'default'}
                onClick={() => setFilterStatus(filterStatus === option.value ? null : option.value)}
                style={{
                  height: 36, borderRadius: 8, fontWeight: 500,
                  ...(filterStatus === option.value
                    ? { background: 'var(--primary-color)', border: 'none' }
                    : { border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }),
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabela de Serviços */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}>
          <Table
            columns={columns}
            dataSource={filteredServices}
            rowKey="id"
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} serviços`,
              style: { padding: '12px 16px' },
            }}
            locale={{
              emptyText: (
                <EmptyState
                  icon={<SettingOutlined style={{ fontSize: 32 }} />}
                  title="Nenhum serviço encontrado"
                  description={searchTerm || filterStatus ? 'Tente ajustar seus filtros.' : 'Comece criando o primeiro serviço.'}
                  actionLabel={!searchTerm && !filterStatus ? 'Criar Primeiro Serviço' : undefined}
                  onAction={!searchTerm && !filterStatus ? () => setShowModal(true) : undefined}
                />
              ),
            }}
          />
        </div>
      </div>

      {/* Modal: Novo / Editar Serviço */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SettingOutlined style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
              {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
            </span>
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
          onFinish={isEditing ? handleUpdate : handleCreate}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Nome do Serviço"
            rules={[{ required: true, message: 'Por favor, insira o nome do serviço!' }]}
          >
            <Input placeholder="Ex: Banho e Tosa" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="description" label="Descrição">
            <Input.TextArea
              placeholder="Descrição do serviço (opcional)"
              rows={3}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Preço (R$)"
                rules={[{ required: true, message: 'Por favor, insira o preço!' }]}
              >
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  style={{ width: '100%', borderRadius: 8 }}
                  formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => value!.replace(/R\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duração (minutos)"
                rules={[{ required: true, message: 'Por favor, insira a duração!' }]}
              >
                <InputNumber placeholder="60" min={1} style={{ width: '100%', borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" defaultChecked />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
            <Button onClick={handleModalClose} style={{ borderRadius: 8 }}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: 'var(--primary-color)', border: 'none', borderRadius: 8, fontWeight: 600 }}
            >
              {isEditing ? 'Atualizar' : 'Criar'} Serviço
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Detalhes do Serviço */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SettingOutlined style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
              Detalhes do Serviço
            </span>
          </div>
        }
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={null}
        width={560}
      >
        {selectedService && (
          <div style={{ marginTop: 16 }}>
            <Row gutter={24}>
              <Col span={10}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <Avatar
                    size={72}
                    icon={<SettingOutlined />}
                    style={{ background: 'rgba(4,120,87,0.12)', color: '#047857', fontSize: 28 }}
                  />
                  <h3 style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--display-family)',
                    textAlign: 'center',
                  }}>
                    {selectedService.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}>
                    {selectedService.description || 'Sem descrição'}
                  </p>
                </div>
              </Col>
              <Col span={14}>
                <h4 style={{
                  margin: '0 0 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Informações
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    {
                      label: 'Preço',
                      value: (
                        <span style={{ fontWeight: 700, color: '#047857' }}>
                          R$ {(selectedService.price ?? 0).toFixed(2)}
                        </span>
                      ),
                    },
                    {
                      label: 'Duração',
                      value: selectedService.duration ? `${selectedService.duration} min` : '—',
                    },
                    {
                      label: 'Status',
                      value: (
                        <Tag color={selectedService.isActive ? 'green' : 'red'} className={TAG_CLASS}>
                          {selectedService.isActive ? 'Ativo' : 'Inativo'}
                        </Tag>
                      ),
                    },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}:</span>
                      <span style={{ fontSize: 13 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <Button onClick={() => setShowDetailsModal(false)} style={{ borderRadius: 8 }}>
                Fechar
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setShowDetailsModal(false)
                  handleEdit(selectedService)
                }}
                style={{ background: 'var(--primary-color)', border: 'none', borderRadius: 8, fontWeight: 600 }}
              >
                Editar Serviço
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}