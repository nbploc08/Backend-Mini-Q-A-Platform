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
import { CommentsClientService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('client/comments')
@RateLimit({ prefix: 'api:comments', limit: 60, window: 60, keySource: 'userId' })
export class CommentsClientController {
  constructor(private readonly commentsService: CommentsClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({ prefix: 'api:comments:create', limit: 20, window: 60, keySource: 'userId' })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.commentsService.create(createCommentDto, auth, req.requestId);
  }

  @Public()
  @Get('post/:postId')
  findByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: any,
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ) {
    return this.commentsService.findByPost(postId, req.requestId, auth, page, per_page);
  }

  @Public()
  @Get('question/:questionId')
  findByQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Req() req: any,
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ) {
    return this.commentsService.findByQuestion(questionId, req.requestId, auth, page, per_page);
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') auth: string,
  ) {
    return this.commentsService.findOne(id, req.requestId, auth);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.commentsService.update(id, updateCommentDto, auth, req.requestId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.commentsService.remove(id, auth, req.requestId);
  }
}
