'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerService } from '@/services/customer.service'
import type { Customer } from '@/types/customer.types'
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

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  birthday: '',
  anniversary: '',
  notes: '',
  branchId: '',
}

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [loyaltyOpen, setLoyaltyOpen] = useState(false)
  const [loyaltyPoints, setLoyaltyPoints] = useState('')

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', { page, search }],
    queryFn: () => customerService.getCustomers({ page, limit: 20, search }),
  })

  const { data: branches } = useBranches()

  useEffect(() => {
    if (!open) {
      setEditing(null)
      setForm(defaultForm)
      return
    }
    if (editing) {
      setForm({
        name: editing.name,
        email: editing.email ?? '',
        phone: editing.phone ?? '',
        address: editing.address ?? '',
        birthday: editing.birthday ? editing.birthday.split('T')[0] : '',
        anniversary: editing.anniversary ? editing.anniversary.split('T')[0] : '',
        notes: editing.notes ?? '',
        branchId: '',
      })
    }
  }, [open, editing])

  const createMutation = useMutation({
    mutationFn: (data: Partial<Customer> & { branchId?: string }) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer created')
      setOpen(false)
    },
    onError: () => toast.error('Failed to create customer'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => customerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer updated')
      setOpen(false)
    },
    onError: () => toast.error('Failed to update customer'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer deleted')
    },
    onError: () => toast.error('Failed to delete customer'),
  })

  const loyaltyMutation = useMutation({
    mutationFn: ({ id, points }: { id: string; points: number }) => customerService.adjustLoyalty(id, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Loyalty points updated')
      setLoyaltyOpen(false)
      setLoyaltyPoints('')
    },
    onError: () => toast.error('Failed to update loyalty points'),
  })

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    const payload: Partial<Customer> & { branchId?: string } = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      birthday: form.birthday || undefined,
      anniversary: form.anniversary || undefined,
      notes: form.notes || undefined,
      branchId: form.branchId || undefined,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleLoyalty = () => {
    if (!editing) return
    const points = Number(loyaltyPoints)
    if (Number.isNaN(points)) {
      toast.error('Enter a valid number')
      return
    }
    loyaltyMutation.mutate({ id: editing.id, points })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage loyalty members and profiles.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Customer</Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <div className="text-xs text-gray-500">
              {customers?.meta.totalCount ?? 0} customers
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (customers?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">No customers found</TableCell>
                  </TableRow>
                ) : (
                  (customers?.data ?? []).map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.email ?? 'No email'}</div>
                      </TableCell>
                      <TableCell>{customer.phone ?? '-'}</TableCell>
                      <TableCell>{customer.membershipTier ?? 'BRONZE'}</TableCell>
                      <TableCell>{customer.loyaltyPoints}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(customer)
                            setOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(customer)
                            setLoyaltyOpen(true)
                          }}
                        >
                          Loyalty
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(customer.id)}
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
              disabled={!customers?.meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Birthday</Label>
                <Input type="date" value={form.birthday} onChange={(e) => setForm((prev) => ({ ...prev, birthday: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Anniversary</Label>
                <Input type="date" value={form.anniversary} onChange={(e) => setForm((prev) => ({ ...prev, anniversary: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Branch</Label>
              <Select value={form.branchId} onValueChange={(value) => setForm((prev) => ({ ...prev, branchId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No branch</SelectItem>
                  {(branches?.data ?? []).map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
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

      <Dialog open={loyaltyOpen} onOpenChange={setLoyaltyOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Loyalty Points</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Points (positive or negative)</Label>
            <Input value={loyaltyPoints} onChange={(e) => setLoyaltyPoints(e.target.value)} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLoyaltyOpen(false)}>Cancel</Button>
            <Button onClick={handleLoyalty} disabled={loyaltyMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
