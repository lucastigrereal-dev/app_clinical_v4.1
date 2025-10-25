'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { 
  Trophy, 
  Star, 
  Target,
  Calendar,
  CheckCircle,
  Circle,
  Lock,
  TrendingUp,
  Award,
  Heart,
  Activity,
  Camera,
  MessageSquare,
  Zap,
  Gift,
  Flag,
  Clock
} from 'lucide-react'

interface TimelineMilestone {
  day: number
  title: string
  description: string
  date: Date
  status: 'completed' | 'current' | 'upcoming' | 'locked'
  points: number
  tasks: {
    id: string
    title: string
    completed: boolean
    points: number
  }[]
  badge?: {
    name: string
    icon: string
    rarity: 'bronze' | 'silver' | 'gold' | 'diamond'
  }
}

export default function PatientDashboard() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [currentDay, setCurrentDay] = useState(7) // D+7 para demonstração
  const [totalPoints, setTotalPoints] = useState(450)
  const [level, setLevel] = useState(2)
  const [streak, setStreak] = useState(5)
  const [adherence, setAdherence] = useState(92)
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null)

  // Timeline D+0 até D+60
  const timelineMilestones: TimelineMilestone[] = [
    {
      day: 0,
      title: '🚀 Dia da Cirurgia',
      description: 'Início da jornada de recuperação',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed',
      points: 50,
      tasks: [
        { id: '1', title: 'Tomar medicação prescrita', completed: true, points: 10 },
        { id: '2', title: 'Manter repouso absoluto', completed: true, points: 10 },
        { id: '3', title: 'Aplicar compressas', completed: true, points: 10 },
        { id: '4', title: 'Registrar sintomas', completed: true, points: 10 },
        { id: '5', title: 'Tirar foto inicial', completed: true, points: 10 },
      ],
      badge: { name: 'Início da Jornada', icon: '🚀', rarity: 'bronze' }
    },
    {
      day: 1,
      title: '💪 Primeiro Dia Pós-Op',
      description: 'Monitoramento intensivo',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      status: 'completed',
      points: 30,
      tasks: [
        { id: '1', title: 'Medicação matinal', completed: true, points: 10 },
        { id: '2', title: 'Medicação noturna', completed: true, points: 10 },
        { id: '3', title: 'Hidratação adequada', completed: true, points: 5 },
        { id: '4', title: 'Alimentação leve', completed: true, points: 5 },
      ],
    },
    {
      day: 3,
      title: '📊 Terceiro Dia - Checkpoint',
      description: 'Avaliação do progresso inicial',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: 'completed',
      points: 40,
      tasks: [
        { id: '1', title: 'Avaliar inchaço', completed: true, points: 10 },
        { id: '2', title: 'Verificar curativos', completed: true, points: 10 },
        { id: '3', title: 'Foto de progresso', completed: true, points: 10 },
        { id: '4', title: 'Questionário de bem-estar', completed: true, points: 10 },
      ],
    },
    {
      day: 7,
      title: '🏆 Uma Semana Completa!',
      description: 'Consulta de retorno importante',
      date: new Date(),
      status: 'current',
      points: 100,
      tasks: [
        { id: '1', title: 'Consulta de retorno', completed: false, points: 50 },
        { id: '2', title: 'Avaliação médica', completed: false, points: 30 },
        { id: '3', title: 'Fotos comparativas', completed: false, points: 20 },
      ],
      badge: { name: 'Guerreiro da Semana', icon: '🏆', rarity: 'silver' }
    },
    {
      day: 10,
      title: '🚶 D+10 - Evolução',
      description: 'Início de atividades leves',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      points: 25,
      tasks: [
        { id: '1', title: 'Iniciar caminhadas leves', completed: false, points: 15 },
        { id: '2', title: 'Massagem linfática', completed: false, points: 10 },
      ],
    },
    {
      day: 15,
      title: '⭐ Duas Semanas',
      description: 'Checkpoint importante',
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      points: 80,
      tasks: [
        { id: '1', title: 'Remoção de pontos', completed: false, points: 40 },
        { id: '2', title: 'Avaliação de cicatrização', completed: false, points: 20 },
        { id: '3', title: 'Atualização do protocolo', completed: false, points: 20 },
      ],
      badge: { name: 'Meio Caminho', icon: '⭐', rarity: 'silver' }
    },
    {
      day: 30,
      title: '👑 Um Mês Completo!',
      description: 'Marco principal da recuperação',
      date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      status: 'locked',
      points: 150,
      tasks: [
        { id: '1', title: 'Consulta de 30 dias', completed: false, points: 50 },
        { id: '2', title: 'Fotos antes/depois', completed: false, points: 30 },
        { id: '3', title: 'Medições e avaliações', completed: false, points: 30 },
        { id: '4', title: 'Questionário de satisfação', completed: false, points: 20 },
        { id: '5', title: 'Liberação para atividades', completed: false, points: 20 },
      ],
      badge: { name: 'Mestre do Mês', icon: '👑', rarity: 'gold' }
    },
    {
      day: 45,
      title: '💎 Mês e Meio',
      description: 'Consolidação dos resultados',
      date: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
      status: 'locked',
      points: 40,
      tasks: [
        { id: '1', title: 'Atividades físicas normais', completed: false, points: 20 },
        { id: '2', title: 'Cuidados com cicatriz', completed: false, points: 20 },
      ],
    },
    {
      day: 60,
      title: '🌟 DOIS MESES - VITÓRIA!',
      description: 'Protocolo completo! Celebração!',
      date: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      status: 'locked',
      points: 200,
      tasks: [
        { id: '1', title: 'Consulta final', completed: false, points: 50 },
        { id: '2', title: 'Fotos finais', completed: false, points: 40 },
        { id: '3', title: 'Avaliação completa', completed: false, points: 40 },
        { id: '4', title: 'Questionário final', completed: false, points: 30 },
        { id: '5', title: 'Celebração da conquista!', completed: false, points: 40 },
      ],
      badge: { name: 'Campeão do Protocolo', icon: '🌟', rarity: 'diamond' }
    },
  ]

  const badges = [
    { name: 'Primeira Semana', icon: '🏅', earned: true, rarity: 'bronze' },
    { name: 'Foto Master', icon: '📸', earned: true, rarity: 'silver' },
    { name: 'Adesão Perfeita', icon: '💯', earned: false, rarity: 'gold' },
    { name: 'Guerreiro', icon: '⚔️', earned: true, rarity: 'bronze' },
    { name: 'Dedicado', icon: '🎯', earned: false, rarity: 'silver' },
    { name: 'Campeão', icon: '👑', earned: false, rarity: 'diamond' },
  ]

  const todayTasks = [
    { id: '1', title: 'Tomar medicação da manhã', completed: true, points: 10, time: '08:00' },
    { id: '2', title: 'Fazer curativo', completed: true, points: 15, time: '09:00' },
    { id: '3', title: 'Consulta de retorno', completed: false, points: 50, time: '14:00' },
    { id: '4', title: 'Tirar foto de progresso', completed: false, points: 20, time: '16:00' },
    { id: '5', title: 'Medicação da noite', completed: false, points: 10, time: '20:00' },
  ]

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/')
    }
  }, [user, router])

  const completeTask = (taskId: string) => {
    // Simular conclusão de tarefa
    const task = todayTasks.find(t => t.id === taskId)
    if (task && !task.completed) {
      setTotalPoints(prev => prev + task.points)
      task.completed = true
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'current': return <Circle className="w-6 h-6 text-blue-500 animate-pulse" />
      case 'upcoming': return <Circle className="w-6 h-6 text-gray-400" />
      case 'locked': return <Lock className="w-6 h-6 text-gray-300" />
      default: return <Circle className="w-6 h-6 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Minha Jornada de Recuperação
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-900">{totalPoints} pts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-gray-900">Nível {level}</span>
              </div>
              <button onClick={logout} className="text-gray-600 hover:text-gray-900">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">D+{currentDay}</span>
            </div>
            <p className="text-gray-600">Dia Atual</p>
            <div className="mt-2 text-sm text-purple-600">
              53 dias restantes
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{adherence}%</span>
            </div>
            <p className="text-gray-600">Adesão ao Protocolo</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${getProgressColor(adherence)} h-2 rounded-full`} style={{ width: `${adherence}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold">{streak}</span>
            </div>
            <p className="text-gray-600">Dias em Sequência</p>
            <div className="mt-2 text-sm text-orange-600">
              🔥 Mantenha o ritmo!
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">3/6</span>
            </div>
            <p className="text-gray-600">Badges Conquistados</p>
            <div className="mt-2 flex space-x-1">
              {badges.slice(0, 4).map((badge, i) => (
                <span key={i} className={badge.earned ? '' : 'opacity-30'}>
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Flag className="w-6 h-6 mr-2 text-purple-500" />
                Timeline D+0 até D+60
              </h2>
              
              <div className="space-y-4">
                {timelineMilestones.map((milestone, index) => (
                  <div
                    key={milestone.day}
                    className={`relative flex items-start p-4 rounded-lg cursor-pointer transition-all
                      ${milestone.status === 'current' ? 'bg-blue-50 border-2 border-blue-500' : 
                        milestone.status === 'completed' ? 'bg-green-50' : 
                        milestone.status === 'locked' ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50'}
                    `}
                    onClick={() => milestone.status !== 'locked' && setSelectedMilestone(milestone)}
                  >
                    {/* Timeline Line */}
                    {index < timelineMilestones.length - 1 && (
                      <div className={`absolute left-9 top-12 bottom-0 w-0.5 
                        ${milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'}`} 
                      />
                    )}
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 mr-4">
                      {getMilestoneIcon(milestone.status)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          {milestone.title}
                        </h3>
                        <span className="text-sm font-medium text-gray-500">
                          D+{milestone.day}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {milestone.description}
                      </p>
                      
                      {/* Points and Badge */}
                      <div className="flex items-center mt-2 space-x-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          +{milestone.points} pts
                        </span>
                        {milestone.badge && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${milestone.badge.rarity === 'diamond' ? 'bg-cyan-100 text-cyan-800' :
                              milestone.badge.rarity === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                              milestone.badge.rarity === 'silver' ? 'bg-gray-100 text-gray-800' :
                              'bg-orange-100 text-orange-800'}
                          `}>
                            {milestone.badge.icon} {milestone.badge.name}
                          </span>
                        )}
                      </div>
                      
                      {/* Progress Bar for Current */}
                      {milestone.status === 'current' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progresso</span>
                            <span>2/3 tarefas</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '66%' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Today's Tasks & Badges */}
          <div className="space-y-6">
            {/* Today's Tasks */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Tarefas de Hoje
              </h3>
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-lg border
                      ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => !task.completed && completeTask(task.id)}
                        className="mr-3"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                        )}
                      </button>
                      <div>
                        <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">{task.time}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${task.completed ? 'text-green-600' : 'text-purple-600'}`}>
                      +{task.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges Collection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Minhas Conquistas
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center p-3 rounded-lg
                      ${badge.earned ? 
                        badge.rarity === 'diamond' ? 'bg-cyan-50' :
                        badge.rarity === 'gold' ? 'bg-yellow-50' :
                        badge.rarity === 'silver' ? 'bg-gray-50' :
                        'bg-orange-50'
                        : 'bg-gray-100 opacity-50'}
                    `}
                  >
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-xs text-center text-gray-700">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">
                Você está indo muito bem! 🌟
              </h3>
              <p className="text-sm opacity-90">
                Cada dia é uma vitória na sua jornada de recuperação. Continue seguindo o protocolo e em breve você verá resultados incríveis!
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs opacity-75">Próximo marco em 3 dias</span>
                <Gift className="w-6 h-6 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedMilestone.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedMilestone.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900">
                  Pontos disponíveis: {selectedMilestone.points} pts
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Tarefas do Marco
                </h3>
                <div className="space-y-2">
                  {selectedMilestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-900'}>
                          {task.title}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-purple-600">
                        +{task.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMilestone.badge && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Badge Especial Disponível:
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{selectedMilestone.badge.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedMilestone.badge.name}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        Raridade: {selectedMilestone.badge.rarity}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Fechar
                </button>
                {selectedMilestone.status === 'current' && (
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Completar Tarefas
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
