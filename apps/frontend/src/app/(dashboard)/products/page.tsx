'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productService } from '@/services/product.service'
import type { Product } from '@/types/product.types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const defaultForm = {
  name: '',
  sellingPrice: '',
  costPrice: '',
  sku: '',
  barcode: '',
  categoryId: '',
  trackStock: true,
  isRestaurantItem: false,
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(defaultForm)

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', { search, page }],
    queryFn: () => productService.getProducts({ page, limit: 20, search }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories({ page: 1, limit: 100 }),
  })

  const openDialog = (product?: Product) => {
    if (product) {
      setEditing(product)
      setForm({
        name: product.name,
        sellingPrice: String(product.sellingPrice ?? ''),
        costPrice: String(product.costPrice ?? ''),
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        categoryId: product.categoryId ?? '',
        trackStock: product.trackStock,
        isRestaurantItem: product.isRestaurantItem,
      })
    } else {
      setEditing(null)
      setForm(defaultForm)
    }
    setOpen(true)
  }

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setEditing(null)
      setForm(defaultForm)
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created')
      setOpen(false)
    },
    onError: () => toast.error('Failed to create product'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated')
      setOpen(false)
    },
    onError: () => toast.error('Failed to update product'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
    },
    onError: () => toast.error('Failed to delete product'),
  })

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    const sellingPrice = Number(form.sellingPrice)
    if (!sellingPrice || Number.isNaN(sellingPrice)) {
      toast.error('Selling price is required')
      return
    }

    const payload: Partial<Product> = {
      name: form.name,
      sellingPrice,
      costPrice: form.costPrice ? Number(form.costPrice) : 0,
      sku: form.sku || undefined,
      barcode: form.barcode || undefined,
      categoryId: form.categoryId || undefined,
      trackStock: form.trackStock,
      isRestaurantItem: form.isRestaurantItem,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage items, pricing, and availability.</p>
        </div>
        <Button onClick={() => openDialog()}>Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <div className="text-xs text-gray-500">
              {products?.meta.totalCount ?? 0} products
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (products?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">No products found</TableCell>
                  </TableRow>
                ) : (
                  (products?.data ?? []).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.barcode ?? 'No barcode'}</div>
                      </TableCell>
                      <TableCell>{product.sku ?? '-'}</TableCell>
                      <TableCell>{product.category?.name ?? 'Uncategorized'}</TableCell>
                      <TableCell>{formatCurrency(Number(product.sellingPrice))}</TableCell>
                      <TableCell>{product.trackStock ? product.stockQty ?? 0 : 'Not tracked'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!products?.meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={form.sellingPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, sellingPrice: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, costPrice: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={form.barcode}
                  onChange={(e) => setForm((prev) => ({ ...prev, barcode: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Uncategorized</SelectItem>
                  {(categories?.data ?? []).map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Track Stock</Label>
              <Switch
                checked={form.trackStock}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, trackStock: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Restaurant Item</Label>
              <Switch
                checked={form.isRestaurantItem}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isRestaurantItem: checked }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
