import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { User, RequirePermission, PermissionCode } from '@common/core';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Controller('posts/internal')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @User('userId') userId: string) {
    return this.postsService.create(createPostDto, userId);
  }

  @Get()
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAll(query);
  }

  @Get('my')
  findMyPosts(@User('userId') userId: string, @Query() query: QueryPostDto) {
    return this.postsService.findMyPosts(userId, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @User('userId') userId: string,
  ) {
    return this.postsService.update(id, updatePostDto, userId);
  }

  @Patch(':id/submit')
  submit(@Param('id', ParseIntPipe) id: number, @User('userId') userId: string) {
    return this.postsService.submit(id, userId);
  }

  @Patch(':id/approve')
  @RequirePermission(PermissionCode.POSTS_MODERATE)
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.approve(id);
  }

  @Patch(':id/reject')
  @RequirePermission(PermissionCode.POSTS_MODERATE)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.reject(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @User('userId') userId: string) {
    return this.postsService.remove(id, userId);
  }
}
