import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { HealthService, type HealthReport } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ResponseMessage('Service is healthy')
  @ApiOkResponse({ description: 'Liveness + database connectivity check' })
  check(): Promise<HealthReport> {
    return this.healthService.check();
  }
}
