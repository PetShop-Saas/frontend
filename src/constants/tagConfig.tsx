import React from 'react'
import {
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  HeartOutlined,
  MailOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  ToolOutlined,
  ScissorOutlined,
  EditTwoTone,
  SwapOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined
} from '@ant-design/icons'

export const TAG_CLASS = '!px-2.5 !py-1 !inline-flex !items-center !gap-1.5'

export interface TagOption {
  value: string
  label: string
  color: string
  icon?: React.ReactNode
}

export function getTagOption(options: TagOption[], value: string): TagOption {
  return options.find(opt => opt.value === value) || options[0]
}

export const NOTIFICATION_TYPE_OPTIONS: TagOption[] = [
  { value: 'INFO', label: 'Informação', color: 'blue', icon: <InfoCircleOutlined /> },
  { value: 'WARNING', label: 'Aviso', color: 'orange', icon: <WarningOutlined /> },
  { value: 'ERROR', label: 'Erro', color: 'red', icon: <CloseCircleOutlined /> },
  { value: 'SUCCESS', label: 'Sucesso', color: 'green', icon: <CheckCircleOutlined /> }
]

export const NOTIFICATION_CATEGORY_OPTIONS: TagOption[] = [
  { value: 'SYSTEM', label: 'Sistema', color: 'geekblue', icon: <SettingOutlined /> },
  { value: 'APPOINTMENT', label: 'Agendamento', color: 'blue', icon: <CalendarOutlined /> },
  { value: 'SALE', label: 'Venda', color: 'green', icon: <ShoppingOutlined /> },
  { value: 'STOCK', label: 'Estoque', color: 'orange', icon: <MedicineBoxOutlined /> },
  { value: 'CUSTOMER', label: 'Cliente', color: 'purple', icon: <UserOutlined /> },
  { value: 'MEDICAL', label: 'Médico', color: 'cyan', icon: <HeartOutlined /> },
  { value: 'COMMUNICATION', label: 'Comunicação', color: 'magenta', icon: <MailOutlined /> }
]

export const NOTIFICATION_PRIORITY_OPTIONS: TagOption[] = [
  { value: 'LOW', label: 'Baixa', color: 'lime' },
  { value: 'MEDIUM', label: 'Média', color: 'blue' },
  { value: 'HIGH', label: 'Alta', color: 'orange' },
  { value: 'URGENT', label: 'Urgente', color: 'red' }
]

export const APPOINTMENT_STATUS_OPTIONS: TagOption[] = [
  { value: 'SCHEDULED', label: 'Agendado', color: 'blue', icon: <ClockCircleOutlined /> },
  { value: 'CONFIRMED', label: 'Confirmado', color: 'green', icon: <CheckCircleOutlined /> },
  { value: 'IN_PROGRESS', label: 'Em Andamento', color: 'orange', icon: <ClockCircleOutlined /> },
  { value: 'COMPLETED', label: 'Concluído', color: 'purple', icon: <CheckCircleOutlined /> },
  { value: 'CANCELLED', label: 'Cancelado', color: 'red', icon: <CloseCircleOutlined /> },
  { value: 'NO_SHOW', label: 'Não Compareceu', color: 'default', icon: <CloseCircleOutlined /> }
]

export const SALE_STATUS_OPTIONS: TagOption[] = [
  { value: 'PENDING', label: 'Pendente', color: 'orange', icon: <CloseCircleOutlined /> },
  { value: 'COMPLETED', label: 'Concluída', color: 'green', icon: <CheckCircleOutlined /> },
  { value: 'CANCELLED', label: 'Cancelada', color: 'red', icon: <CloseCircleOutlined /> }
]

export const PURCHASE_STATUS_OPTIONS: TagOption[] = [
  { value: 'PENDING', label: 'Pendente', color: 'orange', icon: <ClockCircleOutlined /> },
  { value: 'RECEIVED', label: 'Recebida', color: 'green', icon: <CheckCircleOutlined /> },
  { value: 'CANCELLED', label: 'Cancelada', color: 'red', icon: <CloseCircleOutlined /> }
]

