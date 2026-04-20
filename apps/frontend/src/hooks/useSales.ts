'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { saleService } from '@/services/sale.service'

export function useSales(params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleService.getSales(params),
  })
}

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saleService.createSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['sale-stats'] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
    onError: () => toast.error('Failed to complete sale'),
  })
}
