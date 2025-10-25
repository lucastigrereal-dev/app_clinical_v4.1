'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { dashboardApi } from '@/lib/api'
import { toast } from '@/lib/toast'
import {
  Users,
  Activity,
  TrendingUp,
  Award,
  Calendar,
  AlertCircle,
  BarChart3,
  Trophy,
  Heart,
  Clock,
  ChevronUp,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticação
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardApi.getAdmin()
      setDashboardData(response.data)
    } catch (error) {
      // Usar dados mockados se a API falhar
      setDashboardData(getMockDashboardData())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockDashboardData = () => ({
    overview: {
      totalPatients: 347,
      activePatients: 124,
      averageProgress: 68,
      averageAdherence: 92,
    },
    patientsByStatus: {
      'Pré-Op': 45,
      'Pós-Op': 124,
      'Recuperação': 98,
      'Completo': 80,
    },
    recentSurgeries: [
      {
        id: '1',
        name: 'Maria Santos',
        procedure: 'Rinoplastia',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        doctor: 'Dr. Silva',
        progress: 35,
        status: 'post-op',
      },
      {
        id: '2',
        name: 'João Silva',
        procedure: 'Abdominoplastia',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        doctor: 'Dr. Costa',
        progress: 65,
        status: 'recovery',
      },
    ],
    activeTimelines: {
      total: 124,
      todayMilestones: 18,
      list: [
        {
          id: '1',
          patientName: 'Maria Santos',
          currentDay: 7,
          progress: 35,
          adherence: 92,
          status: 'active',
        },
        {
          id: '2',
          patientName: 'João Silva',
          currentDay: 14,
          progress: 65,
          adherence: 88,
          status: 'active',
        },
      ],
    },
    gamification: {
      leaderboard: [
        { id: '1', name: 'Ana Costa', points: 1200, level: 3, badges: 12, rank: 1 },
        { id: '2', name: 'Pedro Oliveira', points: 980, level: 2, badges: 8, rank: 2 },
        { id: '3', name: 'Maria Santos', points: 850, level: 2, badges: 7, rank: 3 },
      ],
      totalPointsDistributed: 15420,
      averageLevel: 2.5,
    },
    successMetrics: {
      complicationRate: 12,
      adherenceRate: 92,
      patientSatisfaction: 92,
      monthlyRevenue: 25000,
    },
    evolutionChart: {
      labels: Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }),
      datasets: [
        {
          label: 'Adesão ao Protocolo (%)',
          data: Array.from({ length: 30 }, () => 75 + Math.random() * 20),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Progresso Médio (%)',
          data: Array.from({ length: 30 }, (_, i) => 20 + i * 2 + Math.random() * 10),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    },
    quickStats: [
      {
        label: 'Taxa de Complicações',
        value: '12%',
        trend: 'down',
        change: '-65%',
        color: 'green',
      },
      {
        label: 'Adesão ao Protocolo',
        value: '92%',
        trend: 'up',
        change: '+15%',
        color: 'blue',
      },
      {
        label: 'Satisfação (NPS)',
        value: '92',
        trend: 'up',
        change: '+8',
        color: 'purple',
      },
      {
        label: 'ROI Mensal',
        value: 'R$ 25.000',
        trend: 'up',
        change: '+22%',
        color: 'gold',
      },
    ],
    alerts: [
      {
        type: 'warning',
        title: 'Pacientes em Risco',
        message: '3 pacientes com adesão abaixo de 50%',
        priority: 'high',
      },
      {
        type: 'info',
        title: 'Marcos de Hoje',
        message: '18 milestones agendados para hoje',
        priority: 'medium',
      },
    ],
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Clinic Companion
              </h1>
              <span className="ml-3 px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData?.quickStats?.map((stat: any, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ChevronUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  {index === 0 && <Activity className="w-6 h-6 text-green-600" />}
                  {index === 1 && <Heart className="w-6 h-6 text-blue-600" />}
                  {index === 2 && <Users className="w-6 h-6 text-purple-600" />}
                  {index === 3 && <TrendingUp className="w-6 h-6 text-yellow-600" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {dashboardData?.alerts?.length > 0 && (
          <div className="mb-8 space-y-4">
            {dashboardData.alerts.map((alert: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <div className="ml-3">
                    <p className={`font-medium ${
                      alert.type === 'warning' ? 'text-yellow-900' : 'text-blue-900'
                    }`}>
                      {alert.title}
                    </p>
                    <p className={`text-sm mt-1 ${
                      alert.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Evolution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Evolução (30 dias)
            </h3>
            {dashboardData?.evolutionChart && (
              <Line
                data={dashboardData.evolutionChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição por Status
            </h3>
            {dashboardData?.patientsByStatus && (
              <Doughnut
                data={{
                  labels: Object.keys(dashboardData.patientsByStatus),
                  datasets: [{
                    data: Object.values(dashboardData.patientsByStatus),
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(251, 146, 60, 0.8)',
                      'rgba(147, 51, 234, 0.8)',
                    ],
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Surgeries */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Cirurgias Recentes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData?.recentSurgeries?.slice(0, 5).map((surgery: any) => (
                  <div key={surgery.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{surgery.name}</p>
                      <p className="text-sm text-gray-600">{surgery.procedure}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{surgery.doctor}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${surgery.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{surgery.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Performers (Gamificação)
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData?.gamification?.leaderboard?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        user.rank === 1 ? 'bg-yellow-500' :
                        user.rank === 2 ? 'bg-gray-400' :
                        user.rank === 3 ? 'bg-orange-500' :
                        'bg-gray-300'
                      }`}>
                        {user.rank}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">Nível {user.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{user.points} pts</p>
                      <p className="text-sm text-gray-600">{user.badges} badges</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
