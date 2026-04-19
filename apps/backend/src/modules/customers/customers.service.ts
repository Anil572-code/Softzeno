import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, AdjustLoyaltyDto } from './dto/customer.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { tenantId, ...dto },
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.customer.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        select: {
          id: true, name: true, email: true, phone: true, membershipTier: true,
          loyaltyPoints: true, creditBalance: true, createdAt: true,
          _count: { select: { sales: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        _count: { select: { sales: true } },
        sales: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, saleNumber: true, totalAmount: true, createdAt: true, status: true },
        },
        loyaltyTx: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async adjustLoyaltyPoints(tenantId: string, customerId: string, dto: AdjustLoyaltyDto) {
    const customer = await this.findOne(tenantId, customerId);

    if (dto.points < 0 && customer.loyaltyPoints + dto.points < 0) {
      throw new BadRequestException('Insufficient loyalty points');
    }

    const newBalance = customer.loyaltyPoints + dto.points;
    const type = dto.points >= 0 ? 'ADJUST' : 'REDEEM';

    const [updatedCustomer] = await this.prisma.$transaction([
      this.prisma.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: newBalance },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          customerId,
          tenantId,
          points: dto.points,
          type: type as any,
          balance: newBalance,
          notes: dto.notes,
        },
      }),
    ]);

    return updatedCustomer;
  }
}
