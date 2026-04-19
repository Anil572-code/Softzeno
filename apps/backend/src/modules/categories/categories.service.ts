import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate, slugify } from '../../common/utils/helpers';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCategoryDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await this.prisma.category.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });
    if (existing) throw new ConflictException('Category slug already exists');

    return this.prisma.category.create({
      data: { tenantId, ...dto, slug },
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'sortOrder', sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, totalCount] = await Promise.all([
      this.prisma.category.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: {
          children: { select: { id: true, name: true, slug: true } },
          _count: { select: { products: true } },
        },
      }),
      this.prisma.category.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: {
        parent: { select: { id: true, name: true } },
        children: true,
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(tenantId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(tenantId, id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.category.delete({ where: { id } });
  }
}
