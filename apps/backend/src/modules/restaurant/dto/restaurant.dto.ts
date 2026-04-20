import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, TableStatus } from '@prisma/client';

export class CreateTableDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ default: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional()
  @IsOptional()
  position?: any;
}

export class UpdateTableDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({ enum: TableStatus })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RestaurantOrderItemDto {
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
  @Min(1)
  quantity: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  modifiers?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRestaurantOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tableId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ enum: OrderType, default: OrderType.DINE_IN })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  partySize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [RestaurantOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestaurantOrderItemDto)
  items: RestaurantOrderItemDto[];
}

export class UpdateRestaurantOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tableId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  partySize?: number;
}

export class AddItemsToOrderDto {
  @ApiProperty({ type: [RestaurantOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestaurantOrderItemDto)
  items: RestaurantOrderItemDto[];
}
