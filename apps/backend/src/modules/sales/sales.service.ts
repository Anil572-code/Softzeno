import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto, RefundSaleDto } from './dto/sale.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate, generateSaleNumber } from '../../common/utils/helpers';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, branchId: string, userId: string, dto: CreateSaleDto) {
    const {
      customerId, orderType = 'DINE_IN', tableId, registerId, shiftId,
      items, payments, discountAmount = 0, tipAmount = 0, couponCode,
      notes, hold, redeemPoints = 0,
    } = dto;

    // Validate and enrich items
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.prisma.product.findFirst({
          where: { id: item.productId, tenantId, deletedAt: null, isActive: true },
          include: { taxClass: true },
        });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

        let variant = null;
        if (item.variantId) {
          variant = await this.prisma.productVariant.findFirst({
            where: { id: item.variantId, productId: item.productId, isActive: true },
          });
          if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);
        }

        const unitPrice = item.unitPrice;
        const taxRate = product.taxClass ? Number(product.taxClass.rate) / 100 : 0;
        const lineSubtotal = unitPrice * item.quantity;
        const lineDiscount = item.discountAmount || 0;
        const lineTaxable = lineSubtotal - lineDiscount;
        const lineTax = lineTaxable * taxRate;
        const lineTotal = lineTaxable + lineTax;

        return {
          productId: item.productId,
          variantId: item.variantId || null,
          name: variant ? `${product.name} - ${variant.name}` : product.name,
          sku: variant ? variant.sku : product.sku,
          quantity: item.quantity,
          unitPrice,
          costPrice: Number(variant ? variant.costPrice : product.costPrice),
          discountAmount: lineDiscount,
          taxAmount: lineTax,
          totalPrice: lineTotal,
          notes: item.notes,
          modifiers: item.modifiers || [],
        };
      }),
    );

    const subtotal = enrichedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const itemsDiscount = enrichedItems.reduce((sum, i) => sum + i.discountAmount, 0);
    const taxAmount = enrichedItems.reduce((sum, i) => sum + i.taxAmount, 0);
    let totalDiscount = itemsDiscount + discountAmount;

    // Apply coupon
    let couponUsageData = null;
    if (couponCode) {
      const now = new Date();
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          tenantId, code: couponCode, isActive: true,
          AND: [
            { OR: [{ validTo: null }, { validTo: { gte: now } }] },
            { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
            { OR: [{ usageLimit: null }, { usedCount: { lt: 999999 } }] },
          ],
        },
      });

      if (coupon) {
        let couponDiscount = 0;
        if (coupon.type === 'PERCENTAGE') {
          couponDiscount = (subtotal * Number(coupon.value)) / 100;
          if (coupon.maxDiscountAmount) {
            couponDiscount = Math.min(couponDiscount, Number(coupon.maxDiscountAmount));
          }
        } else {
          couponDiscount = Number(coupon.value);
        }
        totalDiscount += couponDiscount;
        couponUsageData = { couponId: coupon.id, discountAmount: couponDiscount };
      }
    }

    // Handle loyalty redemption
    let loyaltyDiscount = 0;
    if (redeemPoints > 0 && customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: customerId, tenantId },
      });
      if (customer && customer.loyaltyPoints >= redeemPoints) {
        loyaltyDiscount = redeemPoints * 0.01; // 1 point = $0.01
        totalDiscount += loyaltyDiscount;
      }
    }

    const totalAmount = Math.max(0, subtotal - totalDiscount + taxAmount + tipAmount);
    const paidAmount = payments ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
    const changeAmount = Math.max(0, paidAmount - totalAmount);
    const status = hold ? 'PENDING' : (paidAmount >= totalAmount ? 'PAID' : 'BILLED');

    const saleNumber = generateSaleNumber();

    const sale = await this.prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          tenantId, branchId, registerId, shiftId, customerId, userId,
          saleNumber, orderType, status: status as any,
          subtotal, taxAmount, discountAmount: totalDiscount,
          tipAmount, serviceChargeAmount: 0, totalAmount, paidAmount, changeAmount,
          notes,
          holdedAt: hold ? new Date() : null,
          completedAt: status === 'PAID' ? new Date() : null,
          items: {
            create: enrichedItems,
          },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
        },
      });

      // Create payments
      if (payments && payments.length > 0 && !hold) {
        await tx.payment.createMany({
          data: payments.map((p) => ({
            saleId: newSale.id,
            tenantId,
            method: p.method,
            amount: p.amount,
            reference: p.reference,
            status: 'COMPLETED',
            processedAt: new Date(),
          })),
        });
      }

      // Record coupon usage
      if (couponUsageData) {
        await tx.coupon.update({
          where: { id: couponUsageData.couponId },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
          data: {
            couponId: couponUsageData.couponId,
            saleId: newSale.id,
            customerId,
            discountAmount: couponUsageData.discountAmount,
          },
        });
      }

      // Handle stock deduction
      if (!hold) {
        for (const item of enrichedItems) {
          if (item.productId) {
            await tx.inventory.updateMany({
              where: { branchId, productId: item.productId, variantId: item.variantId },
              data: { quantity: { decrement: item.quantity } },
            });
            await tx.stockMovement.create({
              data: {
                tenantId, branchId, productId: item.productId, variantId: item.variantId,
                type: 'SALE', quantity: -item.quantity, reference: saleNumber, userId,
              },
            });
          }
        }

        // Earn loyalty points (1 point per dollar)
        if (customerId) {
          const earnedPoints = Math.floor(totalAmount);
          if (earnedPoints > 0) {
            const customer = await tx.customer.findUnique({ where: { id: customerId } });
            const newBalance = (customer?.loyaltyPoints || 0) + earnedPoints - redeemPoints;
            await tx.customer.update({
              where: { id: customerId },
              data: { loyaltyPoints: newBalance },
            });
            await tx.loyaltyTransaction.create({
              data: {
                customerId, tenantId, saleId: newSale.id,
                points: earnedPoints, type: 'EARN', balance: newBalance,
              },
            });
          }

          // Redeem points if requested
          if (redeemPoints > 0) {
            await tx.loyaltyTransaction.create({
              data: {
                customerId, tenantId, saleId: newSale.id,
                points: -redeemPoints, type: 'REDEEM',
                balance: (await tx.customer.findUnique({ where: { id: customerId } }))?.loyaltyPoints || 0,
              },
            });
          }
        }
      }

      return newSale;
    });

    return this.findOne(tenantId, sale.id);
  }

  async findAll(tenantId: string, branchId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, branchId, deletedAt: null };
    if (search) {
      where.OR = [
        { saleNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.sale.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          user: { select: { id: true, name: true } },
          items: { select: { id: true, name: true, quantity: true, totalPrice: true } },
          payments: { select: { method: true, amount: true } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, image: true } },
            variant: { select: { id: true, name: true } },
          },
        },
        payments: true,
        customer: true,
        user: { select: { id: true, name: true } },
        refunds: true,
      },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async holdSale(tenantId: string, id: string) {
    const sale = await this.findOne(tenantId, id);
    if (sale.status !== 'PENDING') {
      throw new BadRequestException('Only pending sales can be held');
    }
    return this.prisma.sale.update({
      where: { id },
      data: { holdedAt: new Date() },
    });
  }

  async resumeSale(tenantId: string, id: string) {
    const sale = await this.findOne(tenantId, id);
    if (!sale.holdedAt) {
      throw new BadRequestException('Sale is not on hold');
    }
    return this.prisma.sale.update({
      where: { id },
      data: { holdedAt: null },
    });
  }

  async voidSale(tenantId: string, id: string, userId: string) {
    const sale = await this.findOne(tenantId, id);
    if (!['PENDING', 'BILLED'].includes(sale.status)) {
      throw new BadRequestException('Cannot void this sale');
    }

    // Restore stock
    await this.prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        await tx.inventory.updateMany({
          where: { branchId: sale.branchId, productId: item.productId, variantId: item.variantId },
          data: { quantity: { increment: item.quantity } },
        });
      }
      await tx.sale.update({
        where: { id },
        data: { status: 'CANCELLED', deletedAt: new Date() },
      });
    });

    return { message: 'Sale voided successfully' };
  }

  async refund(tenantId: string, id: string, userId: string, dto: RefundSaleDto) {
    const sale = await this.findOne(tenantId, id);
    if (!['PAID'].includes(sale.status)) {
      throw new BadRequestException('Only paid sales can be refunded');
    }

    const refund = await this.prisma.$transaction(async (tx) => {
      const newRefund = await tx.refund.create({
        data: {
          saleId: id,
          tenantId,
          userId,
          amount: dto.amount,
          reason: dto.reason,
          items: dto.items || [],
          status: 'COMPLETED',
        },
      });

      await tx.sale.update({
        where: { id },
        data: { status: 'REFUNDED' },
      });

      return newRefund;
    });

    return refund;
  }

  async getHeldSales(tenantId: string, branchId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId, branchId, status: 'PENDING', holdedAt: { not: null } },
      include: {
        items: { select: { name: true, quantity: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }
}
