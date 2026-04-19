export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  parentId?: string
  isActive: boolean
  productCount?: number
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  stock: number
  barcode?: string
  attributes: Record<string, string>
}

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  image?: string
  categoryId: string
  category?: Category
  price: number
  cost: number
  taxRate: number
  stock: number
  minStock: number
  unit: string
  isActive: boolean
  isFeatured: boolean
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  productId: string
  product?: Product
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string
  reference?: string
  createdAt: string
}
