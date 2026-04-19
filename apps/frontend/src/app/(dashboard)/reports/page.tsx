'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/services/report.service'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export default function ReportsPage() {
  const initialRange = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 30)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }, [])

  const [startDate, setStartDate] = useState(initialRange.start)
  const [endDate, setEndDate] = useState(initialRange.end)

  const { data: salesReport, isLoading: loadingSales } = useQuery({
    queryKey: ['report-sales', startDate, endDate],
    queryFn: () => reportService.getSalesReport({ startDate, endDate, groupBy: 'day' }),
  })

  const { data: productReport, isLoading: loadingProducts } = useQuery({
    queryKey: ['report-products', startDate, endDate],
    queryFn: () => reportService.getProductReport({ startDate, endDate }),
  })

  const { data: staffReport, isLoading: loadingStaff } = useQuery({
    queryKey: ['report-staff', startDate, endDate],
    queryFn: () => reportService.getStaffReport({ startDate, endDate }),
  })

  const { data: branchReport, isLoading: loadingBranches } = useQuery({
    queryKey: ['report-branches', startDate, endDate],
    queryFn: () => reportService.getBranchReport({ startDate, endDate }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review performance across sales, products, and staff.</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">From</span>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">To</span>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardContent className="p-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Discount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingSales ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                      </TableRow>
                    ) : (salesReport?.length ?? 0) === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">No sales data</TableCell>
                      </TableRow>
                    ) : (
                      (salesReport ?? []).map((row) => (
                        <TableRow key={row.period}>
                          <TableCell>{row.period}</TableCell>
                          <TableCell>{row.count}</TableCell>
                          <TableCell>{formatCurrency(Number(row.revenue))}</TableCell>
                          <TableCell>{formatCurrency(Number(row.tax))}</TableCell>
                          <TableCell>{formatCurrency(Number(row.discount))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardContent className="p-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingProducts ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                      </TableRow>
                    ) : (productReport?.length ?? 0) === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">No product data</TableCell>
                      </TableRow>
                    ) : (
                      (productReport ?? []).map((row) => (
                        <TableRow key={row.product.id}>
                          <TableCell>{row.product.name}</TableCell>
                          <TableCell>{Number(row.quantity)}</TableCell>
                          <TableCell>{formatCurrency(Number(row.revenue))}</TableCell>
                          <TableCell>{formatCurrency(Number(row.cost))}</TableCell>
                          <TableCell>{formatCurrency(Number(row.profit))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardContent className="p-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingStaff ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-gray-500">Loading...</TableCell>
                      </TableRow>
                    ) : (staffReport?.length ?? 0) === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-gray-500">No staff data</TableCell>
                      </TableRow>
                    ) : (
                      (staffReport ?? []).map((row) => (
                        <TableRow key={row.user.id}>
                          <TableCell>{row.user.name}</TableCell>
                          <TableCell>{row.user.role}</TableCell>
                          <TableCell>{row.totalSales}</TableCell>
                          <TableCell>{formatCurrency(Number(row.totalRevenue))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardContent className="p-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Tax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBranches ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-gray-500">Loading...</TableCell>
                      </TableRow>
                    ) : (branchReport?.length ?? 0) === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-gray-500">No branch data</TableCell>
                      </TableRow>
                    ) : (
                      (branchReport ?? []).map((row) => (
                        <TableRow key={row.branch.id}>
                          <TableCell>{row.branch.name}</TableCell>
                          <TableCell>{row.totalSales}</TableCell>
                          <TableCell>{formatCurrency(Number(row.totalRevenue))}</TableCell>
                          <TableCell>{formatCurrency(Number(row.totalTax))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
