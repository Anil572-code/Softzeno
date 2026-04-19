import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { Branch } from '@/types/branch.types'

export const branchService = {
  getBranches: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<Branch>>('/branches', { params }).then(r => r.data),
  getBranch: (id: string) => api.get<Branch>(`/branches/${id}`).then(r => r.data),
  createBranch: (data: Partial<Branch>) => api.post<Branch>('/branches', data).then(r => r.data),
  updateBranch: (id: string, data: Partial<Branch>) => api.put<Branch>(`/branches/${id}`, data).then(r => r.data),
  deleteBranch: (id: string) => api.delete(`/branches/${id}`).then(r => r.data),
}
