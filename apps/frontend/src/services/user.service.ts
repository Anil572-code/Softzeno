import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { User } from '@/types/auth.types'

export const userService = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<User>>('/users', { params }).then(r => r.data),
}
