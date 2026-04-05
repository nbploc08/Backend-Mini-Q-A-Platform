import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable, lastValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from '@common/core';
import { JwtValidationResult } from './jwt.strategy';

@Injectable()
export class CombinedJwtAuthGuard extends AuthGuard('combined-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const result = super.canActivate(context);
    const ok =
      result instanceof Observable ? await lastValueFrom(result) : await Promise.resolve(result);

    if (ok) {
      const req = context.switchToHttp().getRequest();
      const user = req.user as JwtValidationResult;

      if (user.type === 'internal') {
        req.info = {
          caller: user.caller,
          data: user.data,
        };
      }
    }

    return ok;
  }
}

@Injectable()
export class InternalJwtAuthGuard extends AuthGuard('internal-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const result = super.canActivate(context);
    const ok =
      result instanceof Observable ? await lastValueFrom(result) : await Promise.resolve(result);

    if (ok) {
      const req = context.switchToHttp().getRequest();
      req.info = req.user;
    }

    return ok;
  }
}

@Injectable()
export class UserJwtAuthGuard extends AuthGuard('user-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const result = super.canActivate(context);
    const ok =
      result instanceof Observable ? await lastValueFrom(result) : await Promise.resolve(result);

    return ok;
  }
}
