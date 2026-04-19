export interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  branchId?: string
  avatar?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterRequest {
  businessName: string
  businessType: string
  ownerName: string
  email: string
  phone: string
  password: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}
