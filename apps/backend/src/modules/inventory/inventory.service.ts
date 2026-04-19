import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdjustStockDto, TransferStockDto } from './dto/inventory.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getStockLevels(tenantId: string, branchId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, branchId };

    if (search) {
      where.product = { name: { contains: search, mode: 'insensitive' } };
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.inventory.findMany({
        where, skip, take: limit,
        include: {
          product: { select: { id: true, name: true, sku: true, barcode: true, image: true } },
          variant: { select: { id: true, name: true, sku: true } },
        },
        orderBy: { quantity: 'asc' },
      }),
      this.prisma.inventory.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async getLowStockItems(tenantId: string, branchId: string) {
    return this.prisma.$queryRaw<any[]>`
      SELECT i.*, p.name as "productName", p.sku as "productSku"
      FROM "Inventory" i
      JOIN "Product" p ON p.id = i."productId"
      WHERE i."tenantId" = ${tenantId}
        AND i."branchId" = ${branchId}
        AND i."reorderLevel" > 0
        AND i.quantity <= i."reorderLevel"
    `;
  }

  async adjustStock(tenantId: string, branchId: string, userId: string, dto: AdjustStockDto) {
    const { productId, variantId, quantity, type, notes, reference } = dto;

    const inventory = await this.prisma.inventory.upsert({
      where: {
        branchId_productId_variantId: {
          branchId,
          productId,
          variantId: variantId || null,
        },
      },
      create: {
        tenantId,
        branchId,
        productId,
        variantId,
        quantity: 0,
        reservedQty: 0,
        reorderLevel: 0,
      },
      update: {},
    });

    const isDeduction = ['SALE', 'WASTAGE', 'TRANSFER'].includes(type);
    const newQty = isDeduction
      ? Number(inventory.quantity) - Math.abs(quantity)
      : Number(inventory.quantity) + Math.abs(quantity);

    if (isDeduction && newQty < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const [updatedInventory] = await this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { id: inventory.id },
        data: { quantity: newQty },
      }),
      this.prisma.stockMovement.create({
        data: {
          tenantId,
          branchId,
          productId,
          variantId,
          type,
          quantity: isDeduction ? -Math.abs(quantity) : Math.abs(quantity),
          notes,
          reference,
          userId,
        },
      }),
    ]);

    return updatedInventory;
  }

  async transferStock(tenantId: string, userId: string, dto: TransferStockDto) {
    const { fromBranchId, toBranchId, productId, variantId, quantity, notes } = dto;

    if (fromBranchId === toBranchId) {
      throw new BadRequestException('Source and destination branch cannot be the same');
    }

    const fromInventory = await this.prisma.inventory.findFirst({
      where: { branchId: fromBranchId, productId, variantId: variantId || null },
    });

    if (!fromInventory || Number(fromInventory.quantity) < quantity) {
      throw new BadRequestException('Insufficient stock in source branch');
    }

    const transferRef = `TRF-${Date.now()}`;

    await this.prisma.$transaction([
      // Deduct from source
      this.prisma.inventory.update({
        where: { id: fromInventory.id },
        data: { quantity: Number(fromInventory.quantity) - quantity },
      }),
      // Add to destination
      this.prisma.inventory.upsert({
        where: {
          branchId_productId_variantId: {
            branchId: toBranchId,
            productId,
            variantId: variantId || null,
          },
        },
        create: { tenantId, branchId: toBranchId, productId, variantId, quantity, reservedQty: 0, reorderLevel: 0 },
        update: { quantity: { increment: quantity } },
      }),
      // Log outgoing
      this.prisma.stockMovement.create({
        data: {
          tenantId, branchId: fromBranchId, productId, variantId,
          type: 'TRANSFER', quantity: -quantity, reference: transferRef, notes, userId,
        },
      }),
      // Log incoming
      this.prisma.stockMovement.create({
        data: {
          tenantId, branchId: toBranchId, productId, variantId,
          type: 'TRANSFER', quantity, reference: transferRef, notes, userId,
        },
      }),
    ]);

    return { message: 'Stock transferred successfully', reference: transferRef };
  }

  async getMovementHistory(tenantId: string, branchId: string, productId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, branchId, productId };

    const [data, totalCount] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }
}
