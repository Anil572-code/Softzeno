import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { AuditLog } from '@/types/audit.types'

export const auditService = {
  getLogs: (params?: { page?: number; limit?: number; userId?: string; resource?: string; action?: string }) =>
    api.get<PaginatedResponse<AuditLog>>('/audit', { params }).then(r => r.data),
}
