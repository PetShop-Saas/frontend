import type { Meta, StoryObj } from '@storybook/react';
import PageHeader from './PageHeader';
import { Button } from 'antd';
import { PlusOutlined, ExportOutlined } from '@ant-design/icons';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Common/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Título principal da página',
    },
    subtitle: {
      control: 'text',
      description: 'Subtítulo opcional',
    },
    breadcrumb: {
      control: 'object',
      description: 'Array de itens do breadcrumb',
    },
    actions: {
      control: false,
      description: 'Elementos React para ações (botões, etc)',
    },
    extra: {
      control: false,
      description: 'Conteúdo extra abaixo do header',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Clientes',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Clientes',
    subtitle: 'Gerencie seus clientes e seus pets',
  },
};

export const WithBreadcrumb: Story = {
  args: {
    title: 'Detalhes do Cliente',
    subtitle: 'Visualize e edite informações do cliente',
    breadcrumb: [
      { label: 'Clientes', path: '/customers' },
      { label: 'Detalhes', path: '/customers/123' },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: 'Clientes',
    subtitle: 'Gerencie seus clientes e seus pets',
    actions: (
      <>
        <Button icon={<ExportOutlined />}>Exportar</Button>
        <Button type="primary" icon={<PlusOutlined />}>
          Novo Cliente
        </Button>
      </>
    ),
  },
};

export const Complete: Story = {
  args: {
    title: 'Clientes',
    subtitle: 'Gerencie seus clientes e seus pets',
    breadcrumb: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Clientes', path: '/customers' },
    ],
    actions: (
      <>
        <Button icon={<ExportOutlined />}>Exportar</Button>
        <Button type="primary" icon={<PlusOutlined />}>
          Novo Cliente
        </Button>
      </>
    ),
    extra: (
      <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <p style={{ margin: 0 }}>Filtros e informações adicionais podem ser exibidos aqui</p>
      </div>
    ),
  },
};

