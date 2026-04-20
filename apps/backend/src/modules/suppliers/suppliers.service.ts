import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSupplierDto, UpdateSupplierDto,
  CreatePurchaseOrderDto, ReceivePurchaseOrderDto,
} from './dto/supplier.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate, generateOrderNumber } from '../../common/utils/helpers';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async createSupplier(tenantId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: { tenantId, ...dto } });
  }

  async findAllSuppliers(tenantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.supplier.findMany({
        where, skip, take: limit, orderBy: { name: 'asc' },
        include: { _count: { select: { purchaseOrders: true } } },
      }),
      this.prisma.supplier.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOneSupplier(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        purchaseOrders: { take: 5, orderBy: { createdAt: 'desc' } },
        _count: { select: { purchaseOrders: true } },
      },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async updateSupplier(tenantId: string, id: string, dto: UpdateSupplierDto) {
    await this.findOneSupplier(tenantId, id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async removeSupplier(tenantId: string, id: string) {
    await this.findOneSupplier(tenantId, id);
    return this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // Purchase Orders
  async createPurchaseOrder(tenantId: string, userId: string, dto: CreatePurchaseOrderDto) {
    const { supplierId, branchId, notes, items } = dto;

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    const taxAmount = items.reduce((sum, i) => sum + (i.taxAmount || 0), 0);
    const totalAmount = subtotal + taxAmount;
    const orderNumber = generateOrderNumber('PO');

    return this.prisma.purchaseOrder.create({
      data: {
        tenantId, branchId, supplierId, userId, orderNumber,
        status: 'DRAFT', subtotal, taxAmount, totalAmount,
        notes, orderedAt: new Date(),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            receivedQty: 0,
            unitCost: item.unitCost,
            taxAmount: item.taxAmount || 0,
            totalCost: item.quantity * item.unitCost + (item.taxAmount || 0),
          })),
        },
      },
      include: { items: true, supplier: { select: { id: true, name: true } } },
    });
  }

  async findAllPurchaseOrders(tenantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

    const [data, totalCount] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOnePurchaseOrder(tenantId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        branch: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
            variant: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async receivePurchaseOrder(tenantId: string, id: string, dto: ReceivePurchaseOrderDto) {
    const po = await this.findOnePurchaseOrder(tenantId, id);

    await this.prisma.$transaction(async (tx) => {
      for (const item of po.items) {
        const receivedQty = dto.receivedItems[item.id] || 0;
        if (receivedQty <= 0) continue;

        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { receivedQty: { increment: receivedQty } },
        });

        // Update inventory
        await tx.inventory.upsert({
          where: {
            branchId_productId_variantId: {
              branchId: po.branchId,
              productId: item.productId,
              variantId: item.variantId || null,
            },
          },
          create: {
            tenantId, branchId: po.branchId, productId: item.productId,
            variantId: item.variantId, quantity: receivedQty, reservedQty: 0, reorderLevel: 0,
          },
          update: { quantity: { increment: receivedQty } },
        });

        // Log stock movement
        await tx.stockMovement.create({
          data: {
            tenantId, branchId: po.branchId, productId: item.productId,
            variantId: item.variantId, type: 'PURCHASE', quantity: receivedQty,
            reference: po.orderNumber,
          },
        });
      }

      // Check if all items fully received
      const allReceived = po.items.every(
        (item) => Number(item.receivedQty) + (dto.receivedItems[item.id] || 0) >= Number(item.quantity),
      );
      const someReceived = po.items.some(
        (item) => (dto.receivedItems[item.id] || 0) > 0,
      );

      await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: allReceived ? 'RECEIVED' : someReceived ? 'PARTIAL' : undefined,
          receivedAt: allReceived ? new Date() : undefined,
        },
      });
    });

    return this.findOnePurchaseOrder(tenantId, id);
  }
}
