'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditService } from '@/services/audit.service'
import { userService } from '@/services/user.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export default function AuditPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ userId: '', resource: '', action: '' })

  const { data: users } = useQuery({
    queryKey: ['users', 'audit'],
    queryFn: () => userService.getUsers({ page: 1, limit: 100 }),
  })

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit', page, filters],
    queryFn: () => auditService.getLogs({
      page,
      limit: 20,
      userId: filters.userId || undefined,
      resource: filters.resource || undefined,
      action: filters.action || undefined,
    }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review system activity and changes.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Select value={filters.userId} onValueChange={(value) => setFilters((prev) => ({ ...prev, userId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All users</SelectItem>
                {(users?.data ?? []).map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Resource (e.g., sales)"
              value={filters.resource}
              onChange={(e) => setFilters((prev) => ({ ...prev, resource: e.target.value }))}
            />
            <Input
              placeholder="Action (e.g., CREATE)"
              value={filters.action}
              onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Resource ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : (logs?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">No audit logs found</TableCell>
                  </TableRow>
                ) : (
                  (logs?.data ?? []).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{log.user?.name ?? 'System'}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.resourceId ?? '-'}</TableCell>
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
              disabled={!logs?.meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
