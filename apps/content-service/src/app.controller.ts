import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ErrorCodes, Public, ServiceError } from '@common/core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: process.env.SERVICE_NAME || 'Content-Service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('debug/service-error')
  debugServiceError() {
    throw new ServiceError({
      code: ErrorCodes.INTERNAL,
      statusCode: 500,
      message: 'Debug error for testing',
    });
  }
}
