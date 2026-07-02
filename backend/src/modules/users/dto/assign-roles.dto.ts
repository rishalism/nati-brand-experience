import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsIn } from 'class-validator';
import { ALL_ROLES, type Role } from '@nati/shared';

export class AssignRolesDto {
  @ApiProperty({ enum: ALL_ROLES, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(ALL_ROLES, { each: true })
  roles!: Role[];
}
