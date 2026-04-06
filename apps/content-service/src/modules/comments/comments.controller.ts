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
import { User } from '@common/core';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';

@Controller('comments/internal')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @User('userId') userId: string,
  ) {
    return this.commentsService.create(createCommentDto, userId);
  }

  @Get('post/:postId')
  findByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: QueryCommentDto,
  ) {
    return this.commentsService.findByPost(postId, query);
  }

  @Get('question/:questionId')
  findByQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Query() query: QueryCommentDto,
  ) {
    return this.commentsService.findByQuestion(questionId, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @User('userId') userId: string,
  ) {
    return this.commentsService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @User('userId') userId: string,
  ) {
    return this.commentsService.remove(id, userId);
  }
}
