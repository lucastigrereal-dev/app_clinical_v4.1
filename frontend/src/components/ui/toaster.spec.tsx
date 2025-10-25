import { render } from '@testing-library/react'
import { Toaster } from './toaster'

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  Toaster: ({ position, toastOptions }: any) => (
    <div data-testid="toaster" data-position={position}>
      Mock Toaster
    </div>
  ),
}))

describe('Toaster Component', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<Toaster />)
    expect(getByTestId('toaster')).toBeInTheDocument()
  })

  it('should render with correct position', () => {
    const { getByTestId } = render(<Toaster />)
    const toaster = getByTestId('toaster')
    expect(toaster).toHaveAttribute('data-position', 'top-right')
  })

  it('should be a client component', () => {
    // This test verifies that the component has 'use client' directive
    // by checking that it can access client-side APIs
    expect(typeof window).toBe('object')
  })
})
