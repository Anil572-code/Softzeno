import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('TENANT_OWNER' as any, 'MANAGER' as any, 'SUPER_ADMIN' as any)
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(tenantId, dto);
  }

  @Get()
  @Roles('TENANT_OWNER' as any, 'MANAGER' as any, 'SUPER_ADMIN' as any)
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() pagination: PaginationDto) {
    return this.usersService.findAll(tenantId, pagination);
  }

  @Get(':id')
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.usersService.findOne(tenantId, id);
  }

  @Put(':id')
  @Roles('TENANT_OWNER' as any, 'MANAGER' as any, 'SUPER_ADMIN' as any)
  update(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('TENANT_OWNER' as any, 'SUPER_ADMIN' as any)
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.usersService.remove(tenantId, id);
  }
}
