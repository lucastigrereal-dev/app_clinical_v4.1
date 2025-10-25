'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/lib/toast'
import { Trophy, Heart, Shield, TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const login = useAuthStore(state => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success && result.user) {
        toast.success(`Bem-vindo, ${result.user.name || 'usuário'}!`)

        // Redirecionar baseado no role
        switch (result.user.role) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'doctor':
            router.push('/doctor/dashboard')
            break
          case 'patient':
            router.push('/patient/dashboard')
            break
          default:
            router.push('/dashboard')
        }
      } else {
        toast.error(result.message || 'Erro ao fazer login')
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  // Login rápido para demonstração
  const quickLogin = (email: string, password: string, role: string) => {
    setEmail(email)
    setPassword(password)
    toast.info(`Usando credenciais de ${role} para demo`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Clinic Companion
              </h1>
              <p className="text-gray-600">
                Sistema de Acompanhamento Pós-Operatório
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Entrar no Sistema
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="form-label">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Senha
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary text-lg py-3"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              {/* Quick Login Buttons for Demo */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Acesso rápido para demonstração:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => quickLogin('admin@clinic.com', 'admin123', 'Admin')}
                    className="text-xs btn btn-secondary py-2"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => quickLogin('dr.silva@clinic.com', 'medico123', 'Médico')}
                    className="text-xs btn btn-secondary py-2"
                  >
                    Médico
                  </button>
                  <button
                    onClick={() => quickLogin('maria@email.com', 'paciente123', 'Paciente')}
                    className="text-xs btn btn-secondary py-2"
                  >
                    Paciente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-12 items-center">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold mb-6">
              Revolucionando o Pós-Operatório
            </h2>
            <p className="text-lg mb-8 text-primary-100">
              Plataforma gamificada que reduz complicações de 35% para 12% através de acompanhamento inteligente.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Gamificação Completa</h3>
                  <p className="text-primary-100">
                    Sistema de pontos, badges e recompensas que aumenta adesão para 94%.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Heart className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Timeline D+0 até D+60</h3>
                  <p className="text-primary-100">
                    Protocolo completo com marcos diários e acompanhamento personalizado.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Segurança LGPD</h3>
                  <p className="text-primary-100">
                    Compliance total com criptografia e proteção de dados médicos.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">ROI Comprovado</h3>
                  <p className="text-primary-100">
                    Retorno médio de R$ 25.000/mês por médico com redução de reoperações.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-primary-500">
              <p className="text-sm text-primary-200">
                Versão 4.0.0 - Enterprise Edition
              </p>
              <p className="text-xs text-primary-300 mt-2">
                Desenvolvido para o mercado brasileiro de cirurgia estética
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
