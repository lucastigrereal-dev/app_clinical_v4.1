import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  points?: number
  level?: number
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await api.post('/auth/login', { email, password })
          
          if (response.data.access_token) {
            const { access_token, user } = response.data
            
            set({
              user,
              token: access_token,
              isAuthenticated: true,
              isLoading: false,
            })
            
            // Configurar token no header das próximas requisições
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            
            return { success: true, user }
          }
          
          set({ isLoading: false })
          return { success: false, message: 'Login falhou' }
        } catch (error: any) {
          set({ isLoading: false })
          
          // Se a API não estiver rodando, usar dados mockados para demo
          if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            // Login mockado para demonstração
            const mockUsers: Record<string, User> = {
              'admin@clinic.com': {
                id: '1',
                email: 'admin@clinic.com',
                name: 'Admin Master',
                role: 'admin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
              },
              'dr.silva@clinic.com': {
                id: '2',
                email: 'dr.silva@clinic.com',
                name: 'Dr. Silva',
                role: 'doctor',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor'
              },
              'maria@email.com': {
                id: '3',
                email: 'maria@email.com',
                name: 'Maria Santos',
                role: 'patient',
                points: 450,
                level: 2,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria'
              },
            }
            
            const mockPasswords: Record<string, string> = {
              'admin@clinic.com': 'admin123',
              'dr.silva@clinic.com': 'medico123',
              'maria@email.com': 'paciente123',
            }
            
            if (mockUsers[email] && mockPasswords[email] === password) {
              const user = mockUsers[email]
              const mockToken = 'mock-jwt-token-' + Date.now()
              
              set({
                user,
                token: mockToken,
                isAuthenticated: true,
                isLoading: false,
              })
              
              return { success: true, user }
            }
            
            return { success: false, message: 'Credenciais inválidas' }
          }
          
          return { 
            success: false, 
            message: error.response?.data?.message || 'Erro ao fazer login' 
          }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        
        // Limpar token do header
        delete api.defaults.headers.common['Authorization']
        
        // Redirecionar para login
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      checkAuth: async () => {
        const token = get().token
        
        if (!token) {
          set({ isAuthenticated: false })
          return false
        }
        
        try {
          const response = await api.get('/auth/profile')
          
          if (response.data.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
            })
            return true
          }
        } catch (error) {
          // Se falhar, usar dados mockados se houver token mock
          if (token.startsWith('mock-jwt-token-')) {
            return true
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
        
        return false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
