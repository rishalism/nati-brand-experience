import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { USER_STATUS, type UserStatus } from '@nati/shared';

const STATUSES = Object.values(USER_STATUS);

export class UpdateUserStatusDto {
  @ApiProperty({ enum: STATUSES })
  @IsIn(STATUSES)
  status!: UserStatus;
}
