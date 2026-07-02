import {
  BadRequestException,
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
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS, ROLES } from '@nati/shared';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  list(@Query() query: ProductQueryDto) {
    return this.productsService.list({ ...query, skip: query.skip }, true);
  }

  @Get('admin')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.PRODUCT_READ)
  listAll(@Query() query: ProductQueryDto) {
    return this.productsService.list({ ...query, skip: query.skip }, false);
  }

  @Get('slug/:slug')
  @Public()
  getBySlug(@Param('slug') slug: string) {
    return this.productsService.getBySlug(slug);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.PRODUCT_WRITE)
  @ResponseMessage('Product created')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.PRODUCT_WRITE)
  @ResponseMessage('Product updated')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product deleted')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productsService.remove(id);
    return null;
  }

  @Post(':id/images')
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.PRODUCT_WRITE)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_BYTES } }))
  @ResponseMessage('Image uploaded')
  uploadImage(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }
    return this.productsService.uploadImage(id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalName: file.originalname,
    });
  }

  @Patch(':id/images/:imageId/primary')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.PRODUCT_WRITE)
  @ResponseMessage('Primary image set')
  setPrimaryImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.productsService.setPrimaryImage(id, imageId);
  }

  @Delete(':id/images/:imageId')
  @ApiBearerAuth('access-token')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.PRODUCT_WRITE)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Image deleted')
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    await this.productsService.deleteImage(id, imageId);
    return null;
  }

  @Get(':id')
  @Public()
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getById(id);
  }
}
