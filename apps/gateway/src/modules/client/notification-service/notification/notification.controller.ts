import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Public, RateLimit } from '@common/core';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  NOTIFICATION_HEALTH_OPERATION,
  NOTIFICATION_HEALTH_RESPONSE,
  CREATE_NOTIFICATION_OPERATION,
  CREATE_NOTIFICATION_RESPONSE,
  GET_ALL_NOTIFICATIONS_OPERATION,
  NOTIFICATIONS_QUERY_PAGE,
  NOTIFICATIONS_QUERY_LIMIT,
  NOTIFICATIONS_QUERY_SORT_BY,
  NOTIFICATIONS_QUERY_SORT_ORDER,
  GET_ALL_NOTIFICATIONS_RESPONSE,
  GET_UNREAD_COUNT_OPERATION,
  GET_UNREAD_COUNT_RESPONSE,
  MARK_READ_OPERATION,
  NOTIFICATION_ID_PARAM,
  MARK_READ_RESPONSE,
  READ_ALL_OPERATION,
  READ_ALL_RESPONSE,
} from './swagger/notification.swagger';
import {
  UNAUTHORIZED_RESPONSE,
  INTERNAL_SERVER_ERROR_RESPONSE,
} from 'src/modules/share/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('client/notification')
@RateLimit({ prefix: 'api:notification', limit: 60, window: 60, keySource: 'userId' })
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Public()
  @Get('healthz')
  @NOTIFICATION_HEALTH_OPERATION
  @NOTIFICATION_HEALTH_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  ping() {
    return this.notificationService.ping();
  }

  @Post()
  @CREATE_NOTIFICATION_OPERATION
  @CREATE_NOTIFICATION_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'api:notification:create', limit: 10, window: 60, keySource: 'userId' })
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req: any,
  ) {
    return this.notificationService.create(createNotificationDto, req.headers.authorization, req.requestId);
  }

  @Get()
  @GET_ALL_NOTIFICATIONS_OPERATION
  @NOTIFICATIONS_QUERY_PAGE
  @NOTIFICATIONS_QUERY_LIMIT
  @NOTIFICATIONS_QUERY_SORT_BY
  @NOTIFICATIONS_QUERY_SORT_ORDER
  @GET_ALL_NOTIFICATIONS_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.notificationService.findAll(req.headers.authorization, req.requestId, page, limit, sortBy, sortOrder);
  }

  @Get('unread-count')
  @GET_UNREAD_COUNT_OPERATION
  @GET_UNREAD_COUNT_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  unreadCount(@Req() req: any) {
    return this.notificationService.unreadCount(req.headers.authorization, req.requestId);
  }

  @Post(':id/read')
  @MARK_READ_OPERATION
  @NOTIFICATION_ID_PARAM
  @MARK_READ_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'api:notification:read', limit: 30, window: 60, keySource: 'userId' })
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markRead(id, req.headers.authorization, req.requestId);
  }

  @Post('read-all')
  @READ_ALL_OPERATION
  @READ_ALL_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'api:notification:read-all', limit: 10, window: 60, keySource: 'userId' })
  readAll(@Req() req: any) {
    return this.notificationService.readAll(req.headers.authorization, req.requestId);
  }
}
