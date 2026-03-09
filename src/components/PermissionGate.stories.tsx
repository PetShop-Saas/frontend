import type { Meta, StoryObj } from '@storybook/react';
import { PermissionGate } from './PermissionGate';
import { Button, Card } from 'antd';

const meta: Meta<typeof PermissionGate> = {
  title: 'Components/PermissionGate',
  component: PermissionGate,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    permission: {
      control: 'text',
      description: 'Nome da permissão específica',
    },
    resource: {
      control: 'text',
      description: 'Recurso a ser verificado',
    },
    action: {
      control: 'text',
      description: 'Ação a ser verificada (create, read, update, delete)',
    },
    fallback: {
      control: false,
      description: 'Conteúdo a ser exibido se não tiver permissão',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PermissionGate>;

export const WithPermission: Story = {
  args: {
    permission: 'users.create',
    children: (
      <Card>
        <h3>Conteúdo Protegido</h3>
        <p>Este conteúdo só é exibido se o usuário tiver a permissão &apos;users.create&apos;</p>
        <Button type="primary">Ação Permitida</Button>
      </Card>
    ),
  },
};

export const WithResourceAndAction: Story = {
  args: {
    resource: 'customers',
    action: 'create',
    children: (
      <Card>
        <h3>Botão de Criar Cliente</h3>
        <p>Este botão só aparece se o usuário pode criar clientes</p>
        <Button type="primary">Novo Cliente</Button>
      </Card>
    ),
  },
};

export const WithFallback: Story = {
  args: {
    permission: 'admin.access',
    fallback: (
      <Card>
        <p style={{ color: '#999' }}>Você não tem permissão para ver este conteúdo</p>
      </Card>
    ),
    children: (
      <Card>
        <h3>Conteúdo Administrativo</h3>
        <p>Este conteúdo só é visível para administradores</p>
      </Card>
    ),
  },
};

export const WithoutPermission: Story = {
  args: {
    permission: 'restricted.access',
    children: (
      <Card>
        <h3>Conteúdo Restrito</h3>
        <p>Este conteúdo não será exibido se não houver permissão</p>
      </Card>
    ),
  },
};

