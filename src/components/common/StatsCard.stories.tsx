import type { Meta, StoryObj } from '@storybook/react';
import StatsCard from './StatsCard';
import { UserOutlined, DollarOutlined, ShoppingOutlined } from '@ant-design/icons';

const meta: Meta<typeof StatsCard> = {
  title: 'Components/Common/StatsCard',
  component: StatsCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Título do card',
    },
    value: {
      control: 'text',
      description: 'Valor principal a ser exibido',
    },
    prefix: {
      control: false,
      description: 'Elemento React para exibir antes do valor',
    },
    suffix: {
      control: 'text',
      description: 'Texto para exibir após o valor',
    },
    precision: {
      control: 'number',
      description: 'Número de casas decimais',
    },
    loading: {
      control: 'boolean',
      description: 'Mostra estado de carregamento',
    },
    trend: {
      control: 'object',
      description: 'Objeto com informações de tendência',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatsCard>;

export const Default: Story = {
  args: {
    title: 'Total de Clientes',
    value: 1250,
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Total de Clientes',
    value: 1250,
    icon: <UserOutlined />,
  },
};

export const WithSuffix: Story = {
  args: {
    title: 'Receita Total',
    value: 125000,
    prefix: <DollarOutlined />,
    suffix: 'R$',
    precision: 2,
  },
};

export const WithTrend: Story = {
  args: {
    title: 'Vendas do Mês',
    value: 450,
    icon: <ShoppingOutlined />,
    trend: {
      value: 12.5,
      isPositive: true,
    },
  },
};

export const NegativeTrend: Story = {
  args: {
    title: 'Vendas do Mês',
    value: 320,
    icon: <ShoppingOutlined />,
    trend: {
      value: 8.3,
      isPositive: false,
    },
  },
};

export const Loading: Story = {
  args: {
    title: 'Carregando...',
    value: 0,
    loading: true,
  },
};

export const WithCustomValue: Story = {
  args: {
    title: 'Status',
    value: 'Ativo',
    icon: <UserOutlined />,
  },
};

