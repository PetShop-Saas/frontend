import { Modal, Form, Input, Select, DatePicker, TimePicker, message } from 'antd'
import dayjs from 'dayjs'
import { Customer, Pet, Service } from '@/services/api'

const { TextArea } = Input
const { Option } = Select

interface AppointmentFormProps {
  visible: boolean
  onCancel: () => void
  onSubmit: (values: any) => Promise<void>
  customers: Customer[]
  pets: Pet[]
  services: Service[]
  initialValues?: any
  isEditing?: boolean
}

export function AppointmentForm({
  visible,
  onCancel,
  onSubmit,
  customers,
  pets,
  services,
  initialValues,
  isEditing
}: AppointmentFormProps) {
  const [form] = Form.useForm()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const dateTime = values.dateTime
      const formattedValues = {
        ...values,
        date: dateTime ? dateTime.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      }
      delete formattedValues.dateTime
      await onSubmit(formattedValues)
      form.resetFields()
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      }
    }
  }

  const getPetsByCustomer = (customerId: string) => {
    return pets.filter(pet => pet.customerId === customerId)
  }

  return (
    <Modal
      title={isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      okText={isEditing ? 'Salvar' : 'Criar'}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        <Form.Item
          name="customerId"
          label="Cliente"
          rules={[{ required: true, message: 'Selecione um cliente' }]}
        >
          <Select
            placeholder="Selecione um cliente"
            showSearch
            optionFilterProp="children"
            onChange={(value) => {
              form.setFieldsValue({ petId: undefined })
            }}
          >
            {customers.map(customer => (
              <Option key={customer.id} value={customer.id}>
                {customer.name} {customer.phone && `(${customer.phone})`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="petId"
          label="Pet"
          rules={[{ required: true, message: 'Selecione um pet' }]}
        >
          <Select
            placeholder="Selecione um pet"
            showSearch
            optionFilterProp="children"
            disabled={!form.getFieldValue('customerId')}
          >
            {getPetsByCustomer(form.getFieldValue('customerId')).map(pet => (
              <Option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="serviceId"
          label="Serviço"
          rules={[{ required: true, message: 'Selecione um serviço' }]}
        >
          <Select placeholder="Selecione um serviço" showSearch optionFilterProp="children">
            {services.map(service => (
              <Option key={service.id} value={service.id}>
                {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dateTime"
          label="Data e Hora"
          rules={[
            { required: true, message: 'Selecione data e hora' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const hour = value.hour()
                const minute = value.minute()
                if (hour === 0 && minute === 0) {
                  return Promise.reject(new Error('Horário 00:00 não é permitido'))
                }
                if (hour < 7 || (hour === 20 && minute > 0) || hour > 20) {
                  return Promise.reject(new Error('Horário deve estar entre 07:00 e 20:00'))
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            placeholder="Selecione data e hora"
          />
        </Form.Item>

        <Form.Item name="status" label="Status">
          <Select placeholder="Selecione o status">
            <Option value="SCHEDULED">Agendado</Option>
            <Option value="CONFIRMED">Confirmado</Option>
            <Option value="IN_PROGRESS">Em Andamento</Option>
            <Option value="COMPLETED">Concluído</Option>
            <Option value="CANCELLED">Cancelado</Option>
            <Option value="NO_SHOW">Não Compareceu</Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Observações">
          <TextArea rows={4} placeholder="Observações sobre o agendamento" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
