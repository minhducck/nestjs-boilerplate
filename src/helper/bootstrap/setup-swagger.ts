import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { writeFileSync } from 'fs';

export function setupSwagger(app) {
  const configService: ConfigService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle(
      `${configService.get('APPLICATION_NAME')}
      - API Documentation
      - ${configService.get('APP_VERSION')}`,
    )
    .setContact(
      'GainCity - Software Department',
      'https://www.gaincity.com/customer-service/contact-us',
      'it-softwaredevs@gaincity.com',
    )
    .setVersion(configService.get('APP_VERSION'))
    .setTermsOfService(
      `Internal API uses only - Any external users are prohibited.`,
    )
    .addBearerAuth({ type: 'apiKey', name: 'Secret Token' })
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  writeFileSync('./var/swagger-spec.json', JSON.stringify(document), {
    mode: '0740',
    flag: 'w+',
  });
  SwaggerModule.setup('rest-api-docs', app, document);
}
