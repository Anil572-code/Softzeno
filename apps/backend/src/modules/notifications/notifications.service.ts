import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(params: {
    tenantId: string;
    userId?: string;
    title: string;
    message: string;
    type: string;
    metadata?: any;
  }) {
    return this.prisma.notification.create({ data: params });
  }

  async findAll(tenantId: string, userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, totalCount, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { tenantId, OR: [{ userId }, { userId: null }] },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { tenantId, OR: [{ userId }, { userId: null }] } }),
      this.prisma.notification.count({
        where: { tenantId, OR: [{ userId }, { userId: null }], isRead: false },
      }),
    ]);
    return { data, meta: { ...paginate(totalCount, page, limit), unreadCount } };
  }

  async markAsRead(tenantId: string, userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, tenantId, OR: [{ userId }, { userId: null }] },
      data: { isRead: true },
    });
  }

  async markAllAsRead(tenantId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { tenantId, OR: [{ userId }, { userId: null }], isRead: false },
      data: { isRead: true },
    });
  }
}
