'use client'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/services/report.service'

export function useSalesSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['sales-summary', startDate, endDate],
    queryFn: () => reportService.getSalesSummary({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  })
}

export function useReportDailyRevenue(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['report-daily-revenue', startDate, endDate],
    queryFn: () => reportService.getDailyRevenue({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  })
}

export function useReportTopProducts(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['report-top-products', startDate, endDate],
    queryFn: () => reportService.getTopProducts({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  })
}

export function usePaymentMethods(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['payment-methods', startDate, endDate],
    queryFn: () => reportService.getPaymentMethods({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  })
}
