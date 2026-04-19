import api from '@/lib/api'
import type { Customer } from '@/types/customer.types'

export const customerService = {
  getCustomers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: Customer[]; total: number }>('/customers', { params }).then(r => r.data),
  getCustomer: (id: string) => api.get<Customer>(`/customers/${id}`).then(r => r.data),
  createCustomer: (data: Partial<Customer>) => api.post<Customer>('/customers', data).then(r => r.data),
  updateCustomer: (id: string, data: Partial<Customer>) => api.patch<Customer>(`/customers/${id}`, data).then(r => r.data),
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`).then(r => r.data),
  getCustomerSales: (id: string) => api.get(`/customers/${id}/sales`).then(r => r.data),
  searchCustomers: (query: string) => api.get<Customer[]>('/customers/search', { params: { q: query } }).then(r => r.data),
}
