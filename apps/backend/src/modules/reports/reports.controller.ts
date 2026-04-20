import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.reportsService.getDashboard(tenantId, branchId);
  }

  @Get('daily')
  @ApiQuery({ name: 'date', required: false })
  getDaily(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Query('date') date?: string,
  ) {
    const reportDate = date ? new Date(date) : new Date();
    return this.reportsService.getDailySalesReport(tenantId, branchId, reportDate);
  }

  @Get('sales')
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  getSales(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.reportsService.getSalesReport(
      tenantId, branchId,
      new Date(startDate), new Date(endDate), groupBy,
    );
  }

  @Get('products')
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getProducts(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getProductReport(tenantId, branchId, new Date(startDate), new Date(endDate));
  }

  @Get('staff')
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getStaff(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getStaffReport(tenantId, branchId, new Date(startDate), new Date(endDate));
  }

  @Get('branches')
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getBranches(
    @CurrentUser('tenantId') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getBranchReport(tenantId, new Date(startDate), new Date(endDate));
  }
}
