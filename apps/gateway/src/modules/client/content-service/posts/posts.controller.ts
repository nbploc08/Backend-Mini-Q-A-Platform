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
import { PostsClientService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RejectPostDto } from './dto/reject-post.dto';

@Controller('client/posts')
@RateLimit({ prefix: 'api:posts', limit: 60, window: 60, keySource: 'userId' })
export class PostsClientController {
  constructor(private readonly postsService: PostsClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') auth: string,
  ) {
    return this.postsService.findOne(id, req.requestId, auth);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.update(id, updatePostDto, auth, req.requestId);
  }

  @Patch(':id/submit')
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.submit(id, auth, req.requestId);
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.approve(id, auth, req.requestId);
  }

  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.reject(id,  auth, req.requestId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.postsService.remove(id, auth, req.requestId);
  }
}
