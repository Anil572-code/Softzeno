import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { StockMovementType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty({ enum: StockMovementType })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;
}

export class TransferStockDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromBranchId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toBranchId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
