import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate, slugify } from '../../common/utils/helpers';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Tenant slug already exists');

    const emailExists = await this.prisma.tenant.findUnique({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('Email already registered');

    return this.prisma.tenant.create({
      data: { ...dto, slug },
    });
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { branches: true, users: true } } },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, deletedAt: null },
      include: {
        branches: { where: { deletedAt: null } },
        _count: { select: { users: true, products: true, customers: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug, deletedAt: null, isActive: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async getStats(tenantId: string) {
    const [branches, users, products, customers, sales] = await Promise.all([
      this.prisma.branch.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.user.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.product.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.customer.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.sale.count({ where: { tenantId, deletedAt: null } }),
    ]);
    return { branches, users, products, customers, sales };
  }
}
