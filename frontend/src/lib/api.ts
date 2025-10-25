import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    // Pegar token do localStorage se existir
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        try {
          const { state } = JSON.parse(authData)
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`
          }
        } catch (error) {
          console.error('Error parsing auth data:', error)
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Funções auxiliares para chamadas comuns
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (data: any) => 
    api.post('/auth/register', data),
  
  profile: () => 
    api.get('/auth/profile'),
  
  validate: (token: string) => 
    api.post('/auth/validate', { token }),
}

export const patientsApi = {
  getAll: () => 
    api.get('/patients'),
  
  getById: (id: string) => 
    api.get(`/patients/${id}`),
  
  create: (data: any) => 
    api.post('/patients', data),
  
  update: (id: string, data: any) => 
    api.patch(`/patients/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/patients/${id}`),
  
  getStatistics: () => 
    api.get('/patients/statistics'),
  
  getRecentSurgeries: (days: number = 7) => 
    api.get(`/patients/recent-surgeries?days=${days}`),
}

export const timelineApi = {
  getAll: () => 
    api.get('/timeline'),
  
  getById: (id: string) => 
    api.get(`/timeline/${id}`),
  
  getByPatient: (patientId: string) => 
    api.get(`/timeline/patient/${patientId}`),
  
  create: (data: any) => 
    api.post('/timeline', data),
  
  updateProgress: (id: string) => 
    api.patch(`/timeline/${id}/progress`),
  
  completeMilestone: (timelineId: string, milestoneId: string, data: any) => 
    api.post(`/timeline/${timelineId}/milestone/${milestoneId}/complete`, data),
  
  getActiveTimelines: () => 
    api.get('/timeline/active'),
  
  getTodayMilestones: () => 
    api.get('/timeline/milestones/today'),
}

export const gamificationApi = {
  getUserStats: (userId: string) => 
    api.get(`/gamification/user/${userId}/stats`),
  
  getUserBadges: (userId: string) => 
    api.get(`/gamification/user/${userId}/badges`),
  
  getLeaderboard: (limit: number = 10) => 
    api.get(`/gamification/leaderboard?limit=${limit}`),
  
  addPoints: (userId: string, points: number) => 
    api.post(`/gamification/user/${userId}/points?points=${points}`),
}

export const dashboardApi = {
  getAdmin: () => 
    api.get('/dashboard/admin'),
  
  getDoctor: (doctorId: string) => 
    api.get(`/dashboard/doctor/${doctorId}`),
  
  getPatient: (patientId: string) => 
    api.get(`/dashboard/patient/${patientId}`),
  
  getMy: () => 
    api.get('/dashboard/my'),
}
