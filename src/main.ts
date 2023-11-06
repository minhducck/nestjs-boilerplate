import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from 'src/framework/adapter/redis-io.adapter';
import { distributedId } from 'src/helper/distributed-id.helper';
import {
  setupApiVersioning,
  setupObjectValidation,
  setupStaticAssets,
  setupSwagger,
} from 'src/helper/bootstrap';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Using Socket-io redis adapter to keep connection
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  // Generate Unique Id
  app.use((req, res, next) => {
    req.headers['reqId'] = distributedId();
    next();
  });

  setupStaticAssets(app);
  setupApiVersioning(app);
  setupObjectValidation(app);

  // Setup Swagger
  setupSwagger(app);

  // Register Fastify Plugins
  await app.use(helmet());
  await app.use(cors());
  await app.use(cookieParser());
  await app.use(compression());

  await app.listen(+process.env['PORT'], '0.0.0.0');
}

bootstrap();
