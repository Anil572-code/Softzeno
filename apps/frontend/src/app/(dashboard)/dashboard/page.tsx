'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { reportService } from '@/services/report.service'
import { inventoryService } from '@/services/inventory.service'
import { useAuthStore } from '@/store/auth.store'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ShoppingCart, DollarSign, Package, AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const branchId = useAuthStore((state) => state.user?.branchId)

  const { startDate, endDate } = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 6)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }, [])

  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportService.getDashboard(),
    refetchInterval: 60000,
  })

  const { data: salesReport, isLoading: loadingSales } = useQuery({
    queryKey: ['sales-report', startDate, endDate],
    queryFn: () => reportService.getSalesReport({ startDate, endDate, groupBy: 'day' }),
  })

  const { data: productReport, isLoading: loadingProducts } = useQuery({
    queryKey: ['product-report', startDate, endDate],
    queryFn: () => reportService.getProductReport({ startDate, endDate }),
  })

  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock', branchId],
    queryFn: () => (branchId ? inventoryService.getLowStock(branchId) : Promise.resolve([])),
    enabled: !!branchId,
  })

  const statCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(Number(dashboard?.today.revenue ?? 0)),
      icon: DollarSign,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      helper: 'Today',
    },
    {
      title: "Today's Orders",
      value: dashboard?.today.sales ?? 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      helper: 'Today',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(Number(dashboard?.thisMonth.revenue ?? 0)),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      helper: 'This month',
    },
    {
      title: 'Low Stock Alerts',
      value: dashboard?.lowStockAlerts ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      helper: 'Below reorder level',
    },
  ]

  const revenueData = (salesReport ?? []).map((row) => ({
    date: row.period,
    revenue: Number(row.revenue),
  }))

  const topProducts = (productReport ?? [])
    .slice()
    .sort((a, b) => Number(b.revenue) - Number(a.revenue))
    .slice(0, 5)

  const recentSales = dashboard?.recentSales ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back! Here is the latest overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                {loadingDashboard ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                      <Badge variant="secondary" className="mt-2 text-gray-600 bg-gray-100">
                        {card.helper}
                      </Badge>
                    </div>
                    <div className={`p-3 rounded-lg ${card.bg}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Overview (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <Skeleton className="h-64 w-full" />
            ) : revenueData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <TrendingUp className="h-8 w-8 mb-2" />
                <p className="text-sm">No revenue data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProducts ? (
              <Skeleton className="h-64 w-full" />
            ) : topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Package className="h-8 w-8 mb-2" />
                <p className="text-sm">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.product.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.product.name}</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (Number(p.revenue) / Number(topProducts[0]?.revenue || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{Number(p.quantity)} sold</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <Skeleton className="h-48 w-full" />
            ) : recentSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <ShoppingCart className="h-8 w-8 mb-2" />
                <p className="text-sm">No sales yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{sale.saleNumber}</p>
                      <p className="text-xs text-gray-500">{sale.customer?.name ?? 'Walk-in'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(Number(sale.totalAmount))}</p>
                      <Badge variant="outline" className="text-xs">{sale.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <Skeleton className="h-48 w-full" />
            ) : (lowStockItems?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Package className="h-8 w-8 mb-2" />
                <p className="text-sm">All stock levels normal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(lowStockItems ?? []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.product.sku ?? 'No SKU'}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {Number(item.quantity)} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
