import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ANONYMOUS_RESOURCE } from '../framework/decorator/anonymous-resource.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  isAdmin: (req) => boolean = (req) =>
    req.headers?.authorization ===
    `Bearer ${this.configService.get('SECRET_TOKEN')}`;

  canActivate(context: ExecutionContext): boolean {
    const isAnonymous = this.reflector.get<boolean>(
      ANONYMOUS_RESOURCE,
      context.getHandler(),
    );
    if (isAnonymous) {
      return true;
    }

    return this.isAdmin(context.switchToHttp().getRequest());
  }
}
