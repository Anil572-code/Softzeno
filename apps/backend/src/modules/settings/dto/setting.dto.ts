import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SetSettingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group?: string;
}

export class SetBulkSettingsDto {
  @ApiProperty({ type: [SetSettingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetSettingDto)
  settings: SetSettingDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;
}
