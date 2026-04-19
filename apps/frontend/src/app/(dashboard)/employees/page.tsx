'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { employeeService } from '@/services/employee.service'
import { userService } from '@/services/user.service'
import { useBranches } from '@/hooks/useBranches'
import type { Employee } from '@/types/employee.types'
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
  userId: '',
  branchId: '',
  employeeCode: '',
  position: '',
  department: '',
  salary: '',
  commissionRate: '',
  hireDate: '',
  terminationDate: '',
}

export default function EmployeesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [branchId, setBranchId] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState(defaultForm)

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', page, branchId],
    queryFn: () => employeeService.getEmployees({ page, limit: 20, branchId: branchId || undefined }),
  })

  const { data: branches } = useBranches()

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({ page: 1, limit: 100 }),
  })

  useEffect(() => {
    if (!open) {
      setEditing(null)
      setForm(defaultForm)
      return
    }
    if (editing) {
      setForm({
        userId: editing.user.id,
        branchId: editing.branch.id,
        employeeCode: editing.employeeCode,
        position: editing.position ?? '',
        department: editing.department ?? '',
        salary: editing.salary ? String(editing.salary) : '',
        commissionRate: editing.commissionRate ? String(editing.commissionRate) : '',
        hireDate: editing.hireDate ? editing.hireDate.split('T')[0] : '',
        terminationDate: editing.terminationDate ? editing.terminationDate.split('T')[0] : '',
      })
    }
  }, [open, editing])

  const createMutation = useMutation({
    mutationFn: () => employeeService.createEmployee({
      userId: form.userId,
      branchId: form.branchId,
      employeeCode: form.employeeCode,
      position: form.position || undefined,
      department: form.department || undefined,
      salary: form.salary ? Number(form.salary) : undefined,
      commissionRate: form.commissionRate ? Number(form.commissionRate) : undefined,
      hireDate: form.hireDate || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Employee created')
      setOpen(false)
    },
    onError: () => toast.error('Failed to create employee'),
  })

  const updateMutation = useMutation({
    mutationFn: () => employeeService.updateEmployee(editing!.id, {
      position: form.position || undefined,
      department: form.department || undefined,
      salary: form.salary ? Number(form.salary) : undefined,
      commissionRate: form.commissionRate ? Number(form.commissionRate) : undefined,
      terminationDate: form.terminationDate || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Employee updated')
      setOpen(false)
    },
    onError: () => toast.error('Failed to update employee'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Employee terminated')
    },
    onError: () => toast.error('Failed to terminate employee'),
  })

  const handleSave = () => {
    if (!form.branchId || !form.userId || !form.employeeCode) {
      toast.error('User, branch, and employee code are required')
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage staff and attendance records.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Employee</Button>
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
            <div className="text-xs text-gray-500">{employees?.meta.totalCount ?? 0} employees</div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (employees?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">No employees found</TableCell>
                  </TableRow>
                ) : (
                  (employees?.data ?? []).map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.user.name}</div>
                        <div className="text-xs text-gray-500">{employee.user.email ?? '-'}</div>
                      </TableCell>
                      <TableCell>{employee.branch.name}</TableCell>
                      <TableCell>{employee.position ?? '-'}</TableCell>
                      <TableCell>{employee.employeeCode}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(employee)
                            setOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(employee.id)}
                        >
                          Terminate
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
              disabled={!employees?.meta.hasNextPage}
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
            <DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>User</Label>
              <Select value={form.userId} onValueChange={(value) => setForm((prev) => ({ ...prev, userId: value }))} disabled={!!editing}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {(users?.data ?? []).map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Branch</Label>
              <Select value={form.branchId} onValueChange={(value) => setForm((prev) => ({ ...prev, branchId: value }))} disabled={!!editing}>
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
              <Label>Employee Code</Label>
              <Input value={form.employeeCode} onChange={(e) => setForm((prev) => ({ ...prev, employeeCode: e.target.value }))} disabled={!!editing} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Position</Label>
                <Input value={form.position} onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Salary</Label>
                <Input type="number" value={form.salary} onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Commission Rate (%)</Label>
                <Input type="number" value={form.commissionRate} onChange={(e) => setForm((prev) => ({ ...prev, commissionRate: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Hire Date</Label>
                <Input type="date" value={form.hireDate} onChange={(e) => setForm((prev) => ({ ...prev, hireDate: e.target.value }))} />
              </div>
              {editing && (
                <div className="grid gap-2">
                  <Label>Termination Date</Label>
                  <Input type="date" value={form.terminationDate} onChange={(e) => setForm((prev) => ({ ...prev, terminationDate: e.target.value }))} />
                </div>
              )}
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
