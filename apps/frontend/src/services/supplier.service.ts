import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { Supplier, PurchaseOrder } from '@/types/supplier.types'

export const supplierService = {
  getSuppliers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<Supplier>>('/suppliers', { params }).then(r => r.data),
  getSupplier: (id: string) => api.get<Supplier>(`/suppliers/${id}`).then(r => r.data),
  createSupplier: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data).then(r => r.data),
  updateSupplier: (id: string, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data).then(r => r.data),
  deleteSupplier: (id: string) => api.delete(`/suppliers/${id}`).then(r => r.data),

  getPurchaseOrders: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<PurchaseOrder>>('/suppliers/purchase-orders/all', { params }).then(r => r.data),
  getPurchaseOrder: (id: string) => api.get<PurchaseOrder>(`/suppliers/purchase-orders/${id}`).then(r => r.data),
  createPurchaseOrder: (data: {
    supplierId: string
    branchId: string
    notes?: string
    items: { productId: string; variantId?: string; quantity: number; unitCost: number; taxAmount?: number }[]
  }) => api.post<PurchaseOrder>('/suppliers/purchase-orders', data).then(r => r.data),
  receivePurchaseOrder: (id: string, data: { receivedItems: Record<string, number>; notes?: string }) =>
    api.post(`/suppliers/purchase-orders/${id}/receive`, data).then(r => r.data),
}
