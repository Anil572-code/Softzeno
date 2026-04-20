import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, RecordAttendanceDto } from './dto/employee.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        tenantId,
        userId: dto.userId,
        branchId: dto.branchId,
        employeeCode: dto.employeeCode,
        position: dto.position,
        department: dto.department,
        salary: dto.salary,
        commissionRate: dto.commissionRate,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
      },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto, branchId?: string) {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, isActive: true };
    if (branchId) where.branchId = branchId;

    const [data, totalCount] = await Promise.all([
      this.prisma.employee.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, meta: paginate(totalCount, page, limit) };
  }

  async findOne(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
        branch: { select: { id: true, name: true } },
        attendance: { take: 30, orderBy: { date: 'desc' } },
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(tenantId: string, id: string, dto: UpdateEmployeeDto) {
    await this.findOne(tenantId, id);
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
        isActive: dto.terminationDate ? false : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.employee.update({
      where: { id },
      data: { isActive: false, terminationDate: new Date() },
    });
  }

  async recordAttendance(tenantId: string, branchId: string, dto: RecordAttendanceDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = dto.checkIn ? new Date(dto.checkIn) : undefined;
    const checkOut = dto.checkOut ? new Date(dto.checkOut) : undefined;
    let workHours: number | undefined;

    if (checkIn && checkOut) {
      workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    }

    return this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: dto.employeeId, date: today } },
      create: {
        employeeId: dto.employeeId,
        tenantId,
        branchId,
        date: today,
        checkIn,
        checkOut,
        workHours,
        notes: dto.notes,
      },
      update: { checkIn, checkOut, workHours, notes: dto.notes },
    });
  }
}
