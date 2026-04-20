'use client'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/services/report.service'

export function useSalesSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['sales-summary', startDate, endDate],
    queryFn: () => reportService.getSalesReport({ startDate, endDate, groupBy: 'day' }),
    enabled: !!startDate && !!endDate,
  })
}

export function useReportDailyRevenue(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['report-daily-revenue', startDate, endDate],
    queryFn: () => reportService.getSalesReport({ startDate, endDate, groupBy: 'day' }),
    enabled: !!startDate && !!endDate,
  })
}

export function useReportTopProducts(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['report-top-products', startDate, endDate],
    queryFn: () => reportService.getProductReport({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  })
}

export function usePaymentMethods(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['payment-methods', startDate, endDate],
    queryFn: () => reportService.getSalesReport({ startDate, endDate, groupBy: 'day' }),
    enabled: !!startDate && !!endDate,
  })
}
