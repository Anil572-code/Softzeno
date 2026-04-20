export interface SaleItem {
  id: string
  productId: string
  variantId?: string
  name: string
  sku?: string | null
  unitPrice: number
  quantity: number
  discountAmount: number
  taxAmount: number
  totalPrice: number
  notes?: string
}

export interface Sale {
  id: string
  saleNumber: string
  customerId?: string
  customer?: { id: string; name: string; phone?: string | null }
  user?: { id: string; name: string }
  branchId: string
  items: SaleItem[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  status: 'PENDING' | 'BILLED' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  notes?: string
  createdAt: string
}

export interface Payment {
  method: 'CASH' | 'CARD' | 'QR' | 'WALLET' | 'SPLIT' | 'CREDIT'
  amount: number
}

export interface SaleStats {
  todayRevenue: number
  todayOrders: number
  todayCustomers: number
  avgOrderValue: number
  revenueChange: number
  ordersChange: number
}
