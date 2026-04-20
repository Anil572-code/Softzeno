'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restaurantService } from '@/services/restaurant.service'
import type { KitchenStatus, TableStatus } from '@/types/restaurant.types'

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
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) => restaurantService.updateTable(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
    onError: () => toast.error('Failed to update table'),
  })
}

export function useKitchenOrders() {
  return useQuery({
    queryKey: ['kitchen-tickets'],
    queryFn: () => restaurantService.getKitchenTickets(),
    refetchInterval: 30000,
  })
}

export function useUpdateKitchenOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: KitchenStatus }) => restaurantService.updateKitchenTicketStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kitchen-tickets'] }),
    onError: () => toast.error('Failed to update order status'),
  })
}
