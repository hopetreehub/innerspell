import { render, screen } from '@testing-library/react'

describe('Example Test Suite', () => {
  it('should pass basic test', () => {
    // Basic test to ensure Jest is working
    expect(1 + 1).toBe(2)
  })

  it('should render a component', () => {
    render(<div data-testid="test-div">Hello Test</div>)
    
    const element = screen.getByTestId('test-div')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello Test')
  })
})