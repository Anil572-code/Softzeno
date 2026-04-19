'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingsService } from '@/services/settings.service'
import { useBranches } from '@/hooks/useBranches'
import type { Setting } from '@/types/setting.types'
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
  key: '',
  value: '',
  group: '',
  branchId: '',
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Setting | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [branchId, setBranchId] = useState('')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', branchId],
    queryFn: () => settingsService.getSettings({ branchId: branchId || undefined }),
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
        key: editing.key,
        value: editing.value,
        group: editing.group ?? '',
        branchId: editing.branchId ?? '',
      })
    }
  }, [open, editing])

  const saveMutation = useMutation({
    mutationFn: () => settingsService.setSetting(
      { key: form.key, value: form.value, group: form.group || undefined },
      { branchId: form.branchId || undefined }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Setting saved')
      setOpen(false)
    },
    onError: () => toast.error('Failed to save setting'),
  })

  const deleteMutation = useMutation({
    mutationFn: (setting: Setting) => settingsService.deleteSetting(setting.key, { branchId: setting.branchId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Setting deleted')
    },
    onError: () => toast.error('Failed to delete setting'),
  })

  const handleSave = () => {
    if (!form.key.trim() || !form.value.trim()) {
      toast.error('Key and value are required')
      return
    }
    saveMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure global and branch-specific settings.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Setting</Button>
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
            <div className="text-xs text-gray-500">{settings?.length ?? 0} settings</div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (settings?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">No settings found</TableCell>
                  </TableRow>
                ) : (
                  (settings ?? []).map((setting) => (
                    <TableRow key={`${setting.key}-${setting.branchId ?? 'global'}`}>
                      <TableCell>{setting.key}</TableCell>
                      <TableCell>{setting.value}</TableCell>
                      <TableCell>{setting.group ?? '-'}</TableCell>
                      <TableCell>{branches?.data.find((b) => b.id === setting.branchId)?.name ?? 'Global'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(setting)
                            setOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(setting)}
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
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Setting' : 'Add Setting'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Key</Label>
              <Input value={form.key} onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))} disabled={!!editing} />
            </div>
            <div className="grid gap-2">
              <Label>Value</Label>
              <Input value={form.value} onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Group</Label>
              <Input value={form.group} onChange={(e) => setForm((prev) => ({ ...prev, group: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Branch</Label>
              <Select value={form.branchId} onValueChange={(value) => setForm((prev) => ({ ...prev, branchId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Global setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Global</SelectItem>
                  {(branches?.data ?? []).map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
