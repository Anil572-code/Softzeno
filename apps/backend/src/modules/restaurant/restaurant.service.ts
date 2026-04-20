import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRestaurantOrderDto,
  UpdateRestaurantOrderDto,
  AddItemsToOrderDto,
  CreateTableDto,
  UpdateTableDto,
} from './dto/restaurant.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate, generateOrderNumber } from '../../common/utils/helpers';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  // ---- Tables ----
  async createTable(tenantId: string, branchId: string, dto: CreateTableDto) {
    return this.prisma.table.create({
      data: { tenantId, branchId, ...dto },
    });
  }

  async getTables(tenantId: string, branchId: string) {
    return this.prisma.table.findMany({
      where: { tenantId, branchId, isActive: true },
      include: {
        restaurantOrders: {
          where: { status: { notIn: ['PAID', 'CANCELLED'] } },
          select: { id: true, orderNumber: true, status: true, partySize: true },
        },
      },
      orderBy: [{ section: 'asc' }, { name: 'asc' }],
    });
  }

  async updateTable(tenantId: string, branchId: string, id: string, dto: UpdateTableDto) {
    const table = await this.prisma.table.findFirst({ where: { id, tenantId, branchId } });
    if (!table) throw new NotFoundException('Table not found');
    return this.prisma.table.update({ where: { id }, data: dto });
  }

  async deleteTable(tenantId: string, branchId: string, id: string) {
    const table = await this.prisma.table.findFirst({ where: { id, tenantId, branchId } });
    if (!table) throw new NotFoundException('Table not found');
    return this.prisma.table.update({ where: { id }, data: { isActive: false } });
  }

  // ---- Orders ----
  async createOrder(tenantId: string, branchId: string, userId: string, dto: CreateRestaurantOrderDto) {
    const { items, tableId, customerId, type = 'DINE_IN', partySize = 1, notes } = dto;

    // Enrich items
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.prisma.product.findFirst({
          where: { id: item.productId, tenantId, deletedAt: null, isActive: true },
        });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

        let variantName = '';
        if (item.variantId) {
          const variant = await this.prisma.productVariant.findFirst({
            where: { id: item.variantId, productId: item.productId },
          });
          if (variant) variantName = ` - ${variant.name}`;
        }

        return {
          productId: item.productId,
          variantId: item.variantId || null,
          name: `${product.name}${variantName}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          modifiers: item.modifiers || [],
          notes: item.notes,
          status: 'PENDING',
        };
      }),
    );

    const subtotal = enrichedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const serviceChargeRate = 0.05; // 5% service charge
    const serviceCharge = subtotal * serviceChargeRate;
    const taxRate = 0.1; // 10% tax - ideally from settings
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + serviceCharge + taxAmount;
    const totalItems = enrichedItems.reduce((sum, i) => sum + i.quantity, 0);
    const orderNumber = generateOrderNumber('KOT');

    // Update table status if applicable
    if (tableId) {
      await this.prisma.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      });
    }

    const order = await this.prisma.restaurantOrder.create({
      data: {
        tenantId, branchId, tableId, userId, customerId,
        orderNumber, type: type as any, status: 'PLACED',
        partySize, notes, totalItems, subtotal, taxAmount, serviceCharge, totalAmount,
        placedAt: new Date(),
        items: { create: enrichedItems as any },
      },
      include: {
        items: true,
        table: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    // Auto-create kitchen ticket
    await this.prisma.kitchenTicket.create({
      data: {
        tenantId, branchId, restaurantOrderId: order.id,
        ticketNumber: `KT-${Date.now()}`,
        items: enrichedItems as any,
        status: 'PENDING',
      },
    });

    return order;
  }

  async getOrders(tenantId: string, branchId: string, pagination: PaginationDto, status?: string) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, branchId };
    if (status) where.status = status;

    const [data, totalCount] = await Promise.all([
      this.prisma.restaurantOrder.findMany({
        where, skip, take: limit, orderBy: { createdAt: sortOrder },
        include: {
          table: { select: { id: true, name: true } },
          items: { select: { id: true, name: true, quantity: true, status: true } },
          customer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.restaurantOrder.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async getOrder(tenantId: string, id: string) {
    const order = await this.prisma.restaurantOrder.findFirst({
      where: { id, tenantId },
      include: {
        table: true,
        items: {
          include: {
            product: { select: { id: true, name: true, image: true } },
          },
        },
        customer: true,
        kitchenTickets: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(tenantId: string, id: string, status: string) {
    const order = await this.getOrder(tenantId, id);
    const validTransitions: any = {
      PLACED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['SERVED'],
      SERVED: ['BILLED'],
      BILLED: ['PAID'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${status}`);
    }

    const updateData: any = { status };
    if (status === 'READY') updateData.readyAt = new Date();
    if (status === 'SERVED') updateData.servedAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();

    // Free up table if order is paid/cancelled
    if (['PAID', 'CANCELLED'].includes(status) && order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.prisma.restaurantOrder.update({
      where: { id },
      data: updateData,
    });
  }

  async addItemsToOrder(tenantId: string, orderId: string, dto: AddItemsToOrderDto) {
    const order = await this.getOrder(tenantId, orderId);

    if (!['PLACED', 'PREPARING'].includes(order.status)) {
      throw new BadRequestException('Cannot add items to this order');
    }

    const enrichedItems = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.product.findFirst({
          where: { id: item.productId, tenantId },
        });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

        return {
          restaurantOrderId: orderId,
          productId: item.productId,
          variantId: item.variantId || null,
          name: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          modifiers: item.modifiers || [],
          notes: item.notes,
          status: 'PENDING',
        };
      }),
    );

    await this.prisma.restaurantOrderItem.createMany({ data: enrichedItems as any });

    const additionalSubtotal = enrichedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const additionalTax = additionalSubtotal * 0.1;
    const additionalServiceCharge = additionalSubtotal * 0.05;

    await this.prisma.restaurantOrder.update({
      where: { id: orderId },
      data: {
        totalItems: { increment: enrichedItems.reduce((s, i) => s + i.quantity, 0) },
        subtotal: { increment: additionalSubtotal },
        taxAmount: { increment: additionalTax },
        serviceCharge: { increment: additionalServiceCharge },
        totalAmount: { increment: additionalSubtotal + additionalTax + additionalServiceCharge },
      },
    });

    // Create new kitchen ticket for added items
    await this.prisma.kitchenTicket.create({
      data: {
        tenantId,
        branchId: order.branchId,
        restaurantOrderId: orderId,
        ticketNumber: `KT-${Date.now()}`,
        items: enrichedItems as any,
        status: 'PENDING',
      },
    });

    return this.getOrder(tenantId, orderId);
  }

  // ---- Kitchen ----
  async getKitchenTickets(tenantId: string, branchId: string, status?: string) {
    const where: any = { tenantId, branchId };
    if (status) where.status = status;

    return this.prisma.kitchenTicket.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        restaurantOrder: {
          select: { orderNumber: true, type: true, tableId: true, table: { select: { name: true } } },
        },
      },
    });
  }

  async updateKitchenTicketStatus(tenantId: string, id: string, status: string) {
    const ticket = await this.prisma.kitchenTicket.findFirst({
      where: { id, tenantId },
    });
    if (!ticket) throw new NotFoundException('Kitchen ticket not found');

    const updateData: any = { status };
    if (status === 'PREPARING') updateData.startedAt = new Date();
    if (status === 'READY') updateData.completedAt = new Date();

    return this.prisma.kitchenTicket.update({
      where: { id },
      data: updateData,
    });
  }
}
