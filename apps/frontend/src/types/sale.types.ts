export interface SaleItem {
  id: string
  productId: string
  variantId?: string
  name: string
  sku: string
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
  customer?: { id: string; name: string; email: string }
  employeeId: string
  employee?: { id: string; name: string }
  branchId: string
  items: SaleItem[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  paymentMethod: string
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID'
  status: 'COMPLETED' | 'REFUNDED' | 'VOID'
  notes?: string
  receiptNumber: string
  createdAt: string
}

export interface SaleStats {
  todayRevenue: number
  todayOrders: number
  todayCustomers: number
  avgOrderValue: number
  revenueChange: number
  ordersChange: number
}
