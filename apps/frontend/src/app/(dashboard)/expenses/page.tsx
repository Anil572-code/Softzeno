'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { expenseService } from '@/services/expense.service'
import { useBranches } from '@/hooks/useBranches'
import type { Expense } from '@/types/expense.types'
import { formatCurrency } from '@/lib/utils'
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

const categories = ['RENT', 'UTILITIES', 'SALARY', 'SUPPLIES', 'MAINTENANCE', 'MARKETING', 'OTHER'] as const

const defaultForm = {
  category: 'OTHER',
  title: '',
  amount: '',
  description: '',
  receiptUrl: '',
  expenseDate: '',
  branchId: '',
}

export default function ExpensesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [branchId, setBranchId] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState(defaultForm)

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', page, branchId],
    queryFn: () => expenseService.getExpenses({ page, limit: 20, branchId: branchId || undefined }),
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
        category: editing.category,
        title: editing.title,
        amount: String(editing.amount),
        description: editing.description ?? '',
        receiptUrl: editing.receiptUrl ?? '',
        expenseDate: editing.expenseDate ? editing.expenseDate.split('T')[0] : '',
        branchId: editing.branch.id,
      })
    }
  }, [open, editing])

  const createMutation = useMutation({
    mutationFn: () => expenseService.createExpense({
      category: form.category,
      title: form.title,
      amount: Number(form.amount),
      description: form.description || undefined,
      receiptUrl: form.receiptUrl || undefined,
      expenseDate: form.expenseDate,
      branchId: form.branchId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense created')
      setOpen(false)
    },
    onError: () => toast.error('Failed to create expense'),
  })

  const updateMutation = useMutation({
    mutationFn: () => expenseService.updateExpense(editing!.id, {
      category: form.category,
      title: form.title,
      amount: Number(form.amount),
      description: form.description || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense updated')
      setOpen(false)
    },
    onError: () => toast.error('Failed to update expense'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense deleted')
    },
    onError: () => toast.error('Failed to delete expense'),
  })

  const handleSave = () => {
    if (!form.title.trim() || !form.amount || !form.expenseDate || !form.branchId) {
      toast.error('Title, amount, date, and branch are required')
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track operational spending.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Expense</Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All branches</SelectItem>
                {(branches?.data ?? []).map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500">{expenses?.meta.totalCount ?? 0} expenses</div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (expenses?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">No expenses found</TableCell>
                  </TableRow>
                ) : (
                  (expenses?.data ?? []).map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.title}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.branch.name}</TableCell>
                      <TableCell>{formatCurrency(Number(expense.amount))}</TableCell>
                      <TableCell>{expense.expenseDate.split('T')[0]}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(expense)
                            setOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(expense.id)}>
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
              disabled={!expenses?.meta.hasNextPage}
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
            <DialogTitle>{editing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={form.expenseDate} onChange={(e) => setForm((prev) => ({ ...prev, expenseDate: e.target.value }))} />
              </div>
            </div>
            {!editing && (
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
            )}
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            {!editing && (
              <div className="grid gap-2">
                <Label>Receipt URL</Label>
                <Input value={form.receiptUrl} onChange={(e) => setForm((prev) => ({ ...prev, receiptUrl: e.target.value }))} />
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
