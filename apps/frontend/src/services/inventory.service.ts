import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { InventoryItem, StockMovement } from '@/types/inventory.types'

export const inventoryService = {
  getStockLevels: (branchId: string, params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<InventoryItem>>(`/inventory/${branchId}/stock`, { params }).then(r => r.data),
  getLowStock: (branchId: string) =>
    api.get<InventoryItem[]>(`/inventory/${branchId}/low-stock`).then(r => r.data),
  adjustStock: (branchId: string, data: { productId: string; variantId?: string; quantity: number; type: string; notes?: string; reference?: string }) =>
    api.post(`/inventory/${branchId}/adjust`, data).then(r => r.data),
  transferStock: (data: { fromBranchId: string; toBranchId: string; productId: string; variantId?: string; quantity: number; notes?: string }) =>
    api.post('/inventory/transfer', data).then(r => r.data),
  getMovementHistory: (branchId: string, productId: string, params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<StockMovement>>(`/inventory/${branchId}/history/${productId}`, { params }).then(r => r.data),
}
