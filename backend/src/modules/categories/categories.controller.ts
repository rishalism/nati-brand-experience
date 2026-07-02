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
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS, ROLES } from '@nati/shared';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  list() {
    return this.categoriesService.list();
  }

  @Get(':id')
  @Public()
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.get(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  @ResponseMessage('Category created')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  @ResponseMessage('Category updated')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Category deleted')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
    return null;
  }
}
