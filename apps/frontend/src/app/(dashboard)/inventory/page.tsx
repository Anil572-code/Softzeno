'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { inventoryService } from '@/services/inventory.service'
import { useBranches } from '@/hooks/useBranches'
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

const stockTypes = ['PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'WASTAGE'] as const

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [branchId, setBranchId] = useState('')
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adjustForm, setAdjustForm] = useState({ quantity: '', type: 'ADJUSTMENT', notes: '', reference: '' })
  const [transferForm, setTransferForm] = useState({ fromBranchId: '', toBranchId: '', productId: '', quantity: '', notes: '' })

  const { data: branches } = useBranches({
    onSuccess: (data) => {
      if (!branchId && data.data.length) {
        setBranchId(data.data[0].id)
      }
    },
  })

  const { data: stockLevels, isLoading } = useQuery({
    queryKey: ['inventory', branchId, search, page],
    queryFn: () => inventoryService.getStockLevels(branchId, { page, limit: 20, search }),
    enabled: !!branchId,
  })

  const { data: lowStock } = useQuery({
    queryKey: ['inventory-low', branchId],
    queryFn: () => inventoryService.getLowStock(branchId),
    enabled: !!branchId,
  })

  const adjustMutation = useMutation({
    mutationFn: (data: { branchId: string; productId: string; quantity: number; type: string; notes?: string; reference?: string }) =>
      inventoryService.adjustStock(data.branchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', branchId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-low', branchId] })
      toast.success('Stock adjusted')
      setAdjustOpen(false)
      setAdjustForm({ quantity: '', type: 'ADJUSTMENT', notes: '', reference: '' })
    },
    onError: () => toast.error('Failed to adjust stock'),
  })

  const transferMutation = useMutation({
    mutationFn: (data: { fromBranchId: string; toBranchId: string; productId: string; quantity: number; notes?: string }) =>
      inventoryService.transferStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Stock transferred')
      setTransferOpen(false)
      setTransferForm({ fromBranchId: branchId, toBranchId: '', productId: '', quantity: '', notes: '' })
    },
    onError: () => toast.error('Failed to transfer stock'),
  })

  const productsForTransfer = useMemo(() => stockLevels?.data ?? [], [stockLevels?.data])

  const handleAdjustSubmit = () => {
    if (!selectedId || !branchId) return
    const quantity = Number(adjustForm.quantity)
    if (!quantity || Number.isNaN(quantity)) {
      toast.error('Quantity is required')
      return
    }
    adjustMutation.mutate({
      branchId,
      productId: selectedId,
      quantity,
      type: adjustForm.type,
      notes: adjustForm.notes || undefined,
      reference: adjustForm.reference || undefined,
    })
  }

  const handleTransferSubmit = () => {
    const quantity = Number(transferForm.quantity)
    if (!transferForm.productId || !transferForm.fromBranchId || !transferForm.toBranchId) {
      toast.error('Select product and branches')
      return
    }
    if (!quantity || Number.isNaN(quantity)) {
      toast.error('Quantity is required')
      return
    }
    transferMutation.mutate({
      fromBranchId: transferForm.fromBranchId,
      toBranchId: transferForm.toBranchId,
      productId: transferForm.productId,
      quantity,
      notes: transferForm.notes || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track stock levels across branches.</p>
        </div>
        <Button onClick={() => {
          setTransferForm({ fromBranchId: branchId, toBranchId: '', productId: '', quantity: '', notes: '' })
          setTransferOpen(true)
        }}>
          Transfer Stock
        </Button>
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
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {(branches?.data ?? []).map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-gray-400">Low Stock Items</div>
              <div className="text-lg font-semibold text-gray-900">{lowStock?.length ?? 0}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-gray-400">Total Items</div>
              <div className="text-lg font-semibold text-gray-900">{stockLevels?.meta.totalCount ?? 0}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-gray-400">Branch</div>
              <div className="text-lg font-semibold text-gray-900">{branches?.data.find((b) => b.id === branchId)?.name ?? '-'}</div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (stockLevels?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">No stock records</TableCell>
                  </TableRow>
                ) : (
                  (stockLevels?.data ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-xs text-gray-500">{item.variant?.name ?? 'Standard'}</div>
                      </TableCell>
                      <TableCell>{item.product.sku ?? '-'}</TableCell>
                      <TableCell>{Number(item.quantity)}</TableCell>
                      <TableCell>{Number(item.reorderLevel)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedId(item.productId)
                            setAdjustForm({ quantity: '', type: 'ADJUSTMENT', notes: '', reference: '' })
                            setAdjustOpen(true)
                          }}
                        >
                          Adjust
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
              disabled={!stockLevels?.meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={adjustForm.type} onValueChange={(value) => setAdjustForm((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {stockTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Reference</Label>
              <Input
                value={adjustForm.reference}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, reference: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                value={adjustForm.notes}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustSubmit} disabled={adjustMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Product</Label>
              <Select value={transferForm.productId} onValueChange={(value) => setTransferForm((prev) => ({ ...prev, productId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {productsForTransfer.map((item) => (
                    <SelectItem key={item.productId} value={item.productId}>{item.product.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>From Branch</Label>
              <Select value={transferForm.fromBranchId} onValueChange={(value) => setTransferForm((prev) => ({ ...prev, fromBranchId: value }))}>
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
            <div className="grid gap-2">
              <Label>To Branch</Label>
              <Select value={transferForm.toBranchId} onValueChange={(value) => setTransferForm((prev) => ({ ...prev, toBranchId: value }))}>
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
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                value={transferForm.notes}
                onChange={(e) => setTransferForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button onClick={handleTransferSubmit} disabled={transferMutation.isPending}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
