import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code.toUpperCase() } },
    });
    if (existing) throw new BadRequestException('Coupon code already exists');

    return this.prisma.coupon.create({
      data: {
        tenantId, ...dto,
        code: dto.code.toUpperCase(),
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];

    const [data, totalCount] = await Promise.all([
      this.prisma.coupon.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { _count: { select: { usages: true } } },
      }),
      this.prisma.coupon.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, tenantId },
      include: {
        usages: { take: 10, orderBy: { usedAt: 'desc' } },
        _count: { select: { usages: true } },
      },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(tenantId: string, id: string, dto: UpdateCouponDto) {
    await this.findOne(tenantId, id);
    return this.prisma.coupon.update({
      where: { id },
      data: { ...dto, validTo: dto.validTo ? new Date(dto.validTo) : undefined },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.coupon.delete({ where: { id } });
  }

  async validate(tenantId: string, dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { tenantId, code: dto.code.toUpperCase(), isActive: true },
    });

    if (!coupon) throw new NotFoundException('Invalid coupon code');

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) throw new BadRequestException('Coupon not yet valid');
    if (coupon.validTo && coupon.validTo < now) throw new BadRequestException('Coupon has expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    if (coupon.minOrderAmount && dto.orderAmount && dto.orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(`Minimum order amount is ${coupon.minOrderAmount}`);
    }

    let discount = 0;
    if (dto.orderAmount) {
      if (coupon.type === 'PERCENTAGE') {
        discount = (dto.orderAmount * Number(coupon.value)) / 100;
        if (coupon.maxDiscountAmount) discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      } else {
        discount = Number(coupon.value);
      }
    }

    return { valid: true, coupon, discount };
  }
}
