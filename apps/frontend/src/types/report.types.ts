export interface DashboardStats {
  today: { sales: number; revenue: number }
  thisMonth: { sales: number; revenue: number }
  lowStockAlerts: number
  recentSales: {
    id: string
    saleNumber: string
    totalAmount: number
    status: string
    customer?: { id: string; name: string } | null
    _count?: { items: number }
  }[]
}

export interface SalesReportRow {
  period: string
  count: number
  revenue: number
  tax: number
  discount: number
}

export interface ProductReportRow {
  product: { id: string; name: string; sku?: string | null; image?: string | null }
  quantity: number
  revenue: number
  cost: number
  profit: number
}

export interface StaffReportRow {
  user: { id: string; name: string; role: string }
  totalSales: number
  totalRevenue: number
}

export interface BranchReportRow {
  branch: { id: string; name: string; code: string }
  totalSales: number
  totalRevenue: number
  totalTax: number
}
