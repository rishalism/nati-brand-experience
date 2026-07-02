import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ORDER_STATUS, type OrderStatus } from '@nati/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

const STATUSES = Object.values(ORDER_STATUS);

export class AdminOrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: OrderStatus;
}
