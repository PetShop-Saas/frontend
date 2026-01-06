import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatsCard from '../StatsCard'

describe('StatsCard', () => {
  it('should render title and value', () => {
    render(<StatsCard title="Total Sales" value="$1,000" />)
    expect(screen.getByText('Total Sales')).toBeInTheDocument()
  })

  it('should render with icon when provided', () => {
    const TestIcon = () => <div data-testid="test-icon">Icon</div>
    render(<StatsCard title="Test" value="100" icon={<TestIcon />} />)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('should render positive trend when provided', () => {
    render(<StatsCard title="Test" value={100} trend={{ value: 10, isPositive: true }} />)
    expect(screen.getByText(/10%/)).toBeInTheDocument()
    expect(screen.getByText(/↑/)).toBeInTheDocument()
  })

  it('should render negative trend when provided', () => {
    render(<StatsCard title="Test" value={100} trend={{ value: 5, isPositive: false }} />)
    expect(screen.getByText(/5%/)).toBeInTheDocument()
    expect(screen.getByText(/↓/)).toBeInTheDocument()
  })

  it('should show loading state', () => {
    const { container } = render(
      <StatsCard title="Test" value={100} loading={true} />
    )
    expect(container.querySelector('.ant-card-loading')).toBeInTheDocument()
  })
})

