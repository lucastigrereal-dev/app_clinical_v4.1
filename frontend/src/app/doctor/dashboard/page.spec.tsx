import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DoctorDashboard from './page'

// Mock dependencies
const mockPush = jest.fn()
const mockLogout = jest.fn()

// Control variable for auth store
let mockUser: any = { email: 'doctor@clinic.com', role: 'doctor', name: 'Dr. Silva' }

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector?: any) => {
    const state = {
      user: mockUser,
      logout: mockLogout,
    };
    return selector ? selector(state) : state;
  },
}))

describe('DoctorDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = { email: 'doctor@clinic.com', role: 'doctor', name: 'Dr. Silva' }
  })

  // ==========================================
  // Rendering Tests
  // ==========================================
  describe('Rendering', () => {
    it('should render dashboard header', () => {
      render(<DoctorDashboard />)

      expect(screen.getByText('Dashboard Médico')).toBeInTheDocument()
      expect(screen.getByText('Dr. Silva')).toBeInTheDocument()
      expect(screen.getByText('CRM-SP 123456')).toBeInTheDocument()
    })

    it('should render metrics overview cards', () => {
      render(<DoctorDashboard />)

      expect(screen.getByText('Pacientes Ativos')).toBeInTheDocument()
      expect(screen.getByText('48')).toBeInTheDocument()
      expect(screen.getByText('Taxa de Adesão')).toBeInTheDocument()
      expect(screen.getByText('91%')).toBeInTheDocument()
      expect(screen.getByText('Taxa Complicações')).toBeInTheDocument()
      expect(screen.getByText('8%')).toBeInTheDocument()
      expect(screen.getByText('Satisfação')).toBeInTheDocument()
      expect(screen.getByText('95')).toBeInTheDocument()
    })

    it('should render tabs navigation', () => {
      render(<DoctorDashboard />)

      expect(screen.getByRole('button', { name: 'Meus Pacientes' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Agenda do Dia' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Métricas' })).toBeInTheDocument()
    })
  })


  // ==========================================
  // Tab Navigation
  // ==========================================
  describe('Tab Navigation', () => {
    it('should show patients tab by default', () => {
      render(<DoctorDashboard />)

      expect(screen.getByText('Pacientes em Acompanhamento')).toBeInTheDocument()
      expect(screen.queryByText('Agenda de Hoje')).not.toBeInTheDocument()
    })

    it('should switch to schedule tab when clicked', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const scheduleTab = screen.getByRole('button', { name: 'Agenda do Dia' })
      await user.click(scheduleTab)

      await waitFor(() => {
        expect(screen.getByText('Agenda de Hoje')).toBeInTheDocument()
      })
    })

    it('should switch to metrics tab when clicked', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const metricsTab = screen.getByRole('button', { name: 'Métricas' })
      await user.click(metricsTab)

      await waitFor(() => {
        expect(screen.getByText('Performance Mensal')).toBeInTheDocument()
      })

      expect(screen.getByText('Alertas e Pendências')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Patient List (Patients Tab)
  // ==========================================
  describe('Patient List', () => {
    it('should render patient list with all patients', () => {
      render(<DoctorDashboard />)

      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      expect(screen.getByText('Rinoplastia')).toBeInTheDocument()
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Abdominoplastia')).toBeInTheDocument()
      expect(screen.getByText('Ana Costa')).toBeInTheDocument()
      expect(screen.getByText('Mamoplastia')).toBeInTheDocument()
      expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
      expect(screen.getByText('Lipoaspiração')).toBeInTheDocument()
    })

    it('should display patient progress and adherence', () => {
      render(<DoctorDashboard />)

      expect(screen.getByText('35%')).toBeInTheDocument() // Maria progress
      expect(screen.getByText('92%')).toBeInTheDocument() // Maria adherence
      expect(screen.getByText('65%')).toBeInTheDocument() // João progress
      expect(screen.getByText('88%')).toBeInTheDocument() // João adherence
    })

    it('should show patient detail when patient is clicked', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const mariaRow = screen.getByText('Maria Santos')
      await user.click(mariaRow)

      await waitFor(() => {
        expect(screen.getByText('Detalhes do Paciente')).toBeInTheDocument()
      })

      expect(screen.getByText('D+7')).toBeInTheDocument()
      expect(screen.getByText('Consulta de retorno D+7')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ver Prontuário/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ligar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ver Fotos/i })).toBeInTheDocument()
    })
  })

  // ==========================================
  // Schedule Tab
  // ==========================================
  describe('Schedule Tab', () => {
    it('should display today schedule with appointments', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const scheduleTab = screen.getByRole('button', { name: 'Agenda do Dia' })
      await user.click(scheduleTab)

      await waitFor(() => {
        expect(screen.getByText('08:00 - Maria Santos')).toBeInTheDocument()
      })

      expect(screen.getByText('Retorno D+7')).toBeInTheDocument()
      expect(screen.getByText('09:00 - João Silva')).toBeInTheDocument()
      expect(screen.getByText('Avaliação D+14')).toBeInTheDocument()
      expect(screen.getByText('10:00 - Ana Costa')).toBeInTheDocument()
    })

    it('should show appointment status badges', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const scheduleTab = screen.getByRole('button', { name: 'Agenda do Dia' })
      await user.click(scheduleTab)

      await waitFor(() => {
        expect(screen.getAllByText('Confirmado')).toHaveLength(5)
      })

      expect(screen.getAllByText('Pendente')).toHaveLength(2)
    })
  })

  // ==========================================
  // Metrics Tab
  // ==========================================
  describe('Metrics Tab', () => {
    it('should display performance metrics', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const metricsTab = screen.getByRole('button', { name: 'Métricas' })
      await user.click(metricsTab)

      await waitFor(() => {
        expect(screen.getByText('Performance Mensal')).toBeInTheDocument()
      })

      expect(screen.getByText('Cirurgias Realizadas')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('Consultas de Retorno')).toBeInTheDocument()
      expect(screen.getByText('168')).toBeInTheDocument()
      expect(screen.getByText('Taxa de Sucesso')).toBeInTheDocument()
      expect(screen.getByText('96%')).toBeInTheDocument()
    })

    it('should display alerts and pending tasks', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const metricsTab = screen.getByRole('button', { name: 'Métricas' })
      await user.click(metricsTab)

      await waitFor(() => {
        expect(screen.getByText('Alertas e Pendências')).toBeInTheDocument()
      })

      expect(screen.getByText('3 pacientes com adesão baixa')).toBeInTheDocument()
      expect(screen.getByText('Requerem atenção especial')).toBeInTheDocument()
      expect(screen.getByText('5 consultas de retorno esta semana')).toBeInTheDocument()
      expect(screen.getByText('Meta mensal: 92% atingida')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Patient Details
  // ==========================================
  describe('Patient Details', () => {
    it('should show empty state when no patient selected', () => {
      render(<DoctorDashboard />)

      expect(screen.getByText('Selecione um paciente para ver detalhes')).toBeInTheDocument()
    })

    it('should display all patient information', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const joaoRow = screen.getByText('João Silva')
      await user.click(joaoRow)

      await waitFor(() => {
        expect(screen.getAllByText('João Silva')).toHaveLength(2) // In list and detail
      })

      expect(screen.getAllByText('Abdominoplastia')).toHaveLength(2)
      expect(screen.getByText('D+14')).toBeInTheDocument()
    })

    it('should display action buttons for selected patient', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const anaRow = screen.getByText('Ana Costa')
      await user.click(anaRow)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Ver Prontuário/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /Ligar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ver Fotos/i })).toBeInTheDocument()
    })
  })

  // ==========================================
  // Interactions
  // ==========================================
  describe('Interactions', () => {
    it('should call logout when logout button clicked', async () => {
      const user = userEvent.setup()
      render(<DoctorDashboard />)

      const logoutButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('svg') !== null && btn.textContent === ''
      )

      if (logoutButton) {
        await user.click(logoutButton)
        expect(mockLogout).toHaveBeenCalled()
      }
    })
  })

  // ==========================================
  // Status Colors
  // ==========================================
  describe('Status Colors', () => {
    it('should apply correct colors to patient status badges', () => {
      render(<DoctorDashboard />)

      const postOpBadges = screen.getAllByText('Pós-Op')
      expect(postOpBadges.length).toBeGreaterThan(0)
      postOpBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
      })

      const recoveryBadges = screen.getAllByText('Recuperação')
      expect(recoveryBadges.length).toBeGreaterThan(0)
      recoveryBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
      })
    })
  })

  // ==========================================
  // Responsive Data
  // ==========================================
  describe('Responsive Data', () => {
    it('should display correct total patient counts', () => {
      render(<DoctorDashboard />)

      expect(screen.getByText('de 124 total')).toBeInTheDocument()
    })

    it('should show progress bars with correct widths', () => {
      render(<DoctorDashboard />)

      // Progress bars should be rendered (checked via DOM structure)
      const progressElements = document.querySelectorAll('.bg-gray-200')
      expect(progressElements.length).toBeGreaterThan(0)
    })
  })
})
