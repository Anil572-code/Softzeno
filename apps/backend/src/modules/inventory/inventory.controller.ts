import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustStockDto, TransferStockDto } from './dto/inventory.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':branchId/stock')
  @ApiOperation({ summary: 'Get stock levels for a branch' })
  getStockLevels(
    @CurrentUser('tenantId') tenantId: string,
    @Param('branchId') branchId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.inventoryService.getStockLevels(tenantId, branchId, pagination);
  }

  @Get(':branchId/low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  getLowStock(
    @CurrentUser('tenantId') tenantId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.inventoryService.getLowStockItems(tenantId, branchId);
  }

  @Post(':branchId/adjust')
  @ApiOperation({ summary: 'Adjust stock level' })
  adjustStock(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('branchId') branchId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(tenantId, branchId, userId, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer stock between branches' })
  transferStock(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TransferStockDto,
  ) {
    return this.inventoryService.transferStock(tenantId, userId, dto);
  }

  @Get(':branchId/history/:productId')
  @ApiOperation({ summary: 'Get stock movement history' })
  getHistory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('branchId') branchId: string,
    @Param('productId') productId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.inventoryService.getMovementHistory(tenantId, branchId, productId, pagination);
  }
}
