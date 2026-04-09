import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Cookies, Public, RateLimit, User } from '@common/core';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/internal-jwt/strategy/jwt-auth.guard';
import { AuthClientService } from './auth-client.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  GET_ME_OPERATION,
  GET_ME_RESPONSE,
  LOGIN_OPERATION,
  LOGIN_RESPONSE,
  LOGIN_ERROR_RESPONSES,
  REGISTER_OPERATION,
  REGISTER_RESPONSE,
  REGISTER_ERROR_RESPONSES,
  VERIFY_OPERATION,
  VERIFY_BODY,
  VERIFY_RESPONSE,
  VERIFY_ERROR_RESPONSES,
  CONFIRM_OPERATION,
  CONFIRM_BODY,
  CONFIRM_RESPONSE,
  RESEND_CODE_OPERATION,
  RESEND_CODE_BODY,
  RESEND_CODE_RESPONSE,
  RESEND_CODE_ERROR_RESPONSES,
  REFRESH_OPERATION,
  REFRESH_RESPONSE,
  REFRESH_ERROR_RESPONSES,
  LOGOUT_DEVICE_OPERATION,
  LOGOUT_DEVICE_RESPONSE,
  LOGOUT_ALL_OPERATION,
  LOGOUT_ALL_RESPONSE,
  FORGOT_PASSWORD_OPERATION,
  FORGOT_PASSWORD_BODY,
  FORGOT_PASSWORD_RESPONSE,
  FORGOT_PASSWORD_ERROR_RESPONSES,
  FORGOT_PASSWORD_VERIFY_OPERATION,
  FORGOT_PASSWORD_VERIFY_BODY,
  FORGOT_PASSWORD_VERIFY_RESPONSE,
  FORGOT_PASSWORD_RESET_OPERATION,
  FORGOT_PASSWORD_RESET_BODY,
  FORGOT_PASSWORD_RESET_RESPONSE,
  FORGOT_PASSWORD_RESET_ERROR_RESPONSES,
} from './swagger/auth.swagger';
import {
  UNAUTHORIZED_RESPONSE,
  INTERNAL_SERVER_ERROR_RESPONSE,
} from 'src/modules/share/swagger';

@ApiTags('Auth')
@Controller('client/auth')
@UseGuards(JwtAuthGuard)
export class AuthClientController {
  constructor(private readonly authClient: AuthClientService) {}
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @GET_ME_OPERATION
  @GET_ME_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async me(@Req() req: Request & { requestId?: string }) {
    return this.authClient.getProfileByUserId(req.requestId || '', req.headers.authorization);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LOGIN_OPERATION
  @LOGIN_RESPONSE
  @LOGIN_ERROR_RESPONSES.BAD_REQUEST
  @LOGIN_ERROR_RESPONSES.UNAUTHORIZED
  @LOGIN_ERROR_RESPONSES.TOO_MANY_REQUESTS
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit([
    { prefix: 'login:ip', limit: 10, window: 60, keySource: 'ip' },
    { prefix: 'login:email', limit: 5, window: 60, keySource: 'body.email' },
  ])
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request & { requestId?: string },
    @Res({ passthrough: true }) res?: Response,
  ) {
    return this.authClient.login(loginDto, req.requestId || '', res);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @REGISTER_OPERATION
  @REGISTER_RESPONSE
  @REGISTER_ERROR_RESPONSES.BAD_REQUEST
  @REGISTER_ERROR_RESPONSES.CONFLICT
  @REGISTER_ERROR_RESPONSES.TOO_MANY_REQUESTS
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'register:ip', limit: 5, window: 60, keySource: 'ip' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request & { requestId?: string },
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.authClient.register(registerDto, req.requestId || '', req.path, idempotencyKey);
  }

  @Public()
  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  @VERIFY_OPERATION
  @VERIFY_BODY
  @VERIFY_RESPONSE
  @VERIFY_ERROR_RESPONSES.BAD_REQUEST
  @INTERNAL_SERVER_ERROR_RESPONSE
  async verify(
    @Body() verifyDto: { email: string; code: string },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.authClient.verify(verifyDto, req.requestId || '');
  }

  @Public()
  @Post('register/verify/confirm')
  @HttpCode(HttpStatus.OK)
  @CONFIRM_OPERATION
  @CONFIRM_BODY
  @CONFIRM_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async confirm(
    @Body() confirmDto: { email: string; code: string },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.authClient.confirm(confirmDto, req.requestId || '');
  }