export const ACTIVE_INACTIVE_OPTIONS: TagOption[] = [
  { value: 'active', label: 'Ativos', color: 'green', icon: <CheckCircleOutlined /> },
  { value: 'inactive', label: 'Inativos', color: 'red', icon: <CloseCircleOutlined /> }
]

export const MEDICAL_RECORD_TYPE_OPTIONS: TagOption[] = [
  { value: 'VACCINE', label: 'Vacina', color: 'blue', icon: <MedicineBoxOutlined /> },
  { value: 'MEDICATION', label: 'Medicação', color: 'green', icon: <HeartOutlined /> },
  { value: 'EXAM', label: 'Exame', color: 'orange', icon: <ExperimentOutlined /> },
  { value: 'TREATMENT', label: 'Tratamento', color: 'purple', icon: <ToolOutlined /> },
  { value: 'SURGERY', label: 'Cirurgia', color: 'red', icon: <ScissorOutlined /> }
]

export const PRODUCT_STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  OK: { color: 'green', icon: <CheckCircleOutlined />, label: 'OK' },
  LOW: { color: 'orange', icon: <WarningOutlined />, label: 'Baixo' },
  OUT: { color: 'red', icon: <CloseCircleOutlined />, label: 'Zerado' },
  active: { color: 'green', icon: <CheckCircleOutlined />, label: 'Ativo' },
  inactive: { color: 'red', icon: <CloseCircleOutlined />, label: 'Inativo' }
}

export const PRODUCT_STOCK_CONFIG = (stock: number) => {
  if (stock === 0) return { color: 'red', icon: <CloseCircleOutlined />, label: 'Sem Estoque' }
  if (stock <= 5) return { color: 'orange', icon: <ExclamationCircleOutlined />, label: 'Estoque Baixo' }
  return { color: 'green', icon: <CheckCircleOutlined />, label: 'Em Estoque' }
}

export const PRODUCT_MOVEMENT_TYPE_OPTIONS: TagOption[] = [
  { value: 'IN', label: 'Entrada', color: 'green', icon: <CheckCircleOutlined /> },
  { value: 'OUT', label: 'Saída', color: 'red', icon: <CloseCircleOutlined /> },
  { value: 'ADJUSTMENT', label: 'Ajuste', color: 'blue', icon: <EditTwoTone /> },
  { value: 'TRANSFER', label: 'Transferência', color: 'orange', icon: <SwapOutlined /> }
]

export const STOCK_MOVEMENT_TYPE_OPTIONS: TagOption[] = [
  { value: 'ENTRY', label: 'Entrada', color: 'green', icon: <ArrowUpOutlined /> },
  { value: 'EXIT', label: 'Saída', color: 'red', icon: <ArrowDownOutlined /> },
  { value: 'ADJUSTMENT', label: 'Ajuste', color: 'blue', icon: <SyncOutlined /> }
]

export function getProductStatusConfig(status: string) {
  return PRODUCT_STATUS_CONFIG[status] || PRODUCT_STATUS_CONFIG.OK
}

export function getProductMovementTypeConfig(type: string): { color: string; label: string; icon: React.ReactNode } {
  const opt = getTagOption(PRODUCT_MOVEMENT_TYPE_OPTIONS, type)
  if (opt) return { color: opt.color, label: opt.label, icon: opt.icon }
  return { color: 'default', label: type, icon: null }
}

export function getStockMovementTypeOption(type: string): TagOption {
  const opt = STOCK_MOVEMENT_TYPE_OPTIONS.find(o => o.value === type)
  if (opt) return opt
  const label = type === 'ENTRY' ? 'Entrada' : type === 'EXIT' ? 'Saída' : 'Ajuste'
  return { value: type, label, color: 'default', icon: <SyncOutlined /> }
}
