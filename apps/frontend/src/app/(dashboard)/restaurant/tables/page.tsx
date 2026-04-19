'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restaurantService } from '@/services/restaurant.service'
import type { Table } from '@/types/restaurant.types'
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
  Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const statusOptions = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'] as const

const defaultForm = {
  name: '',
  capacity: '4',
  section: '',
  status: 'AVAILABLE',
  isActive: true,
}

export default function RestaurantTablesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Table | null>(null)
  const [form, setForm] = useState(defaultForm)

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => restaurantService.getTables(),
  })

  useEffect(() => {
    if (!open) {
      setEditing(null)
      setForm(defaultForm)
      return
    }
    if (editing) {
      setForm({
        name: editing.name,
        capacity: String(editing.capacity ?? 4),
        section: editing.section ?? '',
        status: editing.status,
        isActive: editing.isActive ?? true,
      })
    }
  }, [open, editing])

  const createMutation = useMutation({
    mutationFn: (data: { name: string; capacity?: number; section?: string }) => restaurantService.createTable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table created')
      setOpen(false)
    },
    onError: () => toast.error('Failed to create table'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Table> }) => restaurantService.updateTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table updated')
      setOpen(false)
    },
    onError: () => toast.error('Failed to update table'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => restaurantService.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table deleted')
    },
    onError: () => toast.error('Failed to delete table'),
  })

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    const payload: Partial<Table> = {
      name: form.name,
      capacity: Number(form.capacity),
      section: form.section || undefined,
      status: form.status as Table['status'],
      isActive: form.isActive,
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate({ name: payload.name!, capacity: payload.capacity, section: payload.section })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurant Tables</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage dining areas and table status.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Table</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="border rounded-lg overflow-hidden">
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (tables?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">No tables found</TableCell>
                  </TableRow>
                ) : (
                  (tables ?? []).map((table) => (
                    <TableRow key={table.id}>
                      <TableCell>
                        <div className="font-medium">{table.name}</div>
                        <div className="text-xs text-gray-500">{table.restaurantOrders?.[0]?.status ?? 'Idle'}</div>
                      </TableCell>
                      <TableCell>{table.section ?? '-'}</TableCell>
                      <TableCell>{table.capacity}</TableCell>
                      <TableCell>{table.status}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(table)
                            setOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(table.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </UITable>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Table' : 'Add Table'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Section</Label>
              <Input value={form.section} onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Capacity</Label>
              <Input type="number" value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))} />
            </div>
            {editing && (
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
            </div>
          </div>
          <DialogFooter>
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
