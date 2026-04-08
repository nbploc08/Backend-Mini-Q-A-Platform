import {
  POST_APPROVE,
  PostApproveJob,
  POST_REJECT,
  PostRejectJob,
  COMMENT_ON_POST,
  CommentOnPostJob,
  COMMENT_REPLY,
  CommentReplyJob,
} from '@contracts/core';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { logger } from '@common/core';

@Injectable()
export class QueueService implements OnModuleInit {
  constructor(@InjectQueue('notification-service') private queue: Queue) {}

  async onModuleInit() {
    this.queue.removeAllListeners('error');
    this.queue.on('error', (error) => {
      const err = error as any;
      if (
        err.code === 'ECONNREFUSED' ||
        (err.name === 'AggregateError' && err.code === 'ECONNREFUSED')
      ) {
        logger.warn('Redis connection refused. Retrying...');
        return;
      }

      const message =
        error.name === 'AggregateError' && 'errors' in error
          ? (error as any).errors.map((e: any) => e.message).join(', ')
          : error.message;

      logger.error(
        {
          message,
          code: (error as any).code,
        },
        'Redis connection error',
      );
    });

    try {
      await this.queue.waitUntilReady();
      logger.info('Redis connection established successfully');
    } catch (error) {
      const err = error as any;
      if (
        err.code === 'ECONNREFUSED' ||
        (err.name === 'AggregateError' && err.code === 'ECONNREFUSED')
      ) {
        logger.error('Failed to establish initial Redis connection: Connection refused');
      } else {
        const message =
          err.name === 'AggregateError' && 'errors' in err
            ? (err as any).errors.map((e: any) => e.message).join(', ')
            : err.message;

        logger.error(
          {
            message,
            code: (error as any).code,
          },
          'Redis connection failed',
        );
      }
    }
  }

  async approvePost(data: PostApproveJob) {
    await this.queue.add(POST_APPROVE, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnFail: false,
    });
  }

  async rejectPost(data: PostRejectJob) {
    await this.queue.add(POST_REJECT, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnFail: false,
    });
  }

  async commentOnPost(data: CommentOnPostJob) {
    await this.queue.add(COMMENT_ON_POST, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnFail: false,
    });
  }

  async commentReply(data: CommentReplyJob) {
    await this.queue.add(COMMENT_REPLY, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnFail: false,
    });
  }
}
