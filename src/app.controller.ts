import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AnonymousResource } from 'src/framework/decorator/anonymous-resource.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AnonymousResource()
  getHello(): string {
    return this.appService.getHello();
  }
}
