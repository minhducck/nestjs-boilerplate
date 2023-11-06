import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptionsFactory } from '@nestjs-modules/mailer/dist/interfaces/mailer-options-factory.interface';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export default class EmailConfig implements MailerOptionsFactory {
  constructor(
    @Inject(ConfigService) protected readonly configService: ConfigService,
  ) {}

  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      template: {
        adapter: new HandlebarsAdapter(),
      },
      defaults: {
        from: {
          name: this.configService.getOrThrow<string>('SMTP.SENDER.NAME'),
          address: this.configService.getOrThrow<string>('SMTP.SENDER.ADDR'),
        },
      },
      transport: {
        host: this.configService.getOrThrow<string>('SMTP.HOST'),
        from: {
          name: this.configService.getOrThrow<string>('SMTP.SENDER.NAME'),
          address: this.configService.getOrThrow<string>('SMTP.SENDER.ADDR'),
        },
        port: this.configService.getOrThrow<number>('SMTP.PORT'),
        secure: this.configService.getOrThrow<number>('SMTP.SECURE') != 0,
        auth: {
          user: this.configService.getOrThrow<string>('SMTP.USER'),
          pass: this.configService.getOrThrow<string>('SMTP.PASS'),
        },
      },
    };
  }
}
