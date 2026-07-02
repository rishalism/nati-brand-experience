import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn } from 'class-validator';
import { ALL_PERMISSIONS, type Permission } from '@nati/shared';

export class UpdateRolePermissionsDto {
  @ApiProperty({ enum: ALL_PERMISSIONS, isArray: true })
  @IsArray()
  @IsIn(ALL_PERMISSIONS, { each: true })
  permissions!: Permission[];
}
