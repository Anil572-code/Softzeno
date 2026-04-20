import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { Sale } from '@/types/sale.types'

interface CreateSaleData {
  customerId?: string | null
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  tableId?: string | null
  registerId?: string | null
  shiftId?: string | null
  items: {
    productId: string
    variantId?: string
    quantity: number
    unitPrice: number
    discountAmount?: number
    notes?: string
    modifiers?: string[]
  }[]
  payments?: { method: 'CASH' | 'CARD' | 'QR' | 'WALLET' | 'SPLIT' | 'CREDIT'; amount: number; reference?: string }[]
  discountAmount?: number
  tipAmount?: number
  couponCode?: string
  notes?: string
  hold?: boolean
  redeemPoints?: number
}

export const saleService = {
  createSale: (data: CreateSaleData) => api.post<Sale>('/sales', data).then(r => r.data),
  getSales: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<Sale>>('/sales', { params }).then(r => r.data),
  getSale: (id: string) => api.get<Sale>(`/sales/${id}`).then(r => r.data),
  voidSale: (id: string) => api.post(`/sales/${id}/void`, {}).then(r => r.data),
  refundSale: (id: string, data: { amount: number; reason?: string; items?: string[] }) =>
    api.post(`/sales/${id}/refund`, data).then(r => r.data),
  holdSale: (id: string) => api.post(`/sales/${id}/hold`, {}).then(r => r.data),
  resumeSale: (id: string) => api.post(`/sales/${id}/resume`, {}).then(r => r.data),
}
