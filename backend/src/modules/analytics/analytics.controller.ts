import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS, ROLES } from '@nati/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @RequirePermissions(PERMISSIONS.ANALYTICS_READ)
  dashboard(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    // Clamp to a sane range so the series query can't be abused.
    const clamped = Math.min(Math.max(days, 7), 90);
    return this.analytics.dashboard(clamped);
  }
}
