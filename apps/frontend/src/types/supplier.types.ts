export interface Supplier {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  taxNumber?: string | null
  notes?: string | null
  balance?: number | null
  isActive: boolean
  createdAt?: string
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  variantId?: string | null
  quantity: number
  receivedQty: number
  unitCost: number
  taxAmount: number
  totalCost: number
  product?: { id: string; name: string; sku?: string | null }
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  status: 'DRAFT' | 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED'
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  notes?: string | null
  orderedAt?: string | null
  receivedAt?: string | null
  supplier: { id: string; name: string }
  branch: { id: string; name: string }
  items: PurchaseOrderItem[]
  createdAt?: string
}
