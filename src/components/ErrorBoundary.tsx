import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button, Result } from 'antd'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary para capturar erros de renderização em componentes filhos.
 * Exibe uma UI de fallback em vez de quebrar toda a aplicação.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <Result
            status="error"
            title="Algo deu errado"
            subTitle="Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início."
            extra={[
              <Button type="primary" key="retry" onClick={this.handleRetry}>
                Tentar novamente
              </Button>,
              <Button key="home" onClick={this.handleGoHome}>
                Ir para o início
              </Button>,
            ]}
          />
        </div>
      )
    }

    return this.props.children
  }
}
