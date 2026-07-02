import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS, ROLES } from '@nati/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
@RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':productId')
  get(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.getInfo(productId);
  }

  @Get(':productId/movements')
  movements(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.getMovements(productId);
  }

  @Post(':productId/adjust')
  @ResponseMessage('Stock adjusted')
  adjust(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AdjustInventoryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.inventoryService.adjust(productId, dto.delta, dto.reason, dto.note, userId);
  }
}
