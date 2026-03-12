import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, Modal, Upload, Row, Col, message, Popconfirm, Tag } from 'antd'
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  ReloadOutlined,
  WarningOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { apiService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import { PageSkeleton } from '../components/common/PageSkeleton'

interface Backup {
  filename: string
  size: number
  createdAt: string
  modifiedAt: string
}

export default function Backup() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadBackups()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBackups = async () => {
    try {
      setLoading(true)
      const data = await apiService.getBackups()
      setBackups(data as any)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setCreating(true)
      const result = await apiService.createBackup()
      if ((result as any).success) {
        message.success(
          `Backup criado! Arquivo: ${(result as any).filename} (${formatFileSize((result as any).size)})`
        )
        await loadBackups()
      } else {
        message.error('Erro ao criar backup')
      }
    } catch {
      message.error('Erro ao criar backup')
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      message.warning('Selecione um arquivo de backup')
      return
    }
    try {
      setRestoring(true)
      const text = await selectedFile.text()
      const backupData = JSON.parse(text)
      const result = await apiService.restoreBackup(backupData)
      if ((result as any).success) {
        message.success('Backup restaurado com sucesso!')
        setSelectedFile(null)
      } else {
        message.error('Erro ao restaurar backup')
      }
    } catch {
      message.error('Erro ao processar o arquivo de backup')
    } finally {
      setRestoring(false)
    }
  }

  const handleDeleteBackup = async (filename: string) => {
    try {
      const result = await apiService.deleteBackup(filename)
      if ((result as any).success) {
        message.success('Backup excluído com sucesso!')
        await loadBackups()
      } else {
        message.error('Erro ao excluir backup')
      }
    } catch {
      message.error('Erro ao excluir backup')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) return <PageSkeleton />

  return (
    <div>
      <PageHeader
        title="Backup e Restore"
        subtitle="Gerencie os backups e restaurações dos seus dados"
        breadcrumb={[{ label: 'Backup e Restore' }]}
        actions={
          <>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadBackups}
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
              onClick={handleCreateBackup}
              loading={creating}
              style={{
                height: 36,
                borderRadius: 8,
                background: 'var(--primary-color)',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Criar Backup
            </Button>
          </>
        }
      />

      <div style={{ padding: '0 24px 24px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* Card: Criar Backup */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CloudUploadOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
                  <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
                    Criar Novo Backup
                  </span>
                </div>
              }
            >
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                Crie um backup completo de todos os seus dados: clientes, pets, agendamentos, produtos, vendas e todas as demais informações.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                background: 'rgba(4,120,87,0.06)',
                borderRadius: 8,
                border: '1px solid rgba(4,120,87,0.15)',
                marginBottom: 20,
              }}>
                <DatabaseOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
                <span style={{ fontSize: 13, color: '#047857', fontWeight: 500 }}>
                  Backups são salvos com segurança no servidor
                </span>
              </div>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleCreateBackup}
                loading={creating}
                size="large"
                style={{
                  background: 'var(--primary-color)',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 40,
                }}
              >
                {creating ? 'Criando Backup...' : 'Criar Backup Agora'}
              </Button>
            </Card>
          </Col>

          {/* Card: Restaurar Backup */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UploadOutlined style={{ color: '#d97706', fontSize: 16 }} />
                  <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
                    Restaurar Backup
                  </span>
                </div>
              }
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.06)',
                borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.15)',
                marginBottom: 20,
              }}>
                <WarningOutlined style={{ color: '#ef4444', fontSize: 16, marginTop: 1, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: '#dc2626', lineHeight: 1.5 }}>
                  <strong>Atenção:</strong> Restaurar um backup irá substituir todos os dados atuais. Esta ação não pode ser desfeita.
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}>
                  Arquivo de Backup (.json)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                  style={{
                    width: '100%',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    background: 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                />
                {selectedFile && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
                    Arquivo selecionado: <strong>{selectedFile.name}</strong>
                  </p>
                )}
              </div>

              <Popconfirm
                title="Restaurar Backup"
                description="Esta ação substituirá TODOS os dados atuais. Tem certeza?"
                onConfirm={handleRestoreBackup}
                okText="Sim, restaurar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  size="large"
                  icon={<UploadOutlined />}
                  loading={restoring}
                  disabled={!selectedFile}
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                    height: 40,
                  }}
                >
                  {restoring ? 'Restaurando...' : 'Restaurar Backup'}
                </Button>
              </Popconfirm>
            </Card>
          </Col>
        </Row>

        {/* Lista de Backups */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined style={{ color: 'var(--primary-color)', fontSize: 16 }} />
              <span style={{ fontFamily: 'var(--display-family)', fontWeight: 700 }}>
                Backups Disponíveis
              </span>
              {backups.length > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  height: 20,
                  padding: '0 7px',
                  background: 'rgba(4,120,87,0.1)',
                  color: '#047857',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  marginLeft: 4,
                }}>
                  {backups.length}
                </span>
              )}
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          {backups.length === 0 ? (
            <EmptyState
              icon={<SaveOutlined style={{ fontSize: 32 }} />}
              title="Nenhum backup encontrado"
              description="Crie seu primeiro backup para proteger seus dados"
              actionLabel="Criar Backup"
              onAction={handleCreateBackup}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {backups.map(backup => (
                <div
                  key={backup.filename}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-elevated)',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(4,120,87,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-color)',
                      fontSize: 18,
                      flexShrink: 0,
                    }}>
                      <SaveOutlined />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {backup.filename}
                      </p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DatabaseOutlined style={{ fontSize: 11 }} />
                          {formatFileSize(backup.size)}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined style={{ fontSize: 11 }} />
                          {new Date(backup.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Popconfirm
                    title="Excluir backup?"
                    description="Esta ação não pode ser desfeita."
                    onConfirm={() => handleDeleteBackup(backup.filename)}
                    okText="Sim, excluir"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ height: 32, borderRadius: 6 }}
                    >
                      Excluir
                    </Button>
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dicas de uso */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 10,
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <WarningOutlined style={{ color: '#d97706', fontSize: 16 }} />
            <h3 style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: '#92400e',
              fontFamily: 'var(--display-family)',
            }}>
              Boas práticas de Backup
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {[
              'Faça backups regularmente para proteger seus dados',
              'Os backups são salvos localmente no servidor',
              'Restaurar um backup substitui todos os dados atuais',
              'Mantenha cópias dos backups em local seguro externo',
              'Teste a restauração em ambiente de desenvolvimento antes de usar em produção',
            ].map((tip, i) => (
              <li key={i} style={{ fontSize: 12, color: '#92400e', lineHeight: 1.8 }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
