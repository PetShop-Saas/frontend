import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, message, List, Avatar } from 'antd'
import { PlusOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { apiService } from '../services/api'


const { TextArea } = Input
const { Option } = Select

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showMessagesModal, setShowMessagesModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [form] = Form.useForm()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadTickets()
  }, [router])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const data = await apiService.getTickets()
      setTickets(data as any)
    } catch (error) {
      message.error('Erro ao carregar tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (values: any) => {
    try {
      await apiService.createTicket(values)
      message.success('Ticket criado com sucesso!')
      setShowModal(false)
      form.resetFields()
      loadTickets()
    } catch (error) {
      message.error('Erro ao criar ticket')
    }
  }

  const viewMessages = async (ticket: any) => {
    try {
      setSelectedTicket(ticket)
      const msgs = await apiService.getTicketMessages(ticket.id)
      setMessages(msgs as any)
      setShowMessagesModal(true)
    } catch (error) {
      message.error('Erro ao carregar mensagens')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await apiService.addTicketMessage(selectedTicket.id, {
        content: newMessage,
        isAdmin: false,
        authorId: user.id,
        authorName: user.name
      })
      setNewMessage('')
      const msgs = await apiService.getTicketMessages(selectedTicket.id)
      setMessages(msgs as any)
      message.success('Mensagem enviada!')
    } catch (error) {
      message.error('Erro ao enviar mensagem')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      OPEN: 'blue',
      IN_PROGRESS: 'orange',
      RESOLVED: 'green',
      CLOSED: 'default'
    }
    return colors[status] || 'default'
  }

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      LOW: 'green',
      MEDIUM: 'blue',
      HIGH: 'orange',
      URGENT: 'red'
    }
    return colors[priority] || 'default'
  }

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Prioridade',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => <Tag color={getPriorityColor(priority)}>{priority}</Tag>
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: any) => (
        <Button 
          type="link" 
          icon={<MessageOutlined />}
          onClick={() => viewMessages(record)}
        >
          Ver Mensagens
        </Button>
      )
    }
  ]

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Suporte - Tickets</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowModal(true)}
          >
            Novo Ticket
          </Button>
        </div>

        <Card>
          <Table
            dataSource={tickets}
            columns={columns}
            rowKey="id"
            loading={loading}
          />
        </Card>

        <Modal
          title="Criar Novo Ticket"
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateTicket}>
            <Form.Item 
              name="title" 
              label="Título"
              rules={[{ required: true, message: 'Digite o título' }]}
            >
              <Input placeholder="Descreva brevemente o problema" />
            </Form.Item>

            <Form.Item 
              name="category" 
              label="Categoria"
              rules={[{ required: true, message: 'Selecione a categoria' }]}
            >
              <Select placeholder="Selecione">
                <Option value="BILLING">Cobrança/Pagamento</Option>
                <Option value="TECHNICAL">Problema Técnico</Option>
                <Option value="FEATURE_REQUEST">Sugestão de Funcionalidade</Option>
                <Option value="BUG">Reportar Bug</Option>
                <Option value="OTHER">Outro</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="priority" 
              label="Prioridade"
              rules={[{ required: true, message: 'Selecione a prioridade' }]}
              initialValue="MEDIUM"
            >
              <Select placeholder="Selecione">
                <Option value="LOW">Baixa</Option>
                <Option value="MEDIUM">Média</Option>
                <Option value="HIGH">Alta</Option>
                <Option value="URGENT">Urgente</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="description" 
              label="Descrição"
              rules={[{ required: true, message: 'Descreva o problema' }]}
            >
              <TextArea 
                rows={6} 
                placeholder="Descreva detalhadamente o problema ou solicitação..."
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Criar Ticket
                </Button>
                <Button onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`Ticket: ${selectedTicket?.title}`}
          open={showMessagesModal}
          onCancel={() => setShowMessagesModal(false)}
          footer={null}
          width={700}
        >
          <div className="mb-4">
            <Space>
              <Tag color={getStatusColor(selectedTicket?.status)}>{selectedTicket?.status}</Tag>
              <Tag color={getPriorityColor(selectedTicket?.priority)}>{selectedTicket?.priority}</Tag>
              <Tag>{selectedTicket?.category}</Tag>
            </Space>
            <p className="mt-2 text-gray-600">{selectedTicket?.description}</p>
          </div>

          <div className="border-t pt-4 mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <List
              dataSource={messages}
              renderItem={(msg: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{msg.authorName.charAt(0)}</Avatar>}
                    title={
                      <Space>
                        <span>{msg.authorName}</span>
                        {msg.isAdmin && <Tag color="red">Suporte</Tag>}
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </Space>
                    }
                    description={msg.content}
                  />
                </List.Item>
              )}
            />
          </div>

          {selectedTicket?.status !== 'CLOSED' && (
            <div className="border-t pt-4">
              <TextArea
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
              />
              <Button 
                type="primary" 
                className="mt-2"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                Enviar Mensagem
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}




