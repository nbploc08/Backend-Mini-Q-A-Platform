import { Injectable } from '@nestjs/common';
import { PostStatus } from '.prisma/content-client';
import { ServiceError, ErrorCodes } from '@common/core';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePostDto, authorId: string) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: PostStatus.DRAFT,
        authorId,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(query: QueryPostDto) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 10;
    const skip = (page - 1) * perPage;

    const where: Record<string, any> = {};
    if (query.status) {
      where.status = query.status as PostStatus;
    } else {
      // Public listing: only show approved posts
      where.status = PostStatus.APPROVED;
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.post.count({ where }),
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

  async findMyPosts(authorId: string, query: QueryPostDto) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 10;
    const skip = (page - 1) * perPage;

    const where: Record<string, any> = { authorId };
    if (query.status) {
      where.status = query.status as PostStatus;
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.post.count({ where }),
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
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Post not found',
      });
    }

    return post;
  }

  async update(id: number, dto: UpdatePostDto, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Post not found',
      });
    }

    if (post.authorId !== userId) {
      throw new ServiceError({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
        message: 'You can only edit your own posts',
      });
    }

    let newStatus = post.status;
    if (post.status === PostStatus.APPROVED || post.status === PostStatus.REJECTED) {
      newStatus = PostStatus.PENDING;
    }


    return this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        status: newStatus,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async submit(id: number, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Post not found',
      });
    }

    if (post.authorId !== userId) {
      throw new ServiceError({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
        message: 'You can only submit your own posts',
      });
    }

    if (post.status !== PostStatus.DRAFT) {
      throw new ServiceError({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
        message: 'Only draft posts can be submitted for review',
      });
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.PENDING },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async approve(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Post not found',
      });
    }

    if (post.status !== PostStatus.PENDING) {
      throw new ServiceError({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
        message: 'Only pending posts can be approved',
      });
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.APPROVED },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async reject(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Post not found',
      });
    }

    if (post.status !== PostStatus.PENDING) {
      throw new ServiceError({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
        message: 'Only pending posts can be rejected',
      });
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.REJECTED },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: number, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new ServiceError({
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
        message: 'Post not found',
      });
    }

    if (post.authorId !== userId) {
      throw new ServiceError({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
        message: 'You can only delete your own posts',
      });
    }

    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post deleted successfully' };
  }
}
