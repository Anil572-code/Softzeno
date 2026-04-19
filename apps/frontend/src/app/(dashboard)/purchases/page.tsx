'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supplierService } from '@/services/supplier.service'
import { productService } from '@/services/product.service'
import { useBranches } from '@/hooks/useBranches'
import { formatCurrency } from '@/lib/utils'
import type { PurchaseOrder } from '@/types/supplier.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface PurchaseItemForm {
  productId: string
  quantity: string
  unitCost: string
  taxAmount: string
}

const emptyItem: PurchaseItemForm = { productId: '', quantity: '1', unitCost: '', taxAmount: '' }

export default function PurchasesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ supplierId: '', branchId: '', notes: '' })
  const [items, setItems] = useState<PurchaseItemForm[]>([emptyItem])

  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ['purchase-orders', page],
    queryFn: () => supplierService.getPurchaseOrders({ page, limit: 20 }),
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.getSuppliers({ page: 1, limit: 100 }),
  })

  const { data: branches } = useBranches()

  const { data: products } = useQuery({
    queryKey: ['products', 'purchase'],
    queryFn: () => productService.getProducts({ page: 1, limit: 200 }),
  })

  const createMutation = useMutation({
    mutationFn: () => supplierService.createPurchaseOrder({
      supplierId: form.supplierId,
      branchId: form.branchId,
      notes: form.notes || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        taxAmount: item.taxAmount ? Number(item.taxAmount) : undefined,
      })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Purchase order created')
      setOpen(false)
      setForm({ supplierId: '', branchId: '', notes: '' })
      setItems([emptyItem])
    },
    onError: () => toast.error('Failed to create purchase order'),
  })

  const receiveMutation = useMutation({
    mutationFn: async (order: PurchaseOrder) => {
      const detail = await supplierService.getPurchaseOrder(order.id)
      const receivedItems = detail.items.reduce<Record<string, number>>((acc, item) => {
        acc[item.id] = Number(item.quantity)
        return acc
      }, {})
      return supplierService.receivePurchaseOrder(order.id, { receivedItems })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Purchase order received')
    },
    onError: () => toast.error('Failed to receive order'),
  })

  const totalEstimate = useMemo(() => items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const unitCost = Number(item.unitCost) || 0
    const tax = Number(item.taxAmount) || 0
    return sum + qty * unitCost + tax
  }, 0), [items])

  const handleCreate = () => {
    if (!form.supplierId || !form.branchId) {
      toast.error('Select supplier and branch')
      return
    }
    if (items.some((item) => !item.productId || !item.unitCost)) {
      toast.error('Add products and costs')
      return
    }
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchases</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track purchase orders and receiving.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Create Purchase Order</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (purchaseOrders?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">No purchase orders found</TableCell>
                  </TableRow>
                ) : (
                  (purchaseOrders?.data ?? []).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">{order.branch?.name ?? ''}</div>
                      </TableCell>
                      <TableCell>{order.supplier?.name ?? '-'}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{formatCurrency(Number(order.totalAmount))}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => receiveMutation.mutate(order)}>
                          Mark Received
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!purchaseOrders?.meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Supplier</Label>
                <Select value={form.supplierId} onValueChange={(value) => setForm((prev) => ({ ...prev, supplierId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {(suppliers?.data ?? []).map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Branch</Label>
                <Select value={form.branchId} onValueChange={(value) => setForm((prev) => ({ ...prev, branchId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {(branches?.data ?? []).map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItems((prev) => [...prev, emptyItem])}
                >
                  Add Item
                </Button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-5">
                  <Select
                    value={item.productId}
                    onValueChange={(value) => setItems((prev) => prev.map((row, idx) => idx === index ? { ...row, productId: value } : row))}
                  >
                    <SelectTrigger className="md:col-span-2">
                      <SelectValue placeholder="Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {(products?.data ?? []).map((product) => (
                        <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => setItems((prev) => prev.map((row, idx) => idx === index ? { ...row, quantity: e.target.value } : row))}
                  />
                  <Input
                    type="number"
                    placeholder="Unit cost"
                    value={item.unitCost}
                    onChange={(e) => setItems((prev) => prev.map((row, idx) => idx === index ? { ...row, unitCost: e.target.value } : row))}
                  />
                  <Input
                    type="number"
                    placeholder="Tax"
                    value={item.taxAmount}
                    onChange={(e) => setItems((prev) => prev.map((row, idx) => idx === index ? { ...row, taxAmount: e.target.value } : row))}
                  />
                </div>
              ))}
            </div>

            <div className="text-right text-sm text-gray-500">
              Estimated Total: {formatCurrency(totalEstimate)}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
