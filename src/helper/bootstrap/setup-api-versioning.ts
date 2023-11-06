import { VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

export function setupApiVersioning(app: NestExpressApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'V',
    defaultVersion: '1',
  });
}
