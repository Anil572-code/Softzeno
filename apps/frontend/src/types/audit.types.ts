export interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  user?: { id: string; name: string; email?: string | null }
}
