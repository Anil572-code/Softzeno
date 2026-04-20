import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { Expense } from '@/types/expense.types'

export const expenseService = {
  getExpenses: (params?: { page?: number; limit?: number; search?: string; branchId?: string }) =>
    api.get<PaginatedResponse<Expense>>('/expenses', { params }).then(r => r.data),
  getExpense: (id: string) => api.get<Expense>(`/expenses/${id}`).then(r => r.data),
  createExpense: (data: {
    category: string
    title: string
    amount: number
    description?: string
    receiptUrl?: string
    expenseDate: string
    branchId: string
  }) => api.post<Expense>('/expenses', data).then(r => r.data),
  updateExpense: (id: string, data: Partial<Expense>) => api.put<Expense>(`/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`).then(r => r.data),
}
