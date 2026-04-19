import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, RefundSaleDto } from './dto/sale.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale / POS transaction' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.salesService.create(tenantId, branchId, userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.salesService.findAll(tenantId, branchId, pagination);
  }

  @Get('held')
  @ApiOperation({ summary: 'Get held / on-hold sales' })
  getHeld(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.salesService.getHeldSales(tenantId, branchId);
  }

  @Get(':id')
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.salesService.findOne(tenantId, id);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void a sale' })
  void(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.salesService.voidSale(tenantId, id, userId);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a sale' })
  refund(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RefundSaleDto,
  ) {
    return this.salesService.refund(tenantId, id, userId, dto);
  }

  @Post(':id/hold')
  hold(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.salesService.holdSale(tenantId, id);
  }

  @Post(':id/resume')
  resume(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.salesService.resumeSale(tenantId, id);
  }
}
