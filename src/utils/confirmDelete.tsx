import { Modal } from 'antd'

export const confirmDelete = (
  title: string = 'Confirmar exclusão',
  content: string = 'Tem certeza que deseja excluir este item?',
  onOk: () => void | Promise<void>
) => {
  Modal.confirm({
    title,
    content,
    okText: 'Sim, excluir',
    okType: 'danger',
    cancelText: 'Cancelar',
    onOk: async () => {
      await onOk()
    },
  })
}




