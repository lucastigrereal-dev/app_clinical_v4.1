import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './page'

// Mock dependencies
const mockPush = jest.fn()
const mockLogin = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: any) =>
    selector({
      login: mockLogin,
    }),
}))

jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==========================================
  // Rendering Tests
  // ==========================================
  describe('Rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />)

      expect(screen.getByText('Clinic Companion')).toBeInTheDocument()
      expect(screen.getByText('Sistema de Acompanhamento Pós-Operatório')).toBeInTheDocument()
      expect(screen.getByText('Entrar no Sistema')).toBeInTheDocument()
    })

    it('should render email and password inputs', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
      expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: /entrar/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).not.toBeDisabled()
    })

    it('should render quick login buttons', () => {
      render(<LoginPage />)

      expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /médico/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /paciente/i })).toBeInTheDocument()
    })

    it('should render feature highlights', () => {
      render(<LoginPage />)

      expect(screen.getByText('Gamificação Completa')).toBeInTheDocument()
      expect(screen.getByText('Timeline D+0 até D+60')).toBeInTheDocument()
      expect(screen.getByText('Segurança LGPD')).toBeInTheDocument()
      expect(screen.getByText('ROI Comprovado')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Form Interaction Tests
  // ==========================================
  describe('Form Interactions', () => {
    it('should update email input value', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
      await user.type(emailInput, 'test@example.com')

      expect(emailInput.value).toBe('test@example.com')
    })

    it('should update password input value', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement
      await user.type(passwordInput, 'password123')

      expect(passwordInput.value).toBe('password123')
    })

    it('should have required attribute on email and password', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('E-mail')).toBeRequired()
      expect(screen.getByLabelText('Senha')).toBeRequired()
    })

    it('should have correct input types', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    })
  })

  // ==========================================
  // Quick Login Tests
  // ==========================================
  describe('Quick Login Buttons', () => {
    it('should set admin credentials when clicking Admin button', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const adminButton = screen.getByRole('button', { name: /admin/i })
      await user.click(adminButton)

      const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement

      expect(emailInput.value).toBe('admin@clinic.com')
      expect(passwordInput.value).toBe('admin123')
    })

    it('should set doctor credentials when clicking Médico button', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const doctorButton = screen.getByRole('button', { name: /médico/i })
      await user.click(doctorButton)

      const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement

      expect(emailInput.value).toBe('dr.silva@clinic.com')
      expect(passwordInput.value).toBe('medico123')
    })

    it('should set patient credentials when clicking Paciente button', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const patientButton = screen.getByRole('button', { name: /paciente/i })
      await user.click(patientButton)

      const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement

      expect(emailInput.value).toBe('maria@email.com')
      expect(passwordInput.value).toBe('paciente123')
    })
  })

  // ==========================================
  // Login Submission Tests
  // ==========================================
  describe('Login Submission', () => {
    it('should call login function on form submit', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: true, user: { role: 'admin', name: 'Admin' } })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, user: { role: 'admin', name: 'Admin' } }), 100))
      )

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Check loading state
      expect(screen.getByText('Entrando...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Entrar')).toBeInTheDocument()
      })
    })

    it('should redirect to admin dashboard for admin user', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({
        success: true,
        user: { role: 'admin', name: 'Admin User' },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')
      })
    })

    it('should redirect to doctor dashboard for doctor user', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({
        success: true,
        user: { role: 'doctor', name: 'Dr. Silva' },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'doctor@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/doctor/dashboard')
      })
    })

    it('should redirect to patient dashboard for patient user', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({
        success: true,
        user: { role: 'patient', name: 'Maria' },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'patient@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/patient/dashboard')
      })
    })

    it('should redirect to default dashboard for unknown role', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({
        success: true,
        user: { role: 'unknown', name: 'User' },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  // ==========================================
  // Error Handling Tests
  // ==========================================
  describe('Error Handling', () => {
    it('should handle login failure', async () => {
      const user = userEvent.setup()
      const { toast } = require('@/lib/toast')

      mockLogin.mockResolvedValue({
        success: false,
        message: 'Credenciais inválidas',
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Credenciais inválidas')
      })
    })

    it('should handle network error', async () => {
      const user = userEvent.setup()
      const { toast } = require('@/lib/toast')

      mockLogin.mockRejectedValue(new Error('Network error'))

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao conectar com o servidor')
      })
    })

    it('should reset loading state after error', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new Error('Network error'))

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
        expect(screen.getByText('Entrar')).toBeInTheDocument()
      })
    })
  })

  // ==========================================
  // Accessibility Tests
  // ==========================================
  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('E-mail')
      const passwordInput = screen.getByLabelText('Senha')

      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    it('should have accessible button text', () => {
      render(<LoginPage />)

      // Main submit button
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()

      // Quick login buttons
      expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /médico/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /paciente/i })).toBeInTheDocument()
    })

    it('should have proper input placeholders', () => {
      render(<LoginPage />)

      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    })
  })
})
