import type { Meta, StoryObj } from '@storybook/react';
import DataTable from './DataTable';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';

const meta: Meta<typeof DataTable> = {
  title: 'Components/Common/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Título da tabela',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carregamento',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Placeholder do campo de busca',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const sampleColumns: ColumnType<any>[] = [
  {
    title: 'Nome',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Telefone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
];

const sampleData = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    status: 'Ativo',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '(11) 88888-8888',
    status: 'Ativo',
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@example.com',
    phone: '(11) 77777-7777',
    status: 'Inativo',
  },
];

export const Default: Story = {
  args: {
    title: 'Lista de Clientes',
    dataSource: sampleData,
    columns: sampleColumns,
    loading: false,
  },
};

export const WithSearch: Story = {
  args: {
    title: 'Lista de Clientes',
    dataSource: sampleData,
    columns: sampleColumns,
    loading: false,
    onSearch: () => {},
    searchPlaceholder: 'Buscar clientes...',
  },
};

export const WithRefresh: Story = {
  args: {
    title: 'Lista de Clientes',
    dataSource: sampleData,
    columns: sampleColumns,
    loading: false,
    onRefresh: () => {},
  },
};

export const WithExtraActions: Story = {
  args: {
    title: 'Lista de Clientes',
    dataSource: sampleData,
    columns: sampleColumns,
    loading: false,
    onSearch: () => {},
    onRefresh: () => {},
    extraActions: (
      <Button type="primary" icon={<PlusOutlined />}>
        Novo Cliente
      </Button>
    ),
  },
};

export const Loading: Story = {
  args: {
    title: 'Lista de Clientes',
    dataSource: [],
    columns: sampleColumns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    title: 'Lista de Clientes',
    dataSource: [],
    columns: sampleColumns,
    loading: false,
  },
};

export const WithoutTitle: Story = {
  args: {
    dataSource: sampleData,
    columns: sampleColumns,
    loading: false,
    onSearch: () => {},
  },
};

