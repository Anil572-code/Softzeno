import api from '@/lib/api'
import type { Setting } from '@/types/setting.types'

export const settingsService = {
  getSettings: (params?: { branchId?: string; group?: string }) =>
    api.get<Setting[]>('/settings', { params }).then(r => r.data),
  getSetting: (key: string, params?: { branchId?: string }) =>
    api.get<Setting>(`/settings/${key}`, { params }).then(r => r.data),
  setSetting: (data: { key: string; value: string; group?: string }, params?: { branchId?: string }) =>
    api.post<Setting>('/settings', data, { params }).then(r => r.data),
  setBulk: (data: { settings: { key: string; value: string; group?: string }[]; branchId?: string }) =>
    api.post('/settings/bulk', data).then(r => r.data),
  deleteSetting: (key: string, params?: { branchId?: string }) =>
    api.delete(`/settings/${key}`, { params }).then(r => r.data),
}
