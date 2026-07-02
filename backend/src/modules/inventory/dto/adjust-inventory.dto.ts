import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { INVENTORY_MOVEMENT_REASON, type InventoryMovementReason } from '@nati/shared';

const REASONS = Object.values(INVENTORY_MOVEMENT_REASON);

export class AdjustInventoryDto {
  @ApiProperty({ description: 'Signed change in quantity (e.g. +10 or -3)' })
  @IsInt()
  delta!: number;

  @ApiProperty({ enum: REASONS })
  @IsIn(REASONS)
  reason!: InventoryMovementReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}
