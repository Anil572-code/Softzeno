import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MembershipTier } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  anniversary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: MembershipTier })
  @IsOptional()
  @IsEnum(MembershipTier)
  membershipTier?: MembershipTier;
}

export class AdjustLoyaltyDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  points: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
