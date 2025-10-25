import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PatientDashboard from './page'

// Mock dependencies
const mockPush = jest.fn()
const mockLogout = jest.fn()

// Control variable for auth store
let mockUser: any = { email: 'maria@email.com', role: 'patient', name: 'Maria Santos' }

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

describe('PatientDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = { email: 'maria@email.com', role: 'patient', name: 'Maria Santos' }
  })

  // ==========================================
  // Rendering Tests
  // ==========================================
  describe('Rendering', () => {
    it('should render dashboard header with gamification elements', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('Minha Jornada de Recuperação')).toBeInTheDocument()
      expect(screen.getByText('450 pts')).toBeInTheDocument()
      expect(screen.getByText('Nível 2')).toBeInTheDocument()
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    it('should render main sections', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('Timeline D+0 até D+60')).toBeInTheDocument()
      expect(screen.getByText('Tarefas de Hoje')).toBeInTheDocument()
      expect(screen.getByText('Minhas Conquistas')).toBeInTheDocument()
    })
  })


  // ==========================================
  // Status Cards
  // ==========================================
  describe('Status Cards', () => {
    it('should display current day and adherence', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('D+7')).toBeInTheDocument()
      expect(screen.getByText('Dia Atual')).toBeInTheDocument()
      expect(screen.getByText('53 dias restantes')).toBeInTheDocument()

      expect(screen.getByText('92%')).toBeInTheDocument()
      expect(screen.getByText('Adesão ao Protocolo')).toBeInTheDocument()
    })

    it('should display streak and badges count', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('5')).toBeInTheDocument() // streak
      expect(screen.getByText('Dias em Sequência')).toBeInTheDocument()
      expect(screen.getByText('🔥 Mantenha o ritmo!')).toBeInTheDocument()

      expect(screen.getByText('3/6')).toBeInTheDocument()
      expect(screen.getByText('Badges Conquistados')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Timeline Milestones
  // ==========================================
  describe('Timeline Milestones', () => {
    it('should render timeline milestones', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('🚀 Dia da Cirurgia')).toBeInTheDocument()
      expect(screen.getByText('💪 Primeiro Dia Pós-Op')).toBeInTheDocument()
      expect(screen.getByText('🏆 Uma Semana Completa!')).toBeInTheDocument()
      expect(screen.getByText('👑 Um Mês Completo!')).toBeInTheDocument()
      expect(screen.getByText('🌟 DOIS MESES - VITÓRIA!')).toBeInTheDocument()
    })

    it('should show milestone details when clicked', async () => {
      const user = userEvent.setup()
      render(<PatientDashboard />)

      const weekMilestone = screen.getByText('🏆 Uma Semana Completa!')
      await user.click(weekMilestone)

      await waitFor(() => {
        expect(screen.getByText('Pontos disponíveis: 100 pts')).toBeInTheDocument()
      })

      expect(screen.getByText('Tarefas do Marco')).toBeInTheDocument()
      expect(screen.getByText('Consulta de retorno')).toBeInTheDocument()
      expect(screen.getByText('Avaliação médica')).toBeInTheDocument()
      expect(screen.getByText('Fotos comparativas')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Today's Tasks
  // ==========================================
  describe("Today's Tasks", () => {
    it('should display all today tasks', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('Tomar medicação da manhã')).toBeInTheDocument()
      expect(screen.getByText('08:00')).toBeInTheDocument()
      expect(screen.getByText('Fazer curativo')).toBeInTheDocument()
      expect(screen.getByText('09:00')).toBeInTheDocument()
      expect(screen.getByText('Consulta de retorno')).toBeInTheDocument()
      expect(screen.getByText('14:00')).toBeInTheDocument()
    })

    it('should show completed and pending tasks correctly', () => {
      render(<PatientDashboard />)

      const completedTask = screen.getByText('Tomar medicação da manhã')
      expect(completedTask.classList.contains('line-through')).toBe(true)

      const pendingTask = screen.getByText('Consulta de retorno')
      expect(pendingTask.classList.contains('line-through')).toBe(false)
    })
  })

  // ==========================================
  // Badges
  // ==========================================
  describe('Badges', () => {
    it('should display badges collection', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('Primeira Semana')).toBeInTheDocument()
      expect(screen.getByText('Foto Master')).toBeInTheDocument()
      expect(screen.getByText('Guerreiro')).toBeInTheDocument()
      expect(screen.getByText('Dedicado')).toBeInTheDocument()
      expect(screen.getByText('Campeão')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Interactions
  // ==========================================
  describe('Interactions', () => {
    it('should close milestone modal when close button clicked', async () => {
      const user = userEvent.setup()
      render(<PatientDashboard />)

      const milestone = screen.getByText('🏆 Uma Semana Completa!')
      await user.click(milestone)

      await waitFor(() => {
        expect(screen.getByText('Pontos disponíveis: 100 pts')).toBeInTheDocument()
      })

      const closeButton = screen.getByText('Fechar')
      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Pontos disponíveis: 100 pts')).not.toBeInTheDocument()
      })
    })

    it('should call logout when logout button clicked', async () => {
      const user = userEvent.setup()
      render(<PatientDashboard />)

      const logoutButton = screen.getByText('Sair')
      await user.click(logoutButton)

      expect(mockLogout).toHaveBeenCalled()
    })
  })

  // ==========================================
  // Motivational Message
  // ==========================================
  describe('Motivational Message', () => {
    it('should display motivational card', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('Você está indo muito bem! 🌟')).toBeInTheDocument()
      expect(
        screen.getByText(/Cada dia é uma vitória na sua jornada de recuperação/)
      ).toBeInTheDocument()
      expect(screen.getByText('Próximo marco em 3 dias')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Progress Visualization
  // ==========================================
  describe('Progress Visualization', () => {
    it('should show progress bar for current milestone', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('Progresso')).toBeInTheDocument()
      expect(screen.getByText('2/3 tarefas')).toBeInTheDocument()
    })

    it('should display milestone points and badges', () => {
      render(<PatientDashboard />)

      expect(screen.getByText('+50 pts')).toBeInTheDocument() // D+0
      expect(screen.getByText('🚀 Início da Jornada')).toBeInTheDocument()
      expect(screen.getByText('+100 pts')).toBeInTheDocument() // D+7
      expect(screen.getByText('🏆 Guerreiro da Semana')).toBeInTheDocument()
    })
  })
})
