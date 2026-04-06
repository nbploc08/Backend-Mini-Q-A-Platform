import { Injectable } from '@nestjs/common';
import { ServiceError, ErrorCodes } from '@common/core';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuestionDto, authorId: string) {
    return this.prisma.question.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(query: QueryQuestionDto) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 10;
    const skip = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.question.count(),
    ]);

    return {
      data,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    };
  }

  async findMyQuestions(authorId: string, query: QueryQuestionDto) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 10;
    const skip = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where: { authorId },
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.question.count({ where: { authorId } }),
    ]);

    return {
      data,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!question) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Question not found',
      });
    }

    return question;
  }

  async update(id: number, dto: UpdateQuestionDto, userId: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });

    if (!question) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Question not found',
      });
    }

    if (question.authorId !== userId) {
      throw new ServiceError({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
        message: 'You can only edit your own questions',
      });
    }

    return this.prisma.question.update({
      where: { id },
      data: { ...dto },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: number, userId: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });

    if (!question) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Question not found',
      });
    }

    if (question.authorId !== userId) {
      throw new ServiceError({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
        message: 'You can only delete your own questions',
      });
    }

    return this.prisma.question.delete({ where: { id } });
  }
}
