export interface Category {
  id: string
  name: string
  slug?: string
  parentId?: string | null
  isActive?: boolean
}

export interface ProductVariant {
  id: string
  name: string
  sku?: string | null
  sellingPrice: number
}

export interface ProductInventorySummary {
  quantity: number
  reservedQty: number
  reorderLevel: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  barcode?: string | null
  sku?: string | null
  costPrice: number
  sellingPrice: number
  trackStock: boolean
  isActive: boolean
  isRestaurantItem: boolean
  categoryId?: string | null
  category?: Category | null
  brand?: { id: string; name: string } | null
  unit?: { id: string; name: string; abbreviation?: string | null } | null
  taxClass?: { id: string; name: string; rate: number } | null
  variants?: ProductVariant[]
  inventory?: ProductInventorySummary[]
  stockQty?: number
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
  user?: { id: string; name: string }
}
