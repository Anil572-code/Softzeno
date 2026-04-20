import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        tenantId, userId,
        branchId: dto.branchId,
        category: dto.category,
        title: dto.title,
        amount: dto.amount,
        description: dto.description,
        receiptUrl: dto.receiptUrl,
        expenseDate: new Date(dto.expenseDate),
      },
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto, branchId?: string) {
    const { page = 1, limit = 20, search, sortBy = 'expenseDate', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (branchId) where.branchId = branchId;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [data, totalCount] = await Promise.all([
      this.prisma.expense.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.expense.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, tenantId },
      include: { user: { select: { id: true, name: true } } },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(tenantId: string, id: string, dto: UpdateExpenseDto) {
    await this.findOne(tenantId, id);
    return this.prisma.expense.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.expense.delete({ where: { id } });
  }

  async getSummary(tenantId: string, branchId: string, startDate: Date, endDate: Date) {
    const expenses = await this.prisma.expense.groupBy({
      by: ['category'],
      where: {
        tenantId, branchId,
        expenseDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    });
    return expenses;
  }
}
