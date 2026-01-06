import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PageHeader from '../PageHeader'

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render title and subtitle', () => {
    render(<PageHeader title="Test Title" subtitle="Test Subtitle" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should render without subtitle', () => {
    const { container } = render(<PageHeader title="Only Title" />)
    expect(screen.getByText('Only Title')).toBeInTheDocument()
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })
})

