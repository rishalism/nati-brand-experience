import { Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  get(@CurrentUser('sub') userId: string) {
    return this.wishlistService.get(userId);
  }

  @Post(':productId')
  @ResponseMessage('Added to wishlist')
  add(@CurrentUser('sub') userId: string, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.wishlistService.add(userId, productId);
  }

  @Post(':productId/toggle')
  @ResponseMessage('Wishlist updated')
  toggle(@CurrentUser('sub') userId: string, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.wishlistService.toggle(userId, productId);
  }

  @Delete(':productId')
  @ResponseMessage('Removed from wishlist')
  remove(@CurrentUser('sub') userId: string, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.wishlistService.remove(userId, productId);
  }
}
