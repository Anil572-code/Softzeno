import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBranchDto) {
    const existing = await this.prisma.branch.findFirst({
      where: { tenantId, code: dto.code, deletedAt: null },
    });
    if (existing) throw new ConflictException('Branch code already exists');

    return this.prisma.branch.create({
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
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { users: true, sales: true } },
        },
      }),
      this.prisma.branch.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        _count: { select: { users: true, sales: true } },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(tenantId: string, id: string, dto: UpdateBranchDto) {
    await this.findOne(tenantId, id);
    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
