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
import { QuestionsClientService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('client/questions')
@RateLimit({ prefix: 'api:questions', limit: 60, window: 60, keySource: 'userId' })
export class QuestionsClientController {
  constructor(private readonly questionsService: QuestionsClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  findAll(
    @Req() req: any,
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ) {
    return this.questionsService.findAll(req.requestId, auth, page, per_page);
  }

  @Get('my')
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
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('authorization') auth: string,
  ) {
    return this.questionsService.findOne(id, req.requestId, auth);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.questionsService.update(id, updateQuestionDto, auth, req.requestId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') auth: string,
    @Req() req: any,
  ) {
    return this.questionsService.remove(id, auth, req.requestId);
  }
}
