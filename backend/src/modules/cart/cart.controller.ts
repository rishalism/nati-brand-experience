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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CartService } from './cart.service';
import { AddToCartDto, ApplyCouponDto, MergeCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@CurrentUser('sub') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ResponseMessage('Item added to cart')
  addItem(@CurrentUser('sub') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  @ResponseMessage('Cart updated')
  updateItem(
    @CurrentUser('sub') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  @ResponseMessage('Item removed')
  removeItem(
    @CurrentUser('sub') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @ResponseMessage('Cart cleared')
  clear(@CurrentUser('sub') userId: string) {
    return this.cartService.clear(userId);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cart merged')
  merge(@CurrentUser('sub') userId: string, @Body() dto: MergeCartDto) {
    return this.cartService.merge(userId, dto.items);
  }

  @Post('coupon')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupon applied')
  applyCoupon(@CurrentUser('sub') userId: string, @Body() dto: ApplyCouponDto) {
    return this.cartService.applyCoupon(userId, dto.code);
  }

  @Delete('coupon')
  @ResponseMessage('Coupon removed')
  removeCoupon(@CurrentUser('sub') userId: string) {
    return this.cartService.removeCoupon(userId);
  }
}
