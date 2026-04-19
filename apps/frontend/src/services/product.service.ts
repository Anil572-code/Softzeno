import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { Product, Category } from '@/types/product.types'

const mapProductStock = (product: Product): Product => {
  const inventory = product.inventory?.[0]
  const stockQty = inventory ? Number(inventory.quantity) : undefined
  return { ...product, stockQty }
}

export const productService = {
  getProducts: (params?: { page?: number; limit?: number; search?: string; branchId?: string; categoryId?: string }) =>
    api.get<PaginatedResponse<Product>>('/products', { params }).then(r => ({
      ...r.data,
      data: r.data.data.map(mapProductStock),
    })),
  getProduct: (id: string) => api.get<Product>(`/products/${id}`).then(r => mapProductStock(r.data)),
  createProduct: (data: Partial<Product>) => api.post<Product>('/products', data).then(r => mapProductStock(r.data)),
  updateProduct: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data).then(r => mapProductStock(r.data)),
  deleteProduct: (id: string) => api.delete(`/products/${id}`).then(r => r.data),

  getCategories: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<Category>>('/categories', { params }).then(r => r.data),
  createCategory: (data: Partial<Category>) => api.post<Category>('/categories', data).then(r => r.data),
  updateCategory: (id: string, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data).then(r => r.data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`).then(r => r.data),
}
