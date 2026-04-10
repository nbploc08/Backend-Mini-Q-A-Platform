import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/modules/internal-jwt/strategy/jwt-auth.guard';
import { RateLimit } from '@common/core';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RoleClientService } from './role-client.service';
import {
  CREATE_ROLE_OPERATION,
  CREATE_ROLE_BODY,
  CREATE_ROLE_RESPONSE,
  CREATE_ROLE_ERROR_RESPONSES,
  GET_ALL_ROLES_OPERATION,
  GET_ALL_ROLES_RESPONSE,
  GET_ROLE_OPERATION,
  ROLE_ID_PARAM,
  GET_ROLE_RESPONSE,
  UPDATE_ROLE_OPERATION,
  UPDATE_ROLE_BODY,
  UPDATE_ROLE_RESPONSE,
  DELETE_ROLE_OPERATION,
  DELETE_ROLE_RESPONSE,
  GET_USER_ROLES_OPERATION,
  USER_ID_PARAM,
  GET_USER_ROLES_RESPONSE,
  GET_USER_PERMISSIONS_OPERATION,
  GET_USER_PERMISSIONS_RESPONSE,
  ASSIGN_ROLE_OPERATION,
  ASSIGN_ROLE_BODY,
  ASSIGN_ROLE_RESPONSE,
  ASSIGN_ROLE_ERROR_RESPONSES,
  UNASSIGN_ROLE_OPERATION,
  UNASSIGN_ROLE_BODY,
  UNASSIGN_ROLE_RESPONSE,
} from './swagger/role.swagger';
import {
  UNAUTHORIZED_RESPONSE,
  INTERNAL_SERVER_ERROR_RESPONSE,
  NOT_FOUND_RESPONSE,
} from 'src/modules/share/swagger';
function getRequestId(req: Request & { requestId?: string }): string {
  const rid = req.requestId ?? req.headers['x-request-id'];
  return Array.isArray(rid) ? (rid[0] ?? '') : (rid ?? '');
}

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('client/roles')
@UseGuards(JwtAuthGuard)
@RateLimit({ prefix: 'api:roles', limit: 60, window: 60, keySource: 'userId' })
export class RoleClientController {
  constructor(private readonly roleClient: RoleClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CREATE_ROLE_OPERATION
  @CREATE_ROLE_BODY
  @CREATE_ROLE_RESPONSE
  @CREATE_ROLE_ERROR_RESPONSES.BAD_REQUEST
  @CREATE_ROLE_ERROR_RESPONSES.CONFLICT
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'api:roles:create', limit: 10, window: 60, keySource: 'userId' })
  async create(
    @Body() createRoleDto: { name: string; description?: string; permissionIds?: string[] },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.roleClient.create(createRoleDto, getRequestId(req), req.headers.authorization);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @GET_ALL_ROLES_OPERATION
  @GET_ALL_ROLES_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async findAll(@Req() req: Request & { requestId?: string }) {
    return this.roleClient.findAll(getRequestId(req), req.headers.authorization);
  }

  @Get('users/:userId/roles')
  @HttpCode(HttpStatus.OK)
  @GET_USER_ROLES_OPERATION
  @USER_ID_PARAM
  @GET_USER_ROLES_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async getRolesForUser(
    @Param('userId') userId: string,
    @Req() req: Request & { requestId?: string },
  ) {
    return this.roleClient.getRolesForUser(userId, getRequestId(req), req.headers.authorization);
  }

  @Get('users/:userId/permissions')
  @HttpCode(HttpStatus.OK)
  @GET_USER_PERMISSIONS_OPERATION
  @USER_ID_PARAM
  @GET_USER_PERMISSIONS_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async getPermissionsForUser(
    @Param('userId') userId: string,
    @Req() req: Request & { requestId?: string },
  ) {
    return this.roleClient.getPermissionsForUser(
      userId,
      getRequestId(req),
      req.headers.authorization,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @GET_ROLE_OPERATION
  @ROLE_ID_PARAM
  @GET_ROLE_RESPONSE
  @NOT_FOUND_RESPONSE('role')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async findOne(@Param('id') id: string, @Req() req: Request & { requestId?: string }) {
    return this.roleClient.findOne(id, getRequestId(req), req.headers.authorization);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UPDATE_ROLE_OPERATION
  @ROLE_ID_PARAM
  @UPDATE_ROLE_BODY
  @UPDATE_ROLE_RESPONSE
  @NOT_FOUND_RESPONSE('role')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: { name?: string; description?: string; permissionIds?: string[] },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.roleClient.update(id, updateRoleDto, getRequestId(req), req.headers.authorization);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @DELETE_ROLE_OPERATION
  @ROLE_ID_PARAM
  @DELETE_ROLE_RESPONSE
  @NOT_FOUND_RESPONSE('role')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async remove(@Param('id') id: string, @Req() req: Request & { requestId?: string }) {
    return this.roleClient.remove(id, getRequestId(req), req.headers.authorization);
  }

  @Post('assign-role')
  @HttpCode(HttpStatus.OK)
  @ASSIGN_ROLE_OPERATION
  @ASSIGN_ROLE_BODY
  @ASSIGN_ROLE_RESPONSE
  @ASSIGN_ROLE_ERROR_RESPONSES.NOT_FOUND
  @ASSIGN_ROLE_ERROR_RESPONSES.CONFLICT
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'api:roles:assign', limit: 10, window: 60, keySource: 'userId' })
  async assignRole(
    @Body() dto: { userId: string; roleName: string },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.roleClient.assignRole(dto, getRequestId(req), req.headers.authorization);
  }

  @Post('unassign-role')
  @HttpCode(HttpStatus.OK)
  @UNASSIGN_ROLE_OPERATION
  @UNASSIGN_ROLE_BODY
  @UNASSIGN_ROLE_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'api:roles:unassign', limit: 10, window: 60, keySource: 'userId' })
  async unassignRole(
    @Body() dto: { userId: string; roleName: string },
    @Req() req: Request & { requestId?: string },
  ) {
    return this.roleClient.unassignRole(dto, getRequestId(req), req.headers.authorization);
  }
}
