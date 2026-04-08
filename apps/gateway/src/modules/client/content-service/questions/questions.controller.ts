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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsClientService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import {
  CREATE_QUESTION_OPERATION,
  CREATE_QUESTION_RESPONSE,
  CREATE_QUESTION_ERROR_RESPONSES,
  GET_ALL_QUESTIONS_OPERATION,
  QUESTIONS_QUERY_PAGE,
  QUESTIONS_QUERY_PER_PAGE,
  GET_ALL_QUESTIONS_RESPONSE,
  GET_MY_QUESTIONS_OPERATION,
  GET_MY_QUESTIONS_RESPONSE,
  GET_QUESTION_OPERATION,
  QUESTION_ID_PARAM,
  GET_QUESTION_RESPONSE,
  GET_QUESTION_ERROR_RESPONSES,
  UPDATE_QUESTION_OPERATION,
  UPDATE_QUESTION_RESPONSE,
  DELETE_QUESTION_OPERATION,
  DELETE_QUESTION_RESPONSE,
} from './swagger/questions.swagger';
import {
  UNAUTHORIZED_RESPONSE,
  NOT_FOUND_RESPONSE,
  INTERNAL_SERVER_ERROR_RESPONSE,
} from 'src/modules/share/swagger';

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('client/questions')
@RateLimit({ prefix: 'api:questions', limit: 60, window: 60, keySource: 'userId' })
export class QuestionsClientController {
  constructor(private readonly questionsService: QuestionsClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CREATE_QUESTION_OPERATION
  @CREATE_QUESTION_RESPONSE
  @CREATE_QUESTION_ERROR_RESPONSES.BAD_REQUEST
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  @RateLimit({ prefix: 'api:questions:create', limit: 10, window: 60, keySource: 'userId' })
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.questionsService.create(createQuestionDto, auth, req.requestId);
  }

  @Public()
  @Get()
  @GET_ALL_QUESTIONS_OPERATION
  @QUESTIONS_QUERY_PAGE
  @QUESTIONS_QUERY_PER_PAGE
  @GET_ALL_QUESTIONS_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  findAll(
    @Req() req: any,
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ) {
    return this.questionsService.findAll(req.requestId, auth, page, per_page);
  }

  @Get('my')
  @GET_MY_QUESTIONS_OPERATION
  @QUESTIONS_QUERY_PAGE
  @QUESTIONS_QUERY_PER_PAGE
  @GET_MY_QUESTIONS_RESPONSE
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  findMyQuestions(
    @Headers('authorization') auth: string,
    @Req() req: any,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ) {
    return this.questionsService.findMyQuestions(auth, req.requestId, page, per_page);
  }

  @Public()
  @Get(':id')
  @GET_QUESTION_OPERATION
  @QUESTION_ID_PARAM
  @GET_QUESTION_RESPONSE
  @GET_QUESTION_ERROR_RESPONSES.NOT_FOUND
  @INTERNAL_SERVER_ERROR_RESPONSE
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') auth: string,
  ) {
    return this.questionsService.findOne(id, req.requestId, auth);
  }

  @Patch(':id')
  @UPDATE_QUESTION_OPERATION
  @QUESTION_ID_PARAM
  @UPDATE_QUESTION_RESPONSE
  @NOT_FOUND_RESPONSE('câu hỏi')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.questionsService.update(id, updateQuestionDto, auth, req.requestId);
  }

  @Delete(':id')
  @DELETE_QUESTION_OPERATION
  @QUESTION_ID_PARAM
  @DELETE_QUESTION_RESPONSE
  @NOT_FOUND_RESPONSE('câu hỏi')
  @UNAUTHORIZED_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.questionsService.remove(id, auth, req.requestId);
  }
}
