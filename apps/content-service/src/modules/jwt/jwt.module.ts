import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { InternalJwtService } from './jwt.service';
import { InternalJwtStrategy, CombinedJwtStrategy } from './strategy/jwt.strategy';
import { InternalJwtAuthGuard, CombinedJwtAuthGuard } from './strategy/jwt-auth.guard';

@Module({
  imports: [ConfigModule, PassportModule],
  providers: [
    InternalJwtService,
    InternalJwtStrategy,
    CombinedJwtStrategy,
    InternalJwtAuthGuard,
    CombinedJwtAuthGuard,
  ],
  exports: [InternalJwtService, InternalJwtAuthGuard, CombinedJwtAuthGuard],
})
export class JwtModule {}

