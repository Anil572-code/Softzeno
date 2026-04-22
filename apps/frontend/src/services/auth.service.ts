import api from '@/lib/api'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth.types'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data).then((r) => r.data.data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/register', data).then((r) => r.data.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api
      .post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken })
      .then((r) => r.data.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),

  getProfile: () =>
    api.get<ApiResponse<LoginResponse['user']>>('/auth/profile').then((r) => r.data.data),
}
