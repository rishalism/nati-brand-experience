import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ORDER_STATUS, type OrderStatus } from '@nati/shared';

const STATUSES = Object.values(ORDER_STATUS);

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: STATUSES })
  @IsIn(STATUSES)
  status!: OrderStatus;
}
