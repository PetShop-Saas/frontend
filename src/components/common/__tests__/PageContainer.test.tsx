import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PageContainer from '../PageContainer'

describe('PageContainer', () => {
  it('should render children', () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should show loading state when loading prop is true', () => {
    const { container } = render(
      <PageContainer loading={true}>
        <div>Content</div>
      </PageContainer>
    )
    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <PageContainer>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </PageContainer>
    )
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })
})

