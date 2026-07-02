import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ROLES } from '@nati/shared';
import { PERMISSIONS } from '@nati/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ResponseMessage('Profile updated')
  updateOwnProfile(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  // --- Admin ---

  @Get()
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.USER_READ)
  listUsers(@Query() query: PaginationQueryDto) {
    return this.usersService.list({
      page: query.page,
      limit: query.limit,
      skip: query.skip,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.USER_READ)
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getPublicUser(id);
  }

  @Patch(':id/status')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.USER_WRITE)
  @ResponseMessage('User status updated')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto.status);
  }

  @Patch(':id/roles')
  @Roles(ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.ROLE_MANAGE)
  @ResponseMessage('User roles updated')
  assignRoles(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignRolesDto) {
    return this.usersService.setRoles(id, dto.roles);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.USER_DELETE)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User deleted')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.softDelete(id);
    return null;
  }
}
