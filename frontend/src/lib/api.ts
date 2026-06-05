import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })
          const { access_token, refresh_token } = res.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          original.headers.Authorization = `Bearer ${access_token}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
}

// ── Transactions ──────────────────────────────────
export const transactionApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/transactions/', { params }),
  create: (data: Record<string, unknown>) =>
    api.post('/transactions/', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/transactions/${id}`, data),
  delete: (id: number) =>
    api.delete(`/transactions/${id}`),
}

// ── Profile ───────────────────────────────────────
export const profileApi = {
  get: () => api.get('/profile/'),
  onboarding: (data: Record<string, unknown>) =>
    api.post('/profile/onboarding', data),
  update: (data: Record<string, unknown>) =>
    api.put('/profile/', data),
  healthScore: () => api.get('/profile/health-score'),
  emergencyFund: () => api.get('/profile/emergency-fund'),
  budget: () => api.get('/profile/budget'),
  createBudget: (data: Record<string, unknown>) =>
    api.post('/profile/budget', data),
  trends: (months?: number) =>
    api.get('/profile/analytics/trends', { params: { months } }),
  monthly: (month?: number, year?: number) =>
    api.get('/profile/analytics/monthly', { params: { month, year } }),
}

// ── Goals ─────────────────────────────────────────
export const goalsApi = {
  list: () => api.get('/goals/'),
  create: (data: Record<string, unknown>) =>
    api.post('/goals/', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/goals/${id}`, data),
  contribute: (id: number, amount: number) =>
    api.post(`/goals/${id}/contribute`, { amount }),
  delete: (id: number) =>
    api.delete(`/goals/${id}`),
}

// ── AI ────────────────────────────────────────────
export const aiApi = {
  insights: () => api.get('/ai/insights'),
  chat: (message: string, history: { role: string; content: string }[]) =>
    api.post('/ai/chat', { message, history }),
  budgetAdvice: () => api.get('/ai/budget-advice'),
}

// ── Projections ───────────────────────────────────
export const projectionsApi = {
  get: () => api.get('/projections/'),
}

// ── Import ────────────────────────────────────────
export const importApi = {
  mpesa: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/import/mpesa', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
