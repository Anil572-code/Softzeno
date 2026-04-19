export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'
export type KitchenStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
export type OrderStatus = 'PENDING' | 'PLACED' | 'PREPARING' | 'READY' | 'SERVED' | 'BILLED' | 'PAID' | 'CANCELLED' | 'REFUNDED'
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'

export interface Table {
  id: string
  name: string
  capacity: number
  status: TableStatus
  section?: string
  isActive?: boolean
  restaurantOrders?: { id: string; orderNumber: string; status: OrderStatus; partySize: number }[]
}

export interface RestaurantOrderItem {
  id: string
  name: string
  quantity: number
  status: OrderStatus
  notes?: string | null
}

export interface RestaurantOrder {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  partySize: number
  notes?: string | null
  totalAmount: number
  table?: { id: string; name: string } | null
  customer?: { id: string; name: string } | null
  items: RestaurantOrderItem[]
  createdAt: string
}

export interface KitchenTicketItem {
  id?: string
  name: string
  quantity: number
  status: OrderStatus
  notes?: string | null
  modifiers?: string[]
  unitPrice: number
}

export interface KitchenTicket {
  id: string
  ticketNumber: string
  status: KitchenStatus
  notes?: string | null
  items: KitchenTicketItem[]
  restaurantOrder: {
    orderNumber: string
    type: OrderType
    tableId?: string | null
    table?: { name: string | null } | null
  }
  createdAt: string
}
