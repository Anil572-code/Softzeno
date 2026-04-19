export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'
export type KitchenStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED'

export interface Table {
  id: string
  number: string
  capacity: number
  status: TableStatus
  section?: string
  currentOrderId?: string
  waiter?: string
  occupiedAt?: string
}

export interface KitchenOrder {
  id: string
  orderNumber: string
  tableNumber?: string
  orderType: string
  items: KitchenOrderItem[]
  status: KitchenStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface KitchenOrderItem {
  id: string
  name: string
  quantity: number
  notes?: string
  status: KitchenStatus
  modifiers?: string[]
}
