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
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @Public()
  list() {
    return this.brandsService.list();
  }

  @Get(':id')
  @Public()
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.get(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  @ResponseMessage('Brand created')
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  @ResponseMessage('Brand updated')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Brand deleted')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.brandsService.remove(id);
    return null;
  }
}
