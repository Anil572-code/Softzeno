import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailySalesReport(tenantId: string, branchId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [sales, payments, topProducts] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          tenantId, branchId,
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: { in: ['PAID', 'BILLED'] },
        },
        _sum: { totalAmount: true, taxAmount: true, discountAmount: true },
        _count: true,
        _avg: { totalAmount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where: {
          tenantId,
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            tenantId, branchId,
            createdAt: { gte: startOfDay, lte: endOfDay },
            status: { in: ['PAID', 'BILLED'] },
          },
        },
        _sum: { quantity: true, totalPrice: true },
        _count: true,
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      }),
    ]);

    // Enrich top products
    const enrichedProducts = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await this.prisma.product.findUnique({
          where: { id: tp.productId },
          select: { id: true, name: true, image: true },
        });
        return { ...tp, product };
      }),
    );

    return {
      date: date.toISOString().split('T')[0],
      summary: {
        totalSales: sales._count,
        totalRevenue: sales._sum.totalAmount || 0,
        totalTax: sales._sum.taxAmount || 0,
        totalDiscount: sales._sum.discountAmount || 0,
        averageOrderValue: sales._avg.totalAmount || 0,
      },
      paymentBreakdown: payments,
      topProducts: enrichedProducts,
    };
  }

  async getSalesReport(
    tenantId: string,
    branchId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId, branchId,
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['PAID', 'BILLED'] },
        deletedAt: null,
      },
      select: {
        id: true, saleNumber: true, totalAmount: true, taxAmount: true,
        discountAmount: true, paidAmount: true, createdAt: true, status: true,
        orderType: true, customerId: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by period
    const grouped: Record<string, any> = {};
    for (const sale of sales) {
      let key: string;
      const d = new Date(sale.createdAt);
      if (groupBy === 'day') key = d.toISOString().split('T')[0];
      else if (groupBy === 'month') key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      else key = d.toISOString().split('T')[0]; // week simplified

      if (!grouped[key]) {
        grouped[key] = { period: key, count: 0, revenue: 0, tax: 0, discount: 0 };
      }
      grouped[key].count++;
      grouped[key].revenue += Number(sale.totalAmount);
      grouped[key].tax += Number(sale.taxAmount);
      grouped[key].discount += Number(sale.discountAmount);
    }

    return Object.values(grouped);
  }

  async getProductReport(tenantId: string, branchId: string, startDate: Date, endDate: Date) {
    const items = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          tenantId, branchId,
          createdAt: { gte: startDate, lte: endDate },
          status: { in: ['PAID', 'BILLED'] },
        },
      },
      _sum: { quantity: true, totalPrice: true, costPrice: true },
      _count: true,
      orderBy: { _sum: { totalPrice: 'desc' } },
    });

    return Promise.all(
      items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, sku: true, image: true },
        });
        const revenue = Number(item._sum.totalPrice || 0);
        const cost = Number(item._sum.costPrice || 0) * Number(item._sum.quantity || 0);
        return { product, quantity: item._sum.quantity, revenue, cost, profit: revenue - cost };
      }),
    );
  }

  async getStaffReport(tenantId: string, branchId: string, startDate: Date, endDate: Date) {
    const sales = await this.prisma.sale.groupBy({
      by: ['userId'],
      where: {
        tenantId, branchId,
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['PAID', 'BILLED'] },
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    return Promise.all(
      sales.map(async (s) => {
        const user = await this.prisma.user.findUnique({
          where: { id: s.userId },
          select: { id: true, name: true, role: true },
        });
        return { user, totalSales: s._count, totalRevenue: s._sum.totalAmount };
      }),
    );
  }

  async getBranchReport(tenantId: string, startDate: Date, endDate: Date) {
    const sales = await this.prisma.sale.groupBy({
      by: ['branchId'],
      where: {
        tenantId,
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['PAID', 'BILLED'] },
      },
      _sum: { totalAmount: true, taxAmount: true },
      _count: true,
    });

    return Promise.all(
      sales.map(async (s) => {
        const branch = await this.prisma.branch.findUnique({
          where: { id: s.branchId },
          select: { id: true, name: true, code: true },
        });
        return { branch, totalSales: s._count, totalRevenue: s._sum.totalAmount, totalTax: s._sum.taxAmount };
      }),
    );
  }

  async getDashboard(tenantId: string, branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todaySales, monthlySales, lowStock, recentSales] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          tenantId, branchId,
          createdAt: { gte: today },
          status: { in: ['PAID', 'BILLED'] },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.sale.aggregate({
        where: {
          tenantId, branchId,
          createdAt: { gte: startOfMonth },
          status: { in: ['PAID', 'BILLED'] },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.inventory.count({
        where: {
          tenantId, branchId,
          quantity: { lte: 10 },
        },
      }),
      this.prisma.sale.findMany({
        where: { tenantId, branchId, deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      today: { sales: todaySales._count, revenue: todaySales._sum.totalAmount || 0 },
      thisMonth: { sales: monthlySales._count, revenue: monthlySales._sum.totalAmount || 0 },
      lowStockAlerts: lowStock,
      recentSales,
    };
  }
}
