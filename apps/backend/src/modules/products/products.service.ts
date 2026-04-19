import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate, slugify } from '../../common/utils/helpers';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await this.prisma.product.findFirst({
      where: { tenantId, slug, deletedAt: null },
    });
    if (existing) throw new ConflictException('Product slug already exists');

    return this.prisma.product.create({
      data: { tenantId, ...dto, slug },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, abbreviation: true } },
        taxClass: { select: { id: true, name: true, rate: true } },
      },
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto, branchId?: string) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, deletedAt: null, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, abbreviation: true } },
          variants: { where: { isActive: true }, select: { id: true, name: true, sku: true, sellingPrice: true } },
          ...(branchId ? {
            inventory: {
              where: { branchId },
              select: { quantity: true, reservedQty: true, reorderLevel: true },
            },
          } : {}),
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        category: true,
        brand: true,
        unit: true,
        taxClass: true,
        variants: { where: { isActive: true } },
        ingredients: { include: { ingredientProduct: { select: { id: true, name: true } } } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByBarcode(tenantId: string, barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { tenantId, barcode, deletedAt: null, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        taxClass: { select: { id: true, rate: true } },
        variants: { where: { isActive: true } },
      },
    });
    if (!product) {
      // Check variant barcode
      const variant = await this.prisma.productVariant.findFirst({
        where: { barcode, isActive: true, product: { tenantId, deletedAt: null } },
        include: { product: { include: { taxClass: true } } },
      });
      if (!variant) throw new NotFoundException('Product not found');
      return variant;
    }
    return product;
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
