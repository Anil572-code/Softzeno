import api from '@/lib/api'
import type { Sale, SaleStats } from '@/types/sale.types'
import type { CartItem } from '@/store/cart.store'

interface CreateSaleData {
  items: CartItem[]
  customerId?: string | null
  discount: number
  discountType: 'fixed' | 'percent'
  couponCode?: string | null
  paymentMethod: string
  amountPaid: number
  notes?: string
  orderType: string
  tableId?: string | null
}

export const saleService = {
  createSale: (data: CreateSaleData) => api.post<Sale>('/sales', data).then(r => r.data),
  getSales: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    api.get<{ data: Sale[]; total: number }>('/sales', { params }).then(r => r.data),
  getSale: (id: string) => api.get<Sale>(`/sales/${id}`).then(r => r.data),
  voidSale: (id: string, reason: string) => api.post(`/sales/${id}/void`, { reason }).then(r => r.data),
  refundSale: (id: string, items: string[]) => api.post(`/sales/${id}/refund`, { items }).then(r => r.data),
  getStats: () => api.get<SaleStats>('/sales/stats/today').then(r => r.data),
  getDailyRevenue: (days = 30) => api.get<{ date: string; revenue: number; orders: number }[]>('/reports/daily-revenue', { params: { days } }).then(r => r.data),
  getTopProducts: (limit = 10) => api.get<{ name: string; quantity: number; revenue: number }[]>('/reports/top-products', { params: { limit } }).then(r => r.data),
}
