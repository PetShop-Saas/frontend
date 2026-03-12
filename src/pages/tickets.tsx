import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  List,
  Avatar,
} from 'antd'
import {
  PlusOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  SendOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { apiService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import { PageSkeleton } from '../components/common/PageSkeleton'

const { TextArea } = Input
const { Option } = Select

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: 'Aberto',      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  IN_PROGRESS: { label: 'Em Andamento', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  RESOLVED:    { label: 'Resolvido',   color: '#047857', bg: 'rgba(4,120,87,0.1)'  },
  CLOSED:      { label: 'Fechado',     color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW:    { label: 'Baixa',   color: '#10b981' },
  MEDIUM: { label: 'Média',   color: '#3b82f6' },
  HIGH:   { label: 'Alta',    color: '#f59e0b' },
  URGENT: { label: 'Urgente', color: '#ef4444' },
}

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const data = await apiService.getTickets()
      setTickets(data as any)
    } catch {
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
    } catch {
      message.error('Erro ao criar ticket')
    }
  }

  const viewMessages = async (ticket: any) => {
    try {
      setSelectedTicket(ticket)
      const msgs = await apiService.getTicketMessages(ticket.id)
      setMessages(msgs as any)
      setShowMessagesModal(true)
    } catch {
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
        authorName: user.name,
      })
      setNewMessage('')
      const msgs = await apiService.getTicketMessages(selectedTicket.id)
      setMessages(msgs as any)
      message.success('Mensagem enviada!')
    } catch {
      message.error('Erro ao enviar mensagem')
    }
  }

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{text}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            color: cfg.color,
            background: cfg.bg,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      title: 'Prioridade',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const cfg = PRIORITY_CONFIG[priority] ?? { label: priority, color: '#6b7280' }
        return <Tag color={cfg.color} style={{ fontWeight: 600, fontSize: 11 }}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat}</span>
      ),
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ClockCircleOutlined style={{ fontSize: 11 }} />
          {new Date(date).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="text"
          icon={<MessageOutlined />}
          onClick={() => viewMessages(record)}
          style={{ color: 'var(--primary-color)', fontWeight: 500, fontSize: 13 }}
        >
          Ver mensagens
        </Button>
      ),
    },
  ]

  if (loading) return <PageSkeleton />

  return (
    <div>
      <PageHeader
        title="Suporte — Tickets"
        subtitle="Acompanhe e gerencie suas solicitações de suporte"
        breadcrumb={[{ label: 'Suporte' }]}
        actions={
          <>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTickets}
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
              Novo Ticket
            </Button>
          </>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}>
          <Table
            dataSource={tickets}
            columns={columns}
            rowKey="id"
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total: number) => `${total} tickets`,
              style: { padding: '12px 16px' },
            }}
            locale={{
              emptyText: (
                <EmptyState
                  icon={<CustomerServiceOutlined style={{ fontSize: 32 }} />}
                  title="Nenhum ticket encontrado"
                  description="Abra um novo ticket para receber suporte"
                  actionLabel="Novo Ticket"
                  onAction={() => setShowModal(true)}
                />
              ),
            }}
          />
        </div>
      </div>

      {/* Modal: Criar Ticket */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CustomerServiceOutlined style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
              Criar Novo Ticket
            </span>
          </div>
        }
        open={showModal}
        onCancel={() => { setShowModal(false); form.resetFields() }}
        footer={null}
        width={580}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTicket} style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: 'Digite o título' }]}
          >
            <Input placeholder="Descreva brevemente o problema" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="category"
            label="Categoria"
            rules={[{ required: true, message: 'Selecione a categoria' }]}
          >
            <Select placeholder="Selecione a categoria" style={{ borderRadius: 8 }}>
              <Option value="BILLING">Cobrança / Pagamento</Option>
              <Option value="TECHNICAL">Problema Técnico</Option>
              <Option value="FEATURE_REQUEST">Sugestão de Funcionalidade</Option>
              <Option value="BUG">Reportar Bug</Option>
              <Option value="OTHER">Outro</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Prioridade"
            initialValue="MEDIUM"
            rules={[{ required: true, message: 'Selecione a prioridade' }]}
          >
            <Select placeholder="Selecione a prioridade" style={{ borderRadius: 8 }}>
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
              rows={5}
              placeholder="Descreva detalhadamente o problema ou solicitação..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{ background: 'var(--primary-color)', border: 'none', borderRadius: 8, fontWeight: 600 }}
              >
                Criar Ticket
              </Button>
              <Button
                onClick={() => { setShowModal(false); form.resetFields() }}
                style={{ borderRadius: 8 }}
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Ver Mensagens */}
      <Modal
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageOutlined style={{ color: 'var(--primary-color)' }} />
              <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700, fontSize: 15 }}>
                {selectedTicket?.title}
              </span>
            </div>
            <Space size={6} wrap>
              {selectedTicket?.status && (() => {
                const s = STATUS_CONFIG[selectedTicket.status]
                return s ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.color,
                    background: s.bg,
                  }}>
                    {s.label}
                  </span>
                ) : null
              })()}
              {selectedTicket?.priority && (
                <Tag
                  color={PRIORITY_CONFIG[selectedTicket.priority]?.color}
                  style={{ fontWeight: 600, fontSize: 11 }}
                >
                  {PRIORITY_CONFIG[selectedTicket.priority]?.label ?? selectedTicket.priority}
                </Tag>
              )}
              {selectedTicket?.category && (
                <Tag style={{ fontSize: 11 }}>{selectedTicket.category}</Tag>
              )}
            </Space>
          </div>
        }
        open={showMessagesModal}
        onCancel={() => setShowMessagesModal(false)}
        footer={null}
        width={680}
      >
        {selectedTicket?.description && (
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            border: '1px solid var(--border-subtle)',
          }}>
            {selectedTicket.description}
          </p>
        )}

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: 16,
          marginBottom: 16,
          maxHeight: 380,
          overflowY: 'auto',
        }}>
          {messages.length > 0 ? (
            <List
              dataSource={messages}
              renderItem={(msg: any) => (
                <List.Item style={{ padding: '8px 0', border: 'none' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          background: msg.isAdmin ? '#047857' : 'rgba(4,120,87,0.15)',
                          color: msg.isAdmin ? '#fff' : '#047857',
                          fontWeight: 700,
                        }}
                      >
                        {msg.authorName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    }
                    title={
                      <Space size={6}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {msg.authorName}
                        </span>
                        {msg.isAdmin && (
                          <Tag color="green" style={{ fontWeight: 700, fontSize: 10 }}>Suporte</Tag>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {new Date(msg.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </Space>
                    }
                    description={
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{msg.content}</span>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <EmptyState
              icon={<MessageOutlined style={{ fontSize: 24 }} />}
              title="Sem mensagens ainda"
              compact
            />
          )}
        </div>

        {selectedTicket?.status !== 'CLOSED' && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            <TextArea
              rows={3}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              style={{ borderRadius: 8, marginBottom: 10 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              style={{
                background: 'var(--primary-color)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Enviar Mensagem
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
