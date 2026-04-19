import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email, deletedAt: null },
    });
    if (existing) throw new ConflictException('Email already exists in this tenant');

    const { password, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, 12);

    return this.prisma.user.create({
      data: { tenantId, ...rest, passwordHash },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        tenantId: true, branchId: true, isActive: true, createdAt: true,
      },
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
      ];
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          tenantId: true, branchId: true, isActive: true, lastLogin: true,
          createdAt: true, branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        tenantId: true, branchId: true, isActive: true, lastLogin: true,
        twoFactorEnabled: true, createdAt: true, updatedAt: true,
        branch: { select: { id: true, name: true, code: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        tenantId: true, branchId: true, isActive: true, updatedAt: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
