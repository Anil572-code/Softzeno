import {
  Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import {
  CreateTableDto, UpdateTableDto,
  CreateRestaurantOrderDto, UpdateRestaurantOrderDto, AddItemsToOrderDto,
} from './dto/restaurant.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Restaurant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // ----- Tables -----
  @Post('tables')
  createTable(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Body() dto: CreateTableDto,
  ) {
    return this.restaurantService.createTable(tenantId, branchId, dto);
  }

  @Get('tables')
  getTables(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.restaurantService.getTables(tenantId, branchId);
  }

  @Put('tables/:id')
  updateTable(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.restaurantService.updateTable(tenantId, branchId, id, dto);
  }

  @Delete('tables/:id')
  deleteTable(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Param('id') id: string,
  ) {
    return this.restaurantService.deleteTable(tenantId, branchId, id);
  }

  // ----- Orders -----
  @Post('orders')
  @ApiOperation({ summary: 'Create restaurant order (KOT)' })
  createOrder(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRestaurantOrderDto,
  ) {
    return this.restaurantService.createOrder(tenantId, branchId, userId, dto);
  }

  @Get('orders')
  @ApiQuery({ name: 'status', required: false })
  getOrders(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.restaurantService.getOrders(tenantId, branchId, pagination, status);
  }

  @Get('orders/:id')
  getOrder(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.restaurantService.getOrder(tenantId, id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.restaurantService.updateOrderStatus(tenantId, id, status);
  }

  @Post('orders/:id/items')
  addItems(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: AddItemsToOrderDto,
  ) {
    return this.restaurantService.addItemsToOrder(tenantId, id, dto);
  }

  // ----- Kitchen -----
  @Get('kitchen/tickets')
  @ApiQuery({ name: 'status', required: false })
  getKitchenTickets(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('branchId') branchId: string,
    @Query('status') status?: string,
  ) {
    return this.restaurantService.getKitchenTickets(tenantId, branchId, status);
  }

  @Patch('kitchen/tickets/:id/status')
  updateTicketStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.restaurantService.updateKitchenTicketStatus(tenantId, id, status);
  }
}
