import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { SetSettingDto, SetBulkSettingsDto } from './dto/setting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'group', required: false })
  getAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('group') group?: string,
  ) {
    return this.settingsService.getAll(tenantId, branchId, group);
  }

  @Get(':key')
  @ApiQuery({ name: 'branchId', required: false })
  getOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('key') key: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.settingsService.get(tenantId, key, branchId);
  }

  @Post()
  set(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: SetSettingDto,
    @Query('branchId') branchId?: string,
  ) {
    return this.settingsService.set(tenantId, dto.key, dto.value, dto.group, branchId);
  }

  @Post('bulk')
  setBulk(@CurrentUser('tenantId') tenantId: string, @Body() dto: SetBulkSettingsDto) {
    return this.settingsService.setBulk(tenantId, dto.settings, dto.branchId);
  }

  @Delete(':key')
  delete(
    @CurrentUser('tenantId') tenantId: string,
    @Param('key') key: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.settingsService.delete(tenantId, key, branchId);
  }
}
