import type { Meta, StoryObj } from '@storybook/react';
import PageContainer from './PageContainer';

const meta: Meta<typeof PageContainer> = {
  title: 'Components/Common/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Mostra um spinner de carregamento',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageContainer>;

export const Default: Story = {
  args: {
    loading: false,
    children: (
      <div style={{ padding: '2rem' }}>
        <h1>Conteúdo da Página</h1>
        <p>Este é um exemplo de conteúdo dentro do PageContainer.</p>
      </div>
    ),
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: (
      <div style={{ padding: '2rem' }}>
        <h1>Conteúdo da Página</h1>
        <p>Este conteúdo está sendo carregado...</p>
      </div>
    ),
  },
};

export const WithContent: Story = {
  args: {
    loading: false,
    children: (
      <div style={{ padding: '2rem' }}>
        <h1>Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <h3>Card 1</h3>
            <p>Conteúdo do card</p>
          </div>
          <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <h3>Card 2</h3>
            <p>Conteúdo do card</p>
          </div>
          <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <h3>Card 3</h3>
            <p>Conteúdo do card</p>
          </div>
        </div>
      </div>
    ),
  },
};

