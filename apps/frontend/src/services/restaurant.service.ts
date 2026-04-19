import api from '@/lib/api'
import type { Table, KitchenOrder } from '@/types/restaurant.types'

export const restaurantService = {
  getTables: () => api.get<Table[]>('/restaurant/tables').then(r => r.data),
  updateTableStatus: (id: string, status: string) => api.patch<Table>(`/restaurant/tables/${id}`, { status }).then(r => r.data),

  getKitchenOrders: () => api.get<KitchenOrder[]>('/restaurant/kitchen').then(r => r.data),
  updateOrderStatus: (id: string, status: string) => api.patch<KitchenOrder>(`/restaurant/kitchen/${id}`, { status }).then(r => r.data),
  updateItemStatus: (orderId: string, itemId: string, status: string) =>
    api.patch(`/restaurant/kitchen/${orderId}/items/${itemId}`, { status }).then(r => r.data),
}
