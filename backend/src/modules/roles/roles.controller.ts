import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS, ROLES } from '@nati/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RolesService } from './roles.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Roles(ROLES.SUPER_ADMIN)
@RequirePermissions(PERMISSIONS.ROLE_MANAGE)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  listRoles() {
    return this.rolesService.listRoles();
  }

  @Get('permissions')
  listPermissions() {
    return this.rolesService.listPermissions();
  }

  @Patch(':id/permissions')
  @ResponseMessage('Role permissions updated')
  updatePermissions(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRolePermissionsDto) {
    return this.rolesService.setRolePermissions(id, dto.permissions);
  }
}
