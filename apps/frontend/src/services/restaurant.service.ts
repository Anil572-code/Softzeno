import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { Table, RestaurantOrder, KitchenTicket } from '@/types/restaurant.types'

export const restaurantService = {
  getTables: () => api.get<Table[]>('/restaurant/tables').then(r => r.data),
  createTable: (data: { name: string; capacity?: number; section?: string }) =>
    api.post<Table>('/restaurant/tables', data).then(r => r.data),
  updateTable: (id: string, data: Partial<Table>) =>
    api.put<Table>(`/restaurant/tables/${id}`, data).then(r => r.data),
  deleteTable: (id: string) => api.delete(`/restaurant/tables/${id}`).then(r => r.data),

  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<RestaurantOrder>>('/restaurant/orders', { params }).then(r => r.data),
  createOrder: (data: {
    tableId?: string
    customerId?: string
    type?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
    partySize?: number
    notes?: string
    items: { productId: string; variantId?: string; quantity: number; unitPrice: number; notes?: string }[]
  }) => api.post<RestaurantOrder>('/restaurant/orders', data).then(r => r.data),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/restaurant/orders/${id}/status`, { status }).then(r => r.data),
  addItemsToOrder: (id: string, items: { productId: string; variantId?: string; quantity: number; unitPrice: number; notes?: string }[]) =>
    api.post(`/restaurant/orders/${id}/items`, { items }).then(r => r.data),

  getKitchenTickets: (params?: { status?: string }) =>
    api.get<KitchenTicket[]>('/restaurant/kitchen/tickets', { params }).then(r => r.data),
  updateKitchenTicketStatus: (id: string, status: string) =>
    api.patch<KitchenTicket>(`/restaurant/kitchen/tickets/${id}/status`, { status }).then(r => r.data),
}
