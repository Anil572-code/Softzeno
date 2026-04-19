import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { Customer } from '@/types/customer.types'

export const customerService = {
  getCustomers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<Customer>>('/customers', { params }).then(r => r.data),
  getCustomer: (id: string) => api.get<Customer>(`/customers/${id}`).then(r => r.data),
  createCustomer: (data: Partial<Customer>) => api.post<Customer>('/customers', data).then(r => r.data),
  updateCustomer: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data).then(r => r.data),
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`).then(r => r.data),
  adjustLoyalty: (id: string, points: number, notes?: string) =>
    api.post(`/customers/${id}/loyalty/adjust`, { points, notes }).then(r => r.data),
}
