import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      message: 'E-commerce API is running smoothly.',
      timestamp: new Date().toISOString(),
    };
  }
}
