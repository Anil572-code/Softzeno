import api from '@/lib/api'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth.types'

export const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data).then(r => r.data),
  register: (data: RegisterRequest) => api.post<LoginResponse>('/auth/register', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  refreshToken: (refreshToken: string) => api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }).then(r => r.data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }).then(r => r.data),
  getProfile: () => api.get('/auth/profile').then(r => r.data),
}
