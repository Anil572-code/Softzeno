import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles('SUPER_ADMIN' as any)
  @ApiOperation({ summary: 'Create a new tenant (Super Admin only)' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN' as any)
  @ApiOperation({ summary: 'List all tenants (Super Admin only)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.tenantsService.findAll(pagination);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current tenant info' })
  getMyTenant(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current tenant stats' })
  getMyStats(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantsService.getStats(tenantId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN' as any)
  @ApiOperation({ summary: 'Get tenant by ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Put('me')
  @Roles('TENANT_OWNER' as any, 'SUPER_ADMIN' as any)
  @ApiOperation({ summary: 'Update current tenant' })
  updateMyTenant(@CurrentUser('tenantId') tenantId: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(tenantId, dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN' as any)
  @ApiOperation({ summary: 'Update tenant by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN' as any)
  @ApiOperation({ summary: 'Delete tenant' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
