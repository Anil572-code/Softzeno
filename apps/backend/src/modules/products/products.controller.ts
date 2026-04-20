import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('branchId') branchId?: string,
  ) {
    return this.productsService.findAll(tenantId, pagination, branchId);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Search product by barcode' })
  findByBarcode(@CurrentUser('tenantId') tenantId: string, @Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(tenantId, barcode);
  }

  @Get(':id')
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.productsService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.productsService.remove(tenantId, id);
  }
}
