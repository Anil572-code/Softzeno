'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { branchService } from '@/services/branch.service'
import type { Branch } from '@/types/branch.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const defaultForm = {
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
  isMain: false,
}

export default function BranchesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [form, setForm] = useState(defaultForm)

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches', page],
    queryFn: () => branchService.getBranches({ page, limit: 20 }),
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
        code: editing.code,
        address: editing.address ?? '',
        phone: editing.phone ?? '',
        email: editing.email ?? '',
        isMain: editing.isMain,
      })
    }
  }, [open, editing])

  const createMutation = useMutation({
    mutationFn: () => branchService.createBranch({
      name: form.name,
      code: form.code,
      address: form.address || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      isMain: form.isMain,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch created')
      setOpen(false)
    },
    onError: () => toast.error('Failed to create branch'),
  })

  const updateMutation = useMutation({
    mutationFn: () => branchService.updateBranch(editing!.id, {
      name: form.name,
      address: form.address || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      isActive: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch updated')
      setOpen(false)
    },
    onError: () => toast.error('Failed to update branch'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => branchService.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch deleted')
    },
    onError: () => toast.error('Failed to delete branch'),
  })

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Name and code are required')
      return
    }
    if (editing) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branches</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage store locations and contact details.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Branch</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Main</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (branches?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">No branches found</TableCell>
                  </TableRow>
                ) : (
                  (branches?.data ?? []).map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-xs text-gray-500">{branch.address ?? 'No address'}</div>
                      </TableCell>
                      <TableCell>{branch.code}</TableCell>
                      <TableCell>{branch.phone ?? branch.email ?? '-'}</TableCell>
                      <TableCell>{branch.isMain ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(branch)
                            setOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(branch.id)}>
                          Delete
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
              disabled={!branches?.meta.hasNextPage}
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
            <DialogTitle>{editing ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} disabled={!!editing} />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
            </div>
            {!editing && (
              <div className="flex items-center justify-between">
                <Label>Main Branch</Label>
                <Switch checked={form.isMain} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isMain: checked }))} />
              </div>
            )}
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
