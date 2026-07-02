import {
  Controller,
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
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser('sub') userId: string) {
    return this.notificationsService.list(userId);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser('sub') userId: string) {
    return { count: await this.notificationsService.unreadCount(userId) };
  }

  @Patch(':id/read')
  @ResponseMessage('Notification marked read')
  async markRead(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.notificationsService.markRead(userId, id);
    return null;
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('All notifications marked read')
  async markAllRead(@CurrentUser('sub') userId: string) {
    await this.notificationsService.markAllRead(userId);
    return null;
  }
}
