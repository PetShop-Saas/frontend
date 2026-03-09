import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

const ThrowError = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  it('deve renderizar children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Conteúdo normal</div>
      </ErrorBoundary>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('Conteúdo normal')
  })

  it('deve exibir UI de erro quando filho lança exceção', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    expect(screen.getByText(/Tente recarregar a página/)).toBeInTheDocument()
  })

  it('deve exibir fallback customizado quando fornecido', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Fallback customizado</div>}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('Fallback customizado')
  })

  it('deve exibir botões de ação', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
    expect(screen.getByText('Ir para o início')).toBeInTheDocument()
  })
})
