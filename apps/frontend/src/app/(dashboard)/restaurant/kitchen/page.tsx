'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { restaurantService } from '@/services/restaurant.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const ticketStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as const

export default function KitchenDisplayPage() {
  const queryClient = useQueryClient()
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['kitchen-tickets'],
    queryFn: () => restaurantService.getKitchenTickets(),
    refetchInterval: 15000,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => restaurantService.updateKitchenTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-tickets'] })
      toast.success('Ticket updated')
    },
    onError: () => toast.error('Failed to update ticket'),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kitchen Display</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and update kitchen tickets in real time.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">Loading kitchen tickets...</CardContent>
        </Card>
      ) : (tickets?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">No kitchen tickets available.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(tickets ?? []).map((ticket) => (
            <Card key={ticket.id} className="border-l-4 border-indigo-500">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{ticket.ticketNumber}</h3>
                    <p className="text-xs text-gray-500">
                      Order {ticket.restaurantOrder.orderNumber} • {ticket.restaurantOrder.type}
                    </p>
                  </div>
                  <Badge variant="secondary">{ticket.status}</Badge>
                </div>

                <div className="space-y-2">
                  {ticket.items.map((item, index) => (
                    <div key={item.id ?? `${item.name}-${index}`} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.notes ?? 'No notes'}</p>
                      </div>
                      <span className="font-semibold">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => updateStatus.mutate({ id: ticket.id, status: value })}
                  >
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketStatuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus.mutate({ id: ticket.id, status: 'READY' })}
                  >
                    Mark Ready
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
