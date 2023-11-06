import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

@Injectable()
export class ThrottlerFactory implements ThrottlerOptionsFactory {
  constructor(protected readonly configService: ConfigService) {}

  createThrottlerOptions():
    | Promise<ThrottlerModuleOptions>
    | ThrottlerModuleOptions {
    return {
      ttl: +this.configService.get('REQ_RATE_TTL'),
      limit: +this.configService.get('REQ_RATE_LIMIT'),
      skipIf: (context: ExecutionContextHost) => {
        return (
          context.switchToHttp().getRequest().headers?.authorization ===
          `Bearer ${this.configService.get('SECRET_TOKEN')}`
        );
      },
    };
  }
}
