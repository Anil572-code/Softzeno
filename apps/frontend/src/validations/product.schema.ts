import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  cost: z.number().min(0, 'Cost must be positive'),
  taxRate: z.number().min(0).max(100),
  stock: z.number().min(0),
  minStock: z.number().min(0),
  unit: z.string().default('pcs'),
  isActive: z.boolean().default(true),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
