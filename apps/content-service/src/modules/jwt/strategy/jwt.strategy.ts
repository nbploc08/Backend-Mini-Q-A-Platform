import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export type InternalJwtPayload = {
  sub: string;
  data: {
    id?: string;
    [key: string]: unknown;
  };
  iss: string;
  aud: string;
};

export type UserJwtPayload = {
  sub: string;
  email: string;
  permVersion: number;
  iss: string;
  aud: string;
};

export type JwtValidationResult = {
  type: 'internal' | 'user';
  caller?: string;
  data?: Record<string, unknown>;
  userId?: string;
  email?: string;
  permVersion?: number;
};

@Injectable()
export class CombinedJwtStrategy extends PassportStrategy(Strategy, 'combined-jwt') {
  private readonly internalAudience: string;
  private readonly userAudience: string;

  constructor(private configService: ConfigService) {
    const internalSecret = configService.get<string>('INTERNAL_JWT_SECRET');
    const userSecret = configService.get<string>('JWT_SECRET');
    const internalAudience = configService.get<string>('INTERNAL_JWT_AUDIENCE') || 'internal';
    const userAudience = configService.get<string>('JWT_AUDIENCE') || 'api';

    if (!internalSecret) {
      throw new Error('INTERNAL_JWT_SECRET is required');
    }
    if (!userSecret) {
      throw new Error('JWT_SECRET is required');
    }

    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (
        _request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secret?: string | Buffer) => void,
      ) => {
        try {
          const decoded = jwt.decode(rawJwtToken) as { aud?: string } | null;
          if (!decoded) {
            return done(new UnauthorizedException('Invalid token format'));
          }
          const audience = decoded.aud;
          if (audience === internalAudience) return done(null, internalSecret);
          if (audience === userAudience) return done(null, userSecret);
          return done(new UnauthorizedException(`Unknown token audience: ${audience}`));
        } catch {
          return done(new UnauthorizedException('Token decode failed'));
        }
      },
    };

    super(options);

    this.internalAudience = internalAudience;
    this.userAudience = userAudience;
  }

  async validate(payload: InternalJwtPayload | UserJwtPayload): Promise<JwtValidationResult> {
    if (payload.aud === this.internalAudience) {
      const internalPayload = payload as InternalJwtPayload;
      return {
        type: 'internal',
        caller: internalPayload.sub,
        data: internalPayload.data as Record<string, unknown>,
      };
    }

    if (payload.aud === this.userAudience) {
      const userPayload = payload as UserJwtPayload;
      return {
        type: 'user',
        userId: userPayload.sub,
        email: userPayload.email,
        permVersion: userPayload.permVersion,
      };
    }

    throw new UnauthorizedException('Invalid token type');
  }
}

@Injectable()
export class InternalJwtStrategy extends PassportStrategy(Strategy, 'internal-jwt') {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('INTERNAL_JWT_SECRET');
    if (!secret) {
      throw new Error('INTERNAL_JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      audience: configService.get<string>('INTERNAL_JWT_AUDIENCE') || 'internal',
    });
  }

  async validate(payload: InternalJwtPayload) {
    return {
      type: 'internal' as const,
      caller: payload.sub,
      data: payload.data,
    };
  }
}

