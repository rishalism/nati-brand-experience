import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS, ROLES } from '@nati/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrderQueryDto } from './dto/order-query.dto';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Order placed')
  checkout(@CurrentUser('sub') userId: string, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(userId, dto);
  }

  @Post('verify-razorpay')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Payment verified')
  verifyRazorpay(@CurrentUser('sub') userId: string, @Body() dto: VerifyRazorpayDto) {
    return this.ordersService.verifyRazorpay(userId, dto);
  }

  // --- admin (declared before :id to avoid route collision) ---
  @Get('admin')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  listAll(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.listAll({
      page: query.page,
      limit: query.limit,
      skip: query.skip,
      status: query.status,
    });
  }

  @Get('admin/:id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  getAdminOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getAdminOrder(id);
  }

  @Patch(':id/status')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.ORDER_MANAGE)
  @ResponseMessage('Order status updated')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  // --- customer ---
  @Get()
  list(@CurrentUser('sub') userId: string, @Query() query: PaginationQueryDto) {
    return this.ordersService.getUserOrders(userId, {
      page: query.page,
      limit: query.limit,
      skip: query.skip,
    });
  }

  @Get(':id/invoice')
  getInvoice(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getInvoice(userId, id);
  }

  @Get(':id')
  getOrder(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getUserOrder(userId, id);
  }
}
