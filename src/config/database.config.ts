import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';

export default class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(
    @Inject(ConfigService) protected readonly configService: ConfigService,
  ) {}

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    console.log('Initializing Database Connector');

    return {
      type: 'mysql',
      host: this.configService.get('DBHOST'),
      port: +this.configService.get('DBPORT'),
      username: this.configService.get('DBUSER'),
      password: this.configService.get('DBPASS'),
      database: this.configService.get('DBNAME'),
      migrationsRun: true,
      migrations: [__dirname + '/../**/migration/*.migration{.ts,.js}'],
      migrationsTableName: 'migrations',
      retryAttempts: 10,
      autoLoadEntities: false,
      connectTimeout: 3000,
      entities: [__dirname + '/../**/model/*.model{.ts,.js}'],
      synchronize: false,
      poolSize: +this.configService.get('DBPOOLSIZE') || 20,
      logging:
        process.env.ENV === 'production'
          ? ['error', 'warn', 'migration']
          : 'all',
    } as TypeOrmModuleOptions;
  }
}
