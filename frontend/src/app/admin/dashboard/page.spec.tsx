import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminDashboard from './page'

// Mock dependencies
const mockPush = jest.fn()
const mockLogout = jest.fn()
const mockGetAdmin = jest.fn()

// Mutable object for auth store
const authStoreMock = {
  user: { email: 'admin@clinic.com', role: 'admin', name: 'Admin User' },
  logout: mockLogout,
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector?: any) => {
    return selector ? selector(authStoreMock) : authStoreMock;
  },
}))

jest.mock('@/lib/api', () => ({
  dashboardApi: {
    getAdmin: jest.fn(),
  },
}))

jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}))

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}))

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    authStoreMock.user = { email: 'admin@clinic.com', role: 'admin', name: 'Admin User' }
    const { dashboardApi } = require('@/lib/api')
    dashboardApi.getAdmin = mockGetAdmin
  })

  // ==========================================
  // Rendering Tests
  // ==========================================
  describe('Rendering', () => {
    it('should show loading state initially', () => {
      mockGetAdmin.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<AdminDashboard />)

      expect(screen.getByText('Carregando dashboard...')).toBeInTheDocument()
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
    })

    it('should render dashboard with mock data', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Clinic Companion')).toBeInTheDocument()
      })

      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Olá, Admin User')).toBeInTheDocument()
    })

    it('should render header with user name', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
      })
    })
  })

  // ==========================================
  // Data Loading
  // ==========================================
  describe('Data Loading', () => {
    it('should load dashboard data on mount', async () => {
      mockGetAdmin.mockResolvedValue({
        data: {
          overview: { totalPatients: 100 },
          quickStats: [],
        },
      })

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(mockGetAdmin).toHaveBeenCalled()
      })
    })
  })

  // ==========================================
  // Quick Stats Cards
  // ==========================================
  describe('Quick Stats Cards', () => {
    it('should render quick stats cards', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Taxa de Complicações')).toBeInTheDocument()
      })

      expect(screen.getByText('Adesão ao Protocolo')).toBeInTheDocument()
      expect(screen.getByText('Satisfação (NPS)')).toBeInTheDocument()
      expect(screen.getByText('ROI Mensal')).toBeInTheDocument()
    })

    it('should display stat values and trends', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('12%')).toBeInTheDocument()
      })

      expect(screen.getByText('92%')).toBeInTheDocument()
      expect(screen.getByText('92')).toBeInTheDocument()
      expect(screen.getByText('R$ 25.000')).toBeInTheDocument()

      // Check trends
      expect(screen.getByText('-65%')).toBeInTheDocument() // Complicações down
      expect(screen.getByText('+15%')).toBeInTheDocument() // Adesão up
    })
  })

  // ==========================================
  // Alerts Section
  // ==========================================
  describe('Alerts Section', () => {
    it('should render alerts when present', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Pacientes em Risco')).toBeInTheDocument()
      })

      expect(screen.getByText('3 pacientes com adesão abaixo de 50%')).toBeInTheDocument()
      expect(screen.getByText('Marcos de Hoje')).toBeInTheDocument()
      expect(screen.getByText('18 milestones agendados para hoje')).toBeInTheDocument()
    })

    it('should apply correct styling to alert types', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Pacientes em Risco')).toBeInTheDocument()
      })

      const warningAlert = screen.getByText('Pacientes em Risco').closest('div')
      expect(warningAlert).toHaveClass('bg-yellow-50')

      const infoAlert = screen.getByText('Marcos de Hoje').closest('div')
      expect(infoAlert).toHaveClass('bg-blue-50')
    })
  })

  // ==========================================
  // Charts Section
  // ==========================================
  describe('Charts Section', () => {
    it('should render evolution line chart', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Evolução (30 dias)')).toBeInTheDocument()
      })

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should render status distribution doughnut chart', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Distribuição por Status')).toBeInTheDocument()
      })

      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Tables Section
  // ==========================================
  describe('Tables Section', () => {
    it('should render recent surgeries table', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Cirurgias Recentes')).toBeInTheDocument()
      })

      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      expect(screen.getByText('Rinoplastia')).toBeInTheDocument()
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Abdominoplastia')).toBeInTheDocument()
    })

    it('should render gamification leaderboard', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Top Performers (Gamificação)')).toBeInTheDocument()
      })

      expect(screen.getByText('Ana Costa')).toBeInTheDocument()
      expect(screen.getByText('1200 pts')).toBeInTheDocument()
      expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
      expect(screen.getByText('980 pts')).toBeInTheDocument()
    })
  })

  // ==========================================
  // Interactions
  // ==========================================
  describe('Interactions', () => {
    it('should call logout when logout button clicked', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Clinic Companion')).toBeInTheDocument()
      })

      const logoutButton = screen.getByRole('button', { name: '' })
      await userEvent.click(logoutButton)

      expect(mockLogout).toHaveBeenCalled()
    })
  })

  // ==========================================
  // Data Loading
  // ==========================================
  describe('Data Loading', () => {
    it('should use API data when available', async () => {
      mockGetAdmin.mockResolvedValue({
        data: {
          overview: {
            totalPatients: 500,
            activePatients: 200,
            averageProgress: 75,
            averageAdherence: 95,
          },
          quickStats: [
            { label: 'Custom Stat', value: '100', trend: 'up', change: '+10%', color: 'blue' },
          ],
          patientsByStatus: { 'Pré-Op': 50 },
          recentSurgeries: [],
          activeTimelines: { total: 200, todayMilestones: 20, list: [] },
          gamification: { leaderboard: [], totalPointsDistributed: 20000, averageLevel: 3 },
          successMetrics: {},
          evolutionChart: {
            labels: ['Day 1'],
            datasets: [],
          },
          alerts: [],
        },
      })

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Custom Stat')).toBeInTheDocument()
      })

      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should fallback to mock data on API error', async () => {
      mockGetAdmin.mockRejectedValue(new Error('Network error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Taxa de Complicações')).toBeInTheDocument()
      })

      // Should show mock data
      expect(screen.getByText('12%')).toBeInTheDocument()
      expect(screen.getByText('347')).toBeFalsy() // totalPatients from mock
    })
  })

  // ==========================================
  // Progress Display
  // ==========================================
  describe('Progress Display', () => {
    it('should display progress bars for recent surgeries', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      })

      const progressTexts = screen.getAllByText(/\d+%/)
      expect(progressTexts.length).toBeGreaterThan(0)
    })
  })

  // ==========================================
  // Leaderboard Display
  // ==========================================
  describe('Leaderboard Display', () => {
    it('should show rank badges with correct colors', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Ana Costa')).toBeInTheDocument()
      })

      // Ranks should be visible
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should display points and badges for each user', async () => {
      mockGetAdmin.mockRejectedValue(new Error('API error'))

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('1200 pts')).toBeInTheDocument()
      })

      expect(screen.getByText('12 badges')).toBeInTheDocument()
      expect(screen.getByText('8 badges')).toBeInTheDocument()
      expect(screen.getByText('7 badges')).toBeInTheDocument()
    })
  })
})
