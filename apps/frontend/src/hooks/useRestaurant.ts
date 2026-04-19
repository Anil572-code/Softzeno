'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restaurantService } from '@/services/restaurant.service'

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: () => restaurantService.getTables(),
    refetchInterval: 30000,
  })
}

export function useUpdateTableStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => restaurantService.updateTableStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
    onError: () => toast.error('Failed to update table'),
  })
}

export function useKitchenOrders() {
  return useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: () => restaurantService.getKitchenOrders(),
    refetchInterval: 30000,
  })
}

export function useUpdateKitchenOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => restaurantService.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kitchen-orders'] }),
    onError: () => toast.error('Failed to update order status'),
  })
}
