export interface InventoryItem {
  id: string
  productId: string
  variantId?: string | null
  quantity: number
  reservedQty: number
  reorderLevel: number
  maxLevel?: number | null
  location?: string | null
  batchNumber?: string | null
  expiryDate?: string | null
  product: { id: string; name: string; sku?: string | null; barcode?: string | null; image?: string | null }
  variant?: { id: string; name: string; sku?: string | null } | null
}

export interface StockMovement {
  id: string
  productId: string
  variantId?: string | null
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'WASTAGE'
  quantity: number
  reference?: string | null
  notes?: string | null
  createdAt: string
  user?: { id: string; name: string } | null
}
