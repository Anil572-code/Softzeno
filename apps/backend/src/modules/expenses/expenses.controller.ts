import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(tenantId, userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('branchId') branchId?: string,
  ) {
    return this.expensesService.findAll(tenantId, pagination, branchId);
  }

  @Get(':id')
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.expensesService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.expensesService.remove(tenantId, id);
  }
}
