import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

export function setupStaticAssets(app: NestExpressApplication) {
  const configService = app.get<ConfigService>(ConfigService);
  app.useStaticAssets(join(__dirname, '..', '..', 'public'));
}
