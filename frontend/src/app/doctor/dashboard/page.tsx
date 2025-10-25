'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { 
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  Star,
  Heart,
  Target,
  LogOut,
  Phone,
  Mail,
  FileText,
  Camera
} from 'lucide-react'

interface Patient {
  id: string
  name: string
  procedure: string
  procedureDate: Date
  currentDay: number
  progress: number
  adherence: number
  status: string
  phone: string
  email: string
  nextMilestone: string
}

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState<'patients' | 'schedule' | 'metrics'>('patients')

  // Dados mockados para demonstração
  const patients: Patient[] = [
    {
      id: '1',
      name: 'Maria Santos',
      procedure: 'Rinoplastia',
      procedureDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      currentDay: 7,
      progress: 35,
      adherence: 92,
      status: 'post-op',
      phone: '(11) 99999-8888',
      email: 'maria@email.com',
      nextMilestone: 'Consulta de retorno D+7'
    },
    {
      id: '2',
      name: 'João Silva',
      procedure: 'Abdominoplastia',
      procedureDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      currentDay: 14,
      progress: 65,
      adherence: 88,
      status: 'recovery',
      phone: '(11) 88888-7777',
      email: 'joao@email.com',
      nextMilestone: 'Remoção de pontos D+15'
    },
    {
      id: '3',
      name: 'Ana Costa',
      procedure: 'Mamoplastia',
      procedureDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      currentDay: 30,
      progress: 85,
      adherence: 95,
      status: 'recovery',
      phone: '(11) 77777-6666',
      email: 'ana@email.com',
      nextMilestone: 'Consulta de 30 dias'
    },
    {
      id: '4',
      name: 'Pedro Oliveira',
      procedure: 'Lipoaspiração',
      procedureDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      currentDay: 3,
      progress: 15,
      adherence: 100,
      status: 'post-op',
      phone: '(11) 66666-5555',
      email: 'pedro@email.com',
      nextMilestone: 'Checkpoint D+3'
    },
  ]

  const todaySchedule = [
    { time: '08:00', patient: 'Maria Santos', type: 'Retorno D+7', status: 'confirmed' },
    { time: '09:00', patient: 'João Silva', type: 'Avaliação D+14', status: 'confirmed' },
    { time: '10:00', patient: 'Ana Costa', type: 'Consulta D+30', status: 'confirmed' },
    { time: '11:00', patient: 'Novo Paciente', type: 'Primeira Consulta', status: 'pending' },
    { time: '14:00', patient: 'Pedro Oliveira', type: 'Pré-operatório', status: 'confirmed' },
    { time: '15:00', patient: 'Lucia Ferreira', type: 'Retorno D+15', status: 'confirmed' },
    { time: '16:00', patient: 'Carlos Mendes', type: 'Avaliação', status: 'pending' },
  ]

  const metrics = {
    totalPatients: 124,
    activePatients: 48,
    averageAdherence: 91,
    complicationRate: 8,
    patientSatisfaction: 95,
    monthlyRevenue: 125000,
    surgeriesToday: 2,
    consultationsToday: 7,
  }

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      router.push('/')
    }
  }, [user, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'post-op': return 'bg-yellow-100 text-yellow-800'
      case 'recovery': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Médico
              </h1>
              <span className="ml-3 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                {user?.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                CRM-SP 123456
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activePatients}</p>
                <p className="text-xs text-gray-500 mt-1">de {metrics.totalPatients} total</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Adesão</p>
                <p className="text-2xl font-bold text-green-600">{metrics.averageAdherence}%</p>
                <p className="text-xs text-green-500 mt-1">↑ 5% este mês</p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa Complicações</p>
                <p className="text-2xl font-bold text-green-600">{metrics.complicationRate}%</p>
                <p className="text-xs text-green-500 mt-1">↓ Menor que média</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfação</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.patientSatisfaction}</p>
                <p className="text-xs text-purple-500 mt-1">NPS Score</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'patients' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Meus Pacientes
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'schedule' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Agenda do Dia
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'metrics' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Métricas
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pacientes em Acompanhamento
                  </h3>
                </div>
                <div className="divide-y">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {patient.name}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                              {patient.status === 'post-op' ? 'Pós-Op' : 
                               patient.status === 'recovery' ? 'Recuperação' : 'Completo'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{patient.procedure} • D+{patient.currentDay}</p>
                            <p className="text-xs">{patient.nextMilestone}</p>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Progresso</p>
                              <div className="flex items-center mt-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`${getProgressColor(patient.progress)} h-2 rounded-full`}
                                    style={{ width: `${patient.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">{patient.progress}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Adesão</p>
                              <div className="flex items-center mt-1">
                                <Heart className="w-4 h-4 text-red-500 mr-1" />
                                <span className="text-sm font-medium">{patient.adherence}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Patient Detail */}
            <div>
              {selectedPatient ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detalhes do Paciente
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Procedimento</p>
                      <p className="font-medium">{selectedPatient.procedure}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data da Cirurgia</p>
                      <p className="font-medium">
                        {selectedPatient.procedureDate.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dia Atual</p>
                      <p className="font-medium">D+{selectedPatient.currentDay}</p>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Prontuário
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Phone className="w-4 h-4 mr-2" />
                        Ligar
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        <Camera className="w-4 h-4 mr-2" />
                        Ver Fotos
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-500 text-center">
                    Selecione um paciente para ver detalhes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Agenda de Hoje
                </h3>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            <div className="divide-y">
              {todaySchedule.map((appointment, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.time} - {appointment.patient}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Mensal
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Cirurgias Realizadas</span>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Consultas de Retorno</span>
                    <span className="font-medium">168</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Taxa de Sucesso</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Alertas e Pendências
              </h3>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      3 pacientes com adesão baixa
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Requerem atenção especial
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      5 consultas de retorno esta semana
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Confirmar agendamentos
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-green-50 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Meta mensal: 92% atingida
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Faltam 4 procedimentos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
