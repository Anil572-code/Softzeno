import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    tenantId: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({ data: params });
  }

  async findAll(tenantId: string, pagination: PaginationDto, filters?: {
    userId?: string;
    resource?: string;
    action?: string;
  }) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.action) where.action = filters.action;

    const [data, totalCount] = await Promise.all([
      this.prisma.auditLog.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }
}
