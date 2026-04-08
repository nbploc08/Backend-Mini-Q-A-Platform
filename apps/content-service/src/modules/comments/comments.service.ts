import { Injectable } from '@nestjs/common';
import { ServiceError, ErrorCodes } from '@common/core';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { QueueService } from 'src/modules/queue/queue.service';
import { CommentOnPostSchema, CommentReplySchema } from '@contracts/core';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async create(dto: CreateCommentDto, authorId: string) {
    if (!dto.postId && !dto.questionId) {
      throw new ServiceError({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
        message: 'Either postId or questionId is required',
      });
    }

    if (dto.postId && dto.questionId) {
      throw new ServiceError({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
        message: 'Cannot comment on both a post and a question',
      });
    }

    // Verify target exists
    if (dto.postId) {
      const post = await this.prisma.post.findUnique({ where: { id: dto.postId } });
      if (!post) {
        throw new ServiceError({
          code: ErrorCodes.NOT_FOUND,
          statusCode: 404,
          message: 'Post not found',
        });
      }
    }

    if (dto.questionId) {
      const question = await this.prisma.question.findUnique({ where: { id: dto.questionId } });
      if (!question) {
        throw new ServiceError({
          code: ErrorCodes.NOT_FOUND,
          statusCode: 404,
          message: 'Question not found',
        });
      }
    }

    // Verify parent comment exists if replying
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new ServiceError({
          code: ErrorCodes.NOT_FOUND,
          statusCode: 404,
          message: 'Parent comment not found',
        });
      }
    }

    if (dto.replyToId) {
      const replyTo = await this.prisma.comment.findUnique({ where: { id: dto.replyToId } });
      if (!replyTo) {
        throw new ServiceError({
          code: ErrorCodes.NOT_FOUND,
          statusCode: 404,
          message: 'Reply target comment not found',
        });
      }
    }

    const user = await this.prisma.userReplica.findUnique({
      where: { id: authorId },
      select: { avatarUrl: true },
    });

    const result = await this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId,
        avatarUrl: user?.avatarUrl ?? null,
        postId: dto.postId ?? null,
        questionId: dto.questionId ?? null,
        parentId: dto.parentId ?? null,
        replyToId: dto.replyToId ?? null,
      },
      include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    const snippet = dto.content.length > 80 ? dto.content.slice(0, 80) + '...' : dto.content;

    // Reply to comment → notify replied comment author
    if (dto.replyToId) {
      const replyTo = await this.prisma.comment.findUnique({
        where: { id: dto.replyToId },
        select: { authorId: true },
      });
      if (replyTo && replyTo.authorId !== authorId) {
        const payload = CommentReplySchema.parse({
          commentId: result.id,
          contentSnippet: snippet,
          commenterName: result.author.name,
          targetUserId: replyTo.authorId,
          replyToCommentId: dto.replyToId,
        });
        await this.queueService.commentReply(payload);
      }
    } else if (dto.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: dto.postId },
        select: { authorId: true },
      });
      // chi send noti neu author comment khac author post
      if (post && post.authorId !== authorId) {
        const payload = CommentOnPostSchema.parse({
          commentId: result.id,
          contentSnippet: snippet,
          commenterName: result.author.name,
          targetUserId: post.authorId,
          postId: dto.postId,
        });
        await this.queueService.commentOnPost(payload);
      }
    } else if (dto.questionId) {
      const question = await this.prisma.question.findUnique({
        where: { id: dto.questionId },
        select: { authorId: true },
      });
      if (question && question.authorId !== authorId) {
        const payload = CommentOnPostSchema.parse({
          commentId: result.id,
          contentSnippet: snippet,
          commenterName: result.author.name,
          targetUserId: question.authorId,
          questionId: dto.questionId,
        });
        await this.queueService.commentOnPost(payload);
      }
    }

    return result;
  }

  async findByPost(postId: number, query: QueryCommentDto) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 10;
    const skip = (page - 1) * perPage;

    const where = { postId, parentId: null };

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, email: true, avatarUrl: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true, email: true, avatarUrl: true } },
              replyTo: {
                select: {
                  id: true,
                  author: { select: { id: true, name: true, avatarUrl: true } },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.comment.count({ where }),
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

  async findByQuestion(questionId: number, query: QueryCommentDto) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 10;
    const skip = (page - 1) * perPage;

    const where = { questionId, parentId: null };

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, email: true, avatarUrl: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true, email: true, avatarUrl: true } },
              replyTo: {
                select: {
                  id: true,
                  author: { select: { id: true, name: true, avatarUrl: true } },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.comment.count({ where }),
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
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, email: true, avatarUrl: true } },
            replyTo: {
              select: {
                id: true,
                author: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!comment) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Comment not found',
      });
    }

    return comment;
  }

  async update(id: number, dto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Comment not found',
      });
    }

    if (comment.authorId !== userId) {
      throw new ServiceError({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
        message: 'You can only edit your own comments',
      });
    }

    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
      include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  }

  async remove(id: number, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Comment not found',
      });
    }

    if (comment.authorId !== userId) {
      throw new ServiceError({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
        message: 'You can only delete your own comments',
      });
    }

    return this.prisma.comment.delete({ where: { id } });
  }
}
