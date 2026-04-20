import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import {
  CreateSupplierDto, UpdateSupplierDto,
  CreatePurchaseOrderDto, ReceivePurchaseOrderDto,
} from './dto/supplier.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Suppliers & Purchases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  createSupplier(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(tenantId, dto);
  }

  @Get()
  findAllSuppliers(@CurrentUser('tenantId') tenantId: string, @Query() pagination: PaginationDto) {
    return this.suppliersService.findAllSuppliers(tenantId, pagination);
  }

  @Get(':id')
  findOneSupplier(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.suppliersService.findOneSupplier(tenantId, id);
  }

  @Put(':id')
  updateSupplier(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.updateSupplier(tenantId, id, dto);
  }

  @Delete(':id')
  removeSupplier(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.suppliersService.removeSupplier(tenantId, id);
  }

  // Purchase Orders
  @Post('purchase-orders')
  @ApiOperation({ summary: 'Create purchase order' })
  createPO(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return this.suppliersService.createPurchaseOrder(tenantId, userId, dto);
  }

  @Get('purchase-orders/all')
  findAllPO(@CurrentUser('tenantId') tenantId: string, @Query() pagination: PaginationDto) {
    return this.suppliersService.findAllPurchaseOrders(tenantId, pagination);
  }

  @Get('purchase-orders/:id')
  findOnePO(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.suppliersService.findOnePurchaseOrder(tenantId, id);
  }

  @Post('purchase-orders/:id/receive')
  @ApiOperation({ summary: 'Receive items from purchase order' })
  receivePO(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: ReceivePurchaseOrderDto,
  ) {
    return this.suppliersService.receivePurchaseOrder(tenantId, id, dto);
  }
}
