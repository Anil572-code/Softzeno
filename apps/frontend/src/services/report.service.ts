import api from '@/lib/api'

export const reportService = {
  getSalesSummary: (params: { startDate: string; endDate: string }) =>
    api.get('/reports/sales-summary', { params }).then(r => r.data),
  getDailyRevenue: (params: { startDate: string; endDate: string }) =>
    api.get('/reports/daily-revenue', { params }).then(r => r.data),
  getTopProducts: (params: { startDate: string; endDate: string; limit?: number }) =>
    api.get('/reports/top-products', { params }).then(r => r.data),
  getPaymentMethods: (params: { startDate: string; endDate: string }) =>
    api.get('/reports/payment-methods', { params }).then(r => r.data),
  exportSalesCSV: (params: { startDate: string; endDate: string }) =>
    api.get('/reports/export/sales', { params, responseType: 'blob' }).then(r => r.data),
}