  @Public()
  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  @RESEND_CODE_OPERATION
  @RESEND_CODE_BODY
  @RESEND_CODE_RESPONSE
  @RESEND_CODE_ERROR_RESPONSES.TOO_MANY_REQUESTS
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit([
    { prefix: 'resend:ip', limit: 5, window: 60, keySource: 'ip' },
    { prefix: 'resend:email', limit: 2, window: 60, keySource: 'body.email' },
  ])
  async resendCode(@Body('email') email: string, @Req() req: Request & { requestId?: string }) {
    return this.authClient.resendCode(email, req.requestId || '');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @REFRESH_OPERATION
  @REFRESH_RESPONSE
  @REFRESH_ERROR_RESPONSES.UNAUTHORIZED
  @REFRESH_ERROR_RESPONSES.TOO_MANY_REQUESTS
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'refresh:ip', limit: 20, window: 60, keySource: 'ip' })
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Cookies('deviceId') deviceId: string,
    @Req() req: Request & { requestId?: string },
    @Res({ passthrough: true }) res?: Response,
  ) {
    return this.authClient.refresh(refreshToken ?? '', deviceId ?? '', req.requestId || '', res);
  }

  @Post('logout-device')
  @HttpCode(HttpStatus.OK)
  @LOGOUT_DEVICE_OPERATION
  @LOGOUT_DEVICE_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async logoutDevice(
    @Cookies('deviceId') deviceId: string,
    @Cookies('refreshToken') refreshToken: string,
    @User() user: { userId: string },
    @Req() req: Request & { requestId?: string },
    @Res({ passthrough: true }) res?: Response,
  ) {
    return this.authClient.logoutDevice(
      deviceId ?? '',
      refreshToken ?? '',
      user.userId,
      req.requestId || '',
      res,
      req.headers.authorization,
    );
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @LOGOUT_ALL_OPERATION
  @LOGOUT_ALL_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async logoutAll(
    @User() user: { userId: string },
    @Req() req: Request & { requestId?: string },
    @Res({ passthrough: true }) res?: Response,
  ) {
    return this.authClient.logoutAll(
      user.userId,
      req.requestId || '',
      res,
      req.headers.authorization,
    );
  }

  @Public()
  @Post('forgot/password')
  @HttpCode(HttpStatus.OK)
  @FORGOT_PASSWORD_OPERATION
  @FORGOT_PASSWORD_BODY
  @FORGOT_PASSWORD_RESPONSE
  @FORGOT_PASSWORD_ERROR_RESPONSES.NOT_FOUND
  @FORGOT_PASSWORD_ERROR_RESPONSES.TOO_MANY_REQUESTS
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit([
    { prefix: 'forgot:ip', limit: 5, window: 600, keySource: 'ip' },
    { prefix: 'forgot:email', limit: 2, window: 600, keySource: 'body.email' },
  ])
  async forgotPassword(
    @Body() forgotPasswordDto: { email: string },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.authClient.forgotPassword(forgotPasswordDto, req.requestId || '');
  }

  @Public()
  @Post('forgot/password/verify')
  @HttpCode(HttpStatus.OK)
  @FORGOT_PASSWORD_VERIFY_OPERATION
  @FORGOT_PASSWORD_VERIFY_BODY
  @FORGOT_PASSWORD_VERIFY_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'forgot-verify:ip', limit: 10, window: 600, keySource: 'ip' })
  async forgotPasswordVerify(
    @Body() forgotPasswordVerifyDto: { email: string; code: string },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.authClient.forgotPasswordVerify(forgotPasswordVerifyDto, req.requestId || '');
  }
  @Public()
  @Post('forgot/password/reset')
  @HttpCode(HttpStatus.OK)
  @FORGOT_PASSWORD_RESET_OPERATION
  @FORGOT_PASSWORD_RESET_BODY
  @FORGOT_PASSWORD_RESET_RESPONSE
  @FORGOT_PASSWORD_RESET_ERROR_RESPONSES.BAD_REQUEST
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'forgot-reset:ip', limit: 5, window: 600, keySource: 'ip' })
  async forgotPasswordReset(
    @Body() forgotPasswordResetDto: { email: string; code: string; password: string },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.authClient.forgotPasswordReset(forgotPasswordResetDto, req.requestId || '');
  }
}
