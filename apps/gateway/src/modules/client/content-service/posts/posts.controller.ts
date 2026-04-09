import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Req,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public, RateLimit } from '@common/core';
import { ApiTags } from '@nestjs/swagger';
import { PostsClientService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  CREATE_POST_OPERATION,
  CREATE_POST_RESPONSE,
  CREATE_POST_ERROR_RESPONSES,
  GET_ALL_POSTS_OPERATION,
  POSTS_QUERY_PAGE,
  POSTS_QUERY_PER_PAGE,
  POSTS_QUERY_STATUS,
  GET_ALL_POSTS_RESPONSE,
  GET_MY_POSTS_OPERATION,
  GET_MY_POSTS_RESPONSE,
  GET_POST_OPERATION,
  POST_ID_PARAM,
  GET_POST_RESPONSE,
  GET_POST_ERROR_RESPONSES,
  UPDATE_POST_OPERATION,
  UPDATE_POST_RESPONSE,
  SUBMIT_POST_OPERATION,
  SUBMIT_POST_RESPONSE,
  APPROVE_POST_OPERATION,
  APPROVE_POST_RESPONSE,
  REJECT_POST_OPERATION,
  REJECT_POST_RESPONSE,
  DELETE_POST_OPERATION,
  DELETE_POST_RESPONSE,
} from './swagger/posts.swagger';
import {
  UNAUTHORIZED_RESPONSE,
  NOT_FOUND_RESPONSE,
  INTERNAL_SERVER_ERROR_RESPONSE,
} from 'src/modules/share/swagger';

@ApiTags('Posts')
@Controller('client/posts')
@RateLimit({ prefix: 'api:posts', limit: 60, window: 60, keySource: 'userId' })
export class PostsClientController {
  constructor(private readonly postsService: PostsClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CREATE_POST_OPERATION
  @CREATE_POST_RESPONSE
  @CREATE_POST_ERROR_RESPONSES.BAD_REQUEST
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'api:posts:create', limit: 10, window: 60, keySource: 'userId' })
  create(
    @Body() createPostDto: CreatePostDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.create(createPostDto, auth, req.requestId);
  }

  @Public()
  @Get()
  @GET_ALL_POSTS_OPERATION
  @POSTS_QUERY_PAGE
  @POSTS_QUERY_PER_PAGE
  @POSTS_QUERY_STATUS
  @GET_ALL_POSTS_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  findAll(
    @Req() req: any,
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
    @Query('status') status?: string,
  ) {
    return this.postsService.findAll(req.requestId, auth, page, per_page, status);
  }

  @Get('my')
  @GET_MY_POSTS_OPERATION
  @POSTS_QUERY_PAGE
  @POSTS_QUERY_PER_PAGE
  @POSTS_QUERY_STATUS
  @GET_MY_POSTS_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  findMyPosts(
    @Headers('authorization') auth: string,
    @Req() req: any,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
    @Query('status') status?: string,
  ) {
    return this.postsService.findMyPosts(auth, req.requestId, page, per_page, status);
  }

  @Public()
  @Get(':id')
  @GET_POST_OPERATION
  @POST_ID_PARAM
  @GET_POST_RESPONSE
  @GET_POST_ERROR_RESPONSES.NOT_FOUND
  @INTERNAL_SERVER_ERROR_RESPONSE
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') auth: string,
  ) {
    return this.postsService.findOne(id, req.requestId, auth);
  }

  @Patch(':id')
  @UPDATE_POST_OPERATION
  @POST_ID_PARAM
  @UPDATE_POST_RESPONSE
  @NOT_FOUND_RESPONSE('bài viết')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.update(id, updatePostDto, auth, req.requestId);
  }

  @Patch(':id/submit')
  @SUBMIT_POST_OPERATION
  @POST_ID_PARAM
  @SUBMIT_POST_RESPONSE
  @NOT_FOUND_RESPONSE('bài viết')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.submit(id, auth, req.requestId);
  }

  @Patch(':id/approve')
  @APPROVE_POST_OPERATION
  @POST_ID_PARAM
  @APPROVE_POST_RESPONSE
  @NOT_FOUND_RESPONSE('bài viết')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.approve(id, auth, req.requestId);
  }

  @Patch(':id/reject')
  @REJECT_POST_OPERATION
  @POST_ID_PARAM
  @REJECT_POST_RESPONSE
  @NOT_FOUND_RESPONSE('bài viết')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.reject(id, auth, req.requestId);
  }

  @Delete(':id')
  @DELETE_POST_OPERATION
  @POST_ID_PARAM
  @DELETE_POST_RESPONSE
  @NOT_FOUND_RESPONSE('bài viết')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.remove(id, auth, req.requestId);
  }
}
