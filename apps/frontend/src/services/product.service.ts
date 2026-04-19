import api from '@/lib/api'
import type { Product, Category, StockMovement } from '@/types/product.types'

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export const productService = {
  getProducts: (params?: { page?: number; limit?: number; search?: string; categoryId?: string }) =>
    api.get<PaginatedResponse<Product>>('/products', { params }).then(r => r.data),
  getProduct: (id: string) => api.get<Product>(`/products/${id}`).then(r => r.data),
  createProduct: (data: Partial<Product>) => api.post<Product>('/products', data).then(r => r.data),
  updateProduct: (id: string, data: Partial<Product>) => api.patch<Product>(`/products/${id}`, data).then(r => r.data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`).then(r => r.data),

  getCategories: () => api.get<Category[]>('/categories').then(r => r.data),
  createCategory: (data: Partial<Category>) => api.post<Category>('/categories', data).then(r => r.data),
  updateCategory: (id: string, data: Partial<Category>) => api.patch<Category>(`/categories/${id}`, data).then(r => r.data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`).then(r => r.data),

  adjustStock: (productId: string, quantity: number, reason: string) =>
    api.post<StockMovement>(`/inventory/adjust`, { productId, quantity, reason }).then(r => r.data),
  getStockMovements: (productId?: string) =>
    api.get<StockMovement[]>('/inventory/movements', { params: { productId } }).then(r => r.data),
  getLowStockProducts: () => api.get<Product[]>('/inventory/low-stock').then(r => r.data),
}
