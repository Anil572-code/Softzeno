import api from '@/lib/api'
import type { DashboardStats, SalesReportRow, ProductReportRow, StaffReportRow, BranchReportRow } from '@/types/report.types'

export const reportService = {
  getDashboard: () => api.get<DashboardStats>('/reports/dashboard').then(r => r.data),
  getDailyReport: (date?: string) => api.get('/reports/daily', { params: { date } }).then(r => r.data),
  getSalesReport: (params: { startDate: string; endDate: string; groupBy?: 'day' | 'week' | 'month' }) =>
    api.get<SalesReportRow[]>('/reports/sales', { params }).then(r => r.data),
  getProductReport: (params: { startDate: string; endDate: string }) =>
    api.get<ProductReportRow[]>('/reports/products', { params }).then(r => r.data),
  getStaffReport: (params: { startDate: string; endDate: string }) =>
    api.get<StaffReportRow[]>('/reports/staff', { params }).then(r => r.data),
  getBranchReport: (params: { startDate: string; endDate: string }) =>
    api.get<BranchReportRow[]>('/reports/branches', { params }).then(r => r.data),
}
