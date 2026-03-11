import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag, Space, Tabs, Statistic, Row, Col, InputNumber, Descriptions } from 'antd'
import { PlusOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, CalendarOutlined } from '@ant-design/icons'
import { apiService, extractArrayFromResponse } from '../services/api'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

export default function Hotel() {
  const [rooms, setRooms] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [pets, setPets] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [showDailyReportModal, setShowDailyReportModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [dailyReports, setDailyReports] = useState<any[]>([])
  const [serviceUsage, setServiceUsage] = useState<any[]>([])
  const [roomForm] = Form.useForm()
  const [bookingForm] = Form.useForm()
  const [checkOutForm] = Form.useForm()
  const [reportForm] = Form.useForm()
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
      const [roomsResult, bookingsResult, customersResult, petsResult, statsResult] = await Promise.allSettled([
        apiService.getHotelRooms(),
        apiService.getHotelBookings(),
        apiService.getCustomers(),
        apiService.getPets(),
        apiService.getHotelStats()
      ])

      if (roomsResult.status === 'fulfilled') setRooms(extractArrayFromResponse(roomsResult.value))
      else message.warning('Erro ao carregar quartos')

      if (bookingsResult.status === 'fulfilled') setBookings(extractArrayFromResponse(bookingsResult.value))
      else message.warning('Erro ao carregar reservas')

      if (customersResult.status === 'fulfilled') setCustomers(extractArrayFromResponse(customersResult.value, ['data', 'customers', 'items']))
      else message.warning('Erro ao carregar clientes')

      if (petsResult.status === 'fulfilled') setPets(extractArrayFromResponse(petsResult.value, ['data', 'pets', 'items']))
      else message.warning('Erro ao carregar pets')

      if (statsResult.status === 'fulfilled') setStats(statsResult.value as any)
    } catch (error) {
      message.error('Erro ao carregar dados do hotel')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (values: any) => {
    try {
      const amenities = values.amenities ? values.amenities.split(',').map((a: string) => a.trim()) : []
      await apiService.createHotelRoom({
        ...values,
        amenities: JSON.stringify(amenities)
      })
      message.success('Quarto criado com sucesso!')
      setShowRoomModal(false)
      roomForm.resetFields()
      loadData()
    } catch (error) {
      message.error('Erro ao criar quarto')
    }
  }

  const handleCreateBooking = async (values: any) => {
    try {
      const checkInDate = values.dates[0].format('YYYY-MM-DD')
      const checkOutDate = values.dates[1].format('YYYY-MM-DD')
      
      await apiService.createHotelBooking({
        customerId: values.customerId,
        petId: values.petId,
        roomId: values.roomId,
        checkInDate,
        checkOutDate,
        dailyRate: values.dailyRate,
        discount: values.discount || 0,
        notes: values.notes,
        specialCare: values.specialCare,
        emergencyContact: values.emergencyContact
      })
      message.success('Reserva criada com sucesso!')
      setShowBookingModal(false)
      bookingForm.resetFields()
      loadData()
    } catch (error) {
      message.error('Erro ao criar reserva')
    }
  }

  const handleCheckIn = async (booking: any) => {
    try {
      await apiService.checkInHotel(booking.id)
      message.success('Check-in realizado com sucesso!')
      loadData()
    } catch (error) {
      message.error('Erro ao fazer check-in')
    }
  }

  const handleCheckOut = async (values: any) => {
    if (!selectedBooking) return
    
    try {
      await apiService.checkOutHotel(selectedBooking.id, {
        isPaid: values.isPaid,
        paymentStatus: values.isPaid ? 'PAID' : 'PENDING',
        paidAmount: values.paidAmount,
        paymentMethod: values.paymentMethod
      })
      message.success('Check-out realizado com sucesso!')
      setShowCheckOutModal(false)
      checkOutForm.resetFields()
      setSelectedBooking(null)
      loadData()
    } catch (error) {
      message.error('Erro ao fazer check-out')
    }
  }

  const openCheckOut = (booking: any) => {
    setSelectedBooking(booking)
    checkOutForm.setFieldsValue({
      finalAmount: booking.finalAmount,
      isPaid: false,
      paidAmount: booking.finalAmount
    })
    setShowCheckOutModal(true)
  }

  const viewDetails = async (booking: any) => {
    try {
      setSelectedBooking(booking)
      const [reports, services] = await Promise.all([
        apiService.getHotelDailyReports(booking.id),
        apiService.getHotelServiceUsage(booking.id)
      ])
      setDailyReports(extractArrayFromResponse(reports))
      setServiceUsage(extractArrayFromResponse(services))
      setShowDailyReportModal(true)
    } catch (error) {
      message.error('Erro ao carregar detalhes')
    }
  }

  const handleAddDailyReport = async (values: any) => {
    if (!selectedBooking) return

    try {
      await apiService.createHotelDailyReport({
        ...values,
        bookingId: selectedBooking.id,
        date: new Date()
      })
      message.success('Relatório diário adicionado!')
      reportForm.resetFields()
      const reports = await apiService.getHotelDailyReports(selectedBooking.id)
      setDailyReports(extractArrayFromResponse(reports))
    } catch (error) {
      message.error('Erro ao adicionar relatório')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      RESERVED: 'blue',
      CHECKED_IN: 'green',
      CHECKED_OUT: 'default',
      CANCELLED: 'red'
    }
    return colors[status] || 'default'
  }

  const getRoomTypeColor = (type: string) => {
    const colors: any = {
      STANDARD: 'blue',
      DELUXE: 'purple',
      SUITE: 'gold'
    }
    return colors[type] || 'default'
  }

  const roomColumns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={getRoomTypeColor(type)}>{type}</Tag>
    },
    {
      title: 'Tamanho',
      dataIndex: 'size',
      key: 'size'
    },
    {
      title: 'Capacidade',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (cap: number) => `${cap} pet(s)`
    },
    {
      title: 'Diária',
      dataIndex: 'dailyRate',
      key: 'dailyRate',
      render: (rate: number) => `R$ ${rate.toFixed(2)}`
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: any) => (
        <Tag color={record.isOccupied ? 'red' : 'green'}>
          {record.isOccupied ? 'Ocupado' : 'Disponível'}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button type="link" onClick={() => {
            roomForm.setFieldsValue(record)
            setShowRoomModal(true)
          }}>Editar</Button>
        </Space>
      )
    }
  ]

  const bookingColumns = [
    {
      title: 'Pet',
      dataIndex: ['pet', 'name'],
      key: 'pet'
    },
    {
      title: 'Cliente',
      dataIndex: ['customer', 'name'],
      key: 'customer'
    },
    {
      title: 'Quarto',
      dataIndex: ['room', 'name'],
      key: 'room'
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      title: 'Dias',
      dataIndex: 'totalDays',
      key: 'totalDays'
    },
    {
      title: 'Valor',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount: number) => `R$ ${amount.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Pagamento',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        <Tag color={status === 'PAID' ? 'green' : status === 'PARTIAL' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: any) => (
        <Space>
          {record.status === 'RESERVED' && (
            <Button 
              type="link" 
              icon={<LoginOutlined />}
              onClick={() => handleCheckIn(record)}
            >
              Check-in
            </Button>
          )}
          {record.status === 'CHECKED_IN' && (
            <>
              <Button 
                type="link"
                onClick={() => viewDetails(record)}
              >
                Detalhes
              </Button>
              <Button 
                type="link" 
                icon={<LogoutOutlined />}
                onClick={() => openCheckOut(record)}
              >
                Check-out
              </Button>
            </>
          )}
          {record.status === 'CHECKED_OUT' && (
            <Button 
              type="link"
              onClick={() => viewDetails(record)}
            >
              Ver Detalhes
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hotel para Pets</h1>
          <Space>
            <Button 
              icon={<HomeOutlined />}
              onClick={() => setShowRoomModal(true)}
            >
              Novo Quarto
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowBookingModal(true)}
            >
              Nova Reserva
            </Button>
          </Space>
        </div>

        {stats && (
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Total de Quartos" 
                  value={stats.totalRooms}
                  prefix={<HomeOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Quartos Ocupados" 
                  value={stats.occupiedRooms}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Quartos Disponíveis" 
                  value={stats.availableRooms}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Taxa de Ocupação" 
                  value={stats.occupancyRate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: stats.occupancyRate > 70 ? '#3f8600' : '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Tabs defaultActiveKey="bookings">
          <TabPane tab="Hospedagens" key="bookings">
            <Card>
              <Table
                dataSource={bookings}
                columns={bookingColumns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="Quartos" key="rooms">
            <Card>
              <Table
                dataSource={rooms}
                columns={roomColumns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
        </Tabs>

        {/* Modal Criar/Editar Quarto */}
        <Modal
          title="Cadastrar Quarto"
          open={showRoomModal}
          onCancel={() => {
            setShowRoomModal(false)
            roomForm.resetFields()
          }}
          footer={null}
          width={700}
        >
          <Form form={roomForm} layout="vertical" onFinish={handleCreateRoom}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="name" 
                  label="Nome do Quarto"
                  rules={[{ required: true, message: 'Digite o nome' }]}
                >
                  <Input placeholder="Ex: Suíte Premium 1" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="type" 
                  label="Tipo"
                  rules={[{ required: true, message: 'Selecione o tipo' }]}
                >
                  <Select placeholder="Selecione">
                    <Option value="STANDARD">Standard</Option>
                    <Option value="DELUXE">Deluxe</Option>
                    <Option value="SUITE">Suíte</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="size" 
                  label="Tamanho"
                  rules={[{ required: true, message: 'Selecione o tamanho' }]}
                >
                  <Select placeholder="Selecione">
                    <Option value="SMALL">Pequeno (até 10kg)</Option>
                    <Option value="MEDIUM">Médio (10-25kg)</Option>
                    <Option value="LARGE">Grande (acima de 25kg)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item 
                  name="capacity" 
                  label="Capacidade"
                  rules={[{ required: true, message: 'Digite a capacidade' }]}
                  initialValue={1}
                >
                  <InputNumber min={1} max={5} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item 
                  name="dailyRate" 
                  label="Diária (R$)"
                  rules={[{ required: true, message: 'Digite o valor' }]}
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="amenities" label="Comodidades (separadas por vírgula)">
              <Input placeholder="Ex: Ar condicionado, Câmera, Brinquedos, Cama especial" />
            </Form.Item>

            <Form.Item name="description" label="Descrição">
              <TextArea rows={3} placeholder="Descrição do quarto..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">Salvar</Button>
                <Button onClick={() => setShowRoomModal(false)}>Cancelar</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal Nova Reserva */}
        <Modal
          title="Nova Reserva"
          open={showBookingModal}
          onCancel={() => {
            setShowBookingModal(false)
            bookingForm.resetFields()
          }}
          footer={null}
          width={800}
        >
          <Form form={bookingForm} layout="vertical" onFinish={handleCreateBooking}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="customerId" 
                  label="Cliente"
                  rules={[{ required: true, message: 'Selecione o cliente' }]}
                >
                  <Select 
                    placeholder="Selecione o cliente"
                    showSearch
                    filterOption={(input, option) =>
                      ((option?.children as any) || '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {customers.map(c => (
                      <Option key={c.id} value={c.id}>{c.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="petId" 
                  label="Pet"
                  rules={[{ required: true, message: 'Selecione o pet' }]}
                >
                  <Select 
                    placeholder="Selecione o pet"
                    showSearch
                    filterOption={(input, option) =>
                      ((option?.children as any) || '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {pets.map(p => (
                      <Option key={p.id} value={p.id}>{p.name} ({p.species})</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="roomId" 
                  label="Quarto"
                  rules={[{ required: true, message: 'Selecione o quarto' }]}
                >
                  <Select placeholder="Selecione o quarto">
                    {rooms.filter(r => !r.isOccupied && r.isActive).map(r => (
                      <Option key={r.id} value={r.id}>
                        {r.name} - {r.type} - R$ {r.dailyRate}/dia
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="dates" 
                  label="Período"
                  rules={[{ required: true, message: 'Selecione as datas' }]}
                >
                  <RangePicker 
                    format="DD/MM/YYYY" 
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="dailyRate" 
                  label="Valor da Diária (R$)"
                  rules={[{ required: true, message: 'Digite o valor' }]}
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="discount" label="Desconto (R$)" initialValue={0}>
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="specialCare" label="Cuidados Especiais">
              <TextArea rows={2} placeholder="Ex: Diabético, precisa de medicação às 8h..." />
            </Form.Item>

            <Form.Item name="emergencyContact" label="Contato de Emergência">
              <Input placeholder="Telefone para emergências" />
            </Form.Item>

            <Form.Item name="notes" label="Observações">
              <TextArea rows={2} placeholder="Observações gerais..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">Criar Reserva</Button>
                <Button onClick={() => setShowBookingModal(false)}>Cancelar</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal Check-out */}
        <Modal
          title="Realizar Check-out"
          open={showCheckOutModal}
          onCancel={() => {
            setShowCheckOutModal(false)
            setSelectedBooking(null)
          }}
          footer={null}
          width={600}
        >
          {selectedBooking && (
            <>
              <Descriptions bordered size="small" className="mb-4">
                <Descriptions.Item label="Pet" span={3}>
                  {selectedBooking.pet?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Cliente" span={3}>
                  {selectedBooking.customer?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Quarto" span={3}>
                  {selectedBooking.room?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Total de Dias">
                  {selectedBooking.totalDays}
                </Descriptions.Item>
                <Descriptions.Item label="Valor Base">
                  R$ {selectedBooking.totalAmount?.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Desconto">
                  R$ {selectedBooking.discount?.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Valor Final" span={3}>
                  <strong>R$ {selectedBooking.finalAmount?.toFixed(2)}</strong>
                </Descriptions.Item>
              </Descriptions>

              <Form form={checkOutForm} layout="vertical" onFinish={handleCheckOut}>
                <Form.Item name="finalAmount" label="Valor Total">
                  <InputNumber disabled style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item 
                  name="isPaid" 
                  label="Pagamento Realizado?"
                  rules={[{ required: true }]}
                  initialValue={false}
                >
                  <Select>
                    <Option value={true}>Sim, pago</Option>
                    <Option value={false}>Não, pendente</Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="paidAmount" 
                  label="Valor Pago"
                  rules={[{ required: true, message: 'Digite o valor pago' }]}
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="R$" />
                </Form.Item>

                <Form.Item name="paymentMethod" label="Método de Pagamento">
                  <Select placeholder="Selecione">
                    <Option value="CASH">Dinheiro</Option>
                    <Option value="CREDIT_CARD">Cartão de Crédito</Option>
                    <Option value="DEBIT_CARD">Cartão de Débito</Option>
                    <Option value="PIX">PIX</Option>
                    <Option value="TRANSFER">Transferência</Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Finalizar Check-out
                    </Button>
                    <Button onClick={() => setShowCheckOutModal(false)}>
                      Cancelar
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </>
          )}
        </Modal>

        {/* Modal Detalhes da Hospedagem */}
        <Modal
          title="Detalhes da Hospedagem"
          open={showDailyReportModal}
          onCancel={() => {
            setShowDailyReportModal(false)
            setSelectedBooking(null)
          }}
          footer={null}
          width={900}
        >
          {selectedBooking && (
            <Tabs>
              <TabPane tab="Informações" key="info">
                <Descriptions bordered>
                  <Descriptions.Item label="Pet" span={2}>
                    {selectedBooking.pet?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cliente">
                    {selectedBooking.customer?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quarto" span={3}>
                    {selectedBooking.room?.name} - {selectedBooking.room?.type}
                  </Descriptions.Item>
                  <Descriptions.Item label="Check-in Previsto">
                    {new Date(selectedBooking.checkInDate).toLocaleString('pt-BR')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Check-out Previsto">
                    {new Date(selectedBooking.checkOutDate).toLocaleString('pt-BR')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total de Dias">
                    {selectedBooking.totalDays}
                  </Descriptions.Item>
                  {selectedBooking.actualCheckIn && (
                    <Descriptions.Item label="Check-in Real">
                      {new Date(selectedBooking.actualCheckIn).toLocaleString('pt-BR')}
                    </Descriptions.Item>
                  )}
                  {selectedBooking.actualCheckOut && (
                    <Descriptions.Item label="Check-out Real">
                      {new Date(selectedBooking.actualCheckOut).toLocaleString('pt-BR')}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Cuidados Especiais" span={3}>
                    {selectedBooking.specialCare || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contato Emergência" span={3}>
                    {selectedBooking.emergencyContact || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              <TabPane tab="Relatórios Diários" key="reports">
                {selectedBooking.status === 'CHECKED_IN' && (
                  <Form form={reportForm} layout="vertical" onFinish={handleAddDailyReport} className="mb-4">
                    <Card size="small" title="Adicionar Relatório de Hoje">
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="behavior" label="Comportamento">
                            <Select placeholder="Selecione">
                              <Option value="CALM">Calmo</Option>
                              <Option value="PLAYFUL">Brincalhão</Option>
                              <Option value="AGITATED">Agitado</Option>
                              <Option value="AGGRESSIVE">Agressivo</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="healthStatus" label="Saúde">
                            <Select placeholder="Selecione">
                              <Option value="NORMAL">Normal</Option>
                              <Option value="SICK">Doente</Option>
                              <Option value="INJURED">Ferido</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="appetite" label="Apetite">
                            <Select placeholder="Selecione">
                              <Option value="NORMAL">Normal</Option>
                              <Option value="INCREASED">Aumentado</Option>
                              <Option value="REDUCED">Reduzido</Option>
                              <Option value="NONE">Nenhum</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="walksCount" label="Passeios" initialValue={0}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="bathroomBreaks" label="Necessidades" initialValue={0}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="foodConsumed" label="Alimentou?" valuePropName="checked" initialValue={true}>
                            <Select>
                              <Option value={true}>Sim</Option>
                              <Option value={false}>Não</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="notes" label="Observações">
                        <TextArea rows={2} placeholder="Observações do dia..." />
                      </Form.Item>
                      <Button type="primary" htmlType="submit">Adicionar Relatório</Button>
                    </Card>
                  </Form>
                )}

                <div className="mt-4">
                  <h3 className="mb-2">Histórico de Relatórios</h3>
                  {dailyReports.map(report => (
                    <Card key={report.id} size="small" className="mb-2">
                      <div className="flex justify-between">
                        <div>
                          <strong>{new Date(report.date).toLocaleDateString('pt-BR')}</strong>
                          <div className="text-sm mt-1">
                            <Tag color="blue">{report.behavior}</Tag>
                            <Tag color="green">{report.healthStatus}</Tag>
                            <Tag>{report.appetite}</Tag>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Passeios: {report.walksCount} | Necessidades: {report.bathroomBreaks}
                          </div>
                          {report.notes && (
                            <div className="text-sm mt-1">{report.notes}</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabPane>

              <TabPane tab="Serviços Extras" key="services">
                <Table
                  dataSource={serviceUsage}
                  columns={[
                    {
                      title: 'Data',
                      dataIndex: 'date',
                      key: 'date',
                      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
                    },
                    {
                      title: 'Serviço',
                      dataIndex: 'serviceName',
                      key: 'serviceName'
                    },
                    {
                      title: 'Tipo',
                      dataIndex: 'serviceType',
                      key: 'serviceType'
                    },
                    {
                      title: 'Quantidade',
                      dataIndex: 'quantity',
                      key: 'quantity'
                    },
                    {
                      title: 'Valor',
                      dataIndex: 'totalPrice',
                      key: 'totalPrice',
                      render: (price: number) => `R$ ${price.toFixed(2)}`
                    }
                  ]}
                  rowKey="id"
                  pagination={false}
                  summary={(data) => {
                    const total = data.reduce((sum, item) => sum + item.totalPrice, 0)
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}>
                          <strong>Total de Serviços Extras</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>R$ {total.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )
                  }}
                />
              </TabPane>
            </Tabs>
          )}
        </Modal>
      </div>
    </div>
  )
}

