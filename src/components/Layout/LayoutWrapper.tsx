import React from 'react'
import PersistentLayout from './PersistentLayout'

interface LayoutWrapperProps {
  children: React.ReactNode
}

// Este componente será usado apenas uma vez na aplicação
let layoutInstance: React.ReactElement | null = null

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  // Se já existe uma instância do layout, apenas atualiza o children
  if (layoutInstance) {
    return React.cloneElement(layoutInstance, { children })
  }

  // Cria uma nova instância do layout persistente
  layoutInstance = <PersistentLayout>{children}</PersistentLayout>
  return layoutInstance
}
