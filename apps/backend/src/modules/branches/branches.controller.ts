import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles('TENANT_OWNER' as any, 'SUPER_ADMIN' as any)
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateBranchDto) {
    return this.branchesService.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() pagination: PaginationDto) {
    return this.branchesService.findAll(tenantId, pagination);
  }

  @Get(':id')
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.branchesService.findOne(tenantId, id);
  }

  @Put(':id')
  @Roles('TENANT_OWNER' as any, 'MANAGER' as any, 'SUPER_ADMIN' as any)
  update(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('TENANT_OWNER' as any, 'SUPER_ADMIN' as any)
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.branchesService.remove(tenantId, id);
  }
}
