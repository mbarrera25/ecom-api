import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { HealthResponse } from './app.service';

@ApiTags('health')
@ApiBearerAuth('JWT')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica el estado del servicio y la disponibilidad general.',
  })
  @ApiOkResponse({
    description: 'Estado actual del servicio.',
    schema: {
      example: {
        status: 'ok',
        message: 'E-commerce API is running smoothly.',
        timestamp: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
