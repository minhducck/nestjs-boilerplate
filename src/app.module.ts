import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerBehindProxyGuard } from './guard/throttler-behind-proxy.guard';
import { AuthenticationGuard } from './guard/authentication.guard';
import { TimeoutInterceptor } from './interceptor/timeout.interceptor';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerFactory } from 'src/factory/throttler.factory';
import { MailerModule } from '@nestjs-modules/mailer';
import EmailConfig from 'src/config/email.config';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import DatabaseConfig from 'src/config/database.config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      expandVariables: true,
      envFilePath: ['.env', '.env.prod', '.env.dev'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod', 'test', 'provision')
          .default('dev'),
        CLUSTER_ID: Joi.string().default('DEFAULT-CLUSTER'),
        PORT: Joi.number().default(3000),
        'REDIS.HOST': Joi.string().hostname().default('127.0.0.1'),
        'REDIS.PORT': Joi.number().default(6379),
        'REDIS.PUB_SUB_DB': Joi.number().default(3),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    MailerModule.forRootAsync({
      useClass: EmailConfig,
    }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerFactory,
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 100,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    TypeOrmModule.forRootAsync({ useClass: DatabaseConfig }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
