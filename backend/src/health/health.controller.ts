import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and database health' })
  @ApiOkResponse({
    description: 'The API and database are reachable.',
    schema: {
      example: {
        status: 'ok',
        database: 'ok',
        timestamp: '2026-06-29T12:00:00.000Z',
      },
    },
  })
  check() {
    return this.healthService.check();
  }
}
