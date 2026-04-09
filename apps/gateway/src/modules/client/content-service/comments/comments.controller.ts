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
import { CommentsClientService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  CREATE_COMMENT_OPERATION,
  CREATE_COMMENT_RESPONSE,
  CREATE_COMMENT_ERROR_RESPONSES,
  FIND_BY_POST_OPERATION,
  POST_ID_PARAM,
  COMMENTS_QUERY_PAGE,
  COMMENTS_QUERY_PER_PAGE,
  FIND_BY_POST_RESPONSE,
  FIND_BY_QUESTION_OPERATION,
  QUESTION_ID_PARAM,
  FIND_BY_QUESTION_RESPONSE,
  GET_COMMENT_OPERATION,
  COMMENT_ID_PARAM,
  GET_COMMENT_RESPONSE,
  UPDATE_COMMENT_OPERATION,
  UPDATE_COMMENT_RESPONSE,
  DELETE_COMMENT_OPERATION,
  DELETE_COMMENT_RESPONSE,
} from './swagger/comments.swagger';
import {
  UNAUTHORIZED_RESPONSE,
  NOT_FOUND_RESPONSE,
  INTERNAL_SERVER_ERROR_RESPONSE,
} from 'src/modules/share/swagger';

@ApiTags('Comments')
@Controller('client/comments')
@RateLimit({ prefix: 'api:comments', limit: 60, window: 60, keySource: 'userId' })
export class CommentsClientController {
  constructor(private readonly commentsService: CommentsClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CREATE_COMMENT_OPERATION
  @CREATE_COMMENT_RESPONSE
  @CREATE_COMMENT_ERROR_RESPONSES.BAD_REQUEST
  @CREATE_COMMENT_ERROR_RESPONSES.NOT_FOUND
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
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
  @FIND_BY_POST_OPERATION
  @POST_ID_PARAM
  @COMMENTS_QUERY_PAGE
  @COMMENTS_QUERY_PER_PAGE
  @FIND_BY_POST_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
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
  @FIND_BY_QUESTION_OPERATION
  @QUESTION_ID_PARAM
  @COMMENTS_QUERY_PAGE
  @COMMENTS_QUERY_PER_PAGE
  @FIND_BY_QUESTION_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
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
  @GET_COMMENT_OPERATION
  @COMMENT_ID_PARAM
  @GET_COMMENT_RESPONSE
  @NOT_FOUND_RESPONSE('comment')
  @INTERNAL_SERVER_ERROR_RESPONSE
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') auth: string,
  ) {
    return this.commentsService.findOne(id, req.requestId, auth);
  }

  @Patch(':id')
  @UPDATE_COMMENT_OPERATION
  @COMMENT_ID_PARAM
  @UPDATE_COMMENT_RESPONSE
  @NOT_FOUND_RESPONSE('comment')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.commentsService.update(id, updateCommentDto, auth, req.requestId);
  }

  @Delete(':id')
  @DELETE_COMMENT_OPERATION
  @COMMENT_ID_PARAM
  @DELETE_COMMENT_RESPONSE
  @NOT_FOUND_RESPONSE('comment')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.commentsService.remove(id, auth, req.requestId);
  }
}
