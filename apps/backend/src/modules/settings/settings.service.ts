import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get(tenantId: string, key: string, branchId?: string) {
    return this.prisma.setting.findFirst({
      where: {
        tenantId,
        key,
        branchId: branchId || null,
      },
    });
  }

  async getAll(tenantId: string, branchId?: string, group?: string) {
    const where: any = { tenantId };
    if (branchId !== undefined) where.branchId = branchId || null;
    if (group) where.group = group;

    return this.prisma.setting.findMany({ where, orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  }

  async set(tenantId: string, key: string, value: string, group: string = 'general', branchId?: string) {
    return this.prisma.setting.upsert({
      where: {
        tenantId_branchId_key: {
          tenantId,
          branchId: branchId || null,
          key,
        },
      },
      create: { tenantId, branchId, key, value, group },
      update: { value },
    });
  }

  async setBulk(tenantId: string, settings: Array<{ key: string; value: string; group?: string }>, branchId?: string) {
    const results = await Promise.all(
      settings.map((s) => this.set(tenantId, s.key, s.value, s.group, branchId)),
    );
    return results;
  }

  async delete(tenantId: string, key: string, branchId?: string) {
    return this.prisma.setting.deleteMany({
      where: { tenantId, key, branchId: branchId || null },
    });
  }
}
