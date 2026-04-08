import { Job, Queue } from 'bullmq';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { MailsService } from 'src/modules/mails/mails.service';
import { ErrorCodes, logger, ServiceError } from '@common/core';
import { HttpStatus, OnModuleInit } from '@nestjs/common';
import {
  PASSWORD_RESET_REQUESTED,
  POST_APPROVE,
  PostApproveSchema,
  POST_REJECT,
  PostRejectSchema,
  COMMENT_ON_POST,
  CommentOnPostSchema,
  COMMENT_REPLY,
  CommentReplySchema,
} from '@contracts/core';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '.prisma/notification-client';

@Processor('notification-service', { concurrency: 10 })
export class JobsService extends WorkerHost implements OnModuleInit {
  constructor(
    private readonly mailsService: MailsService,
    private readonly notification: NotificationService,
    @InjectQueue('notification-service') private readonly queue: Queue,
    @InjectQueue('notification-service-dlq') private readonly dlqQueue: Queue,
  ) {
    super();
  }

  async onModuleInit() {
    const handleRedisError = (instance: any, type: string) => {
      if (instance.listenerCount('error') > 0) {
        instance.removeAllListeners('error');
      }

      instance.on('error', (error: any) => {
        const err = error as any;
        if (
          err.code === 'ECONNREFUSED' ||
          (err.name === 'AggregateError' && err.code === 'ECONNREFUSED')
        ) {
          logger.warn(`Redis ${type} connection refused. Retrying...`);
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
          `Redis ${type} connection error`,
        );
      });
    };

    // Xử lý lỗi cho Worker (Consumer)
    handleRedisError(this.worker, 'Worker');

    // Xử lý lỗi cho Queue
    handleRedisError(this.queue, 'Queue');

    //  Khi job fail sau N lần retry → audit log email.failed + push vào DLQ
    this.worker.on('failed', async (job: Job | undefined, error: Error) => {
      // Nếu job vẫn còn lượt retry thì return, để BullMQ tự handle retry
      if (job?.opts?.attempts && job.attemptsMade < job.opts.attempts) {
        return;
      }

      const requestId = job?.id ?? 'unknown';
      const jobName = job?.name ?? 'unknown';
      const attemptsMade = job?.attemptsMade ?? 0;
      const failedReason = error?.message ?? 'Unknown error';

      logger.error(
        {
          event: 'notification.job.failed',
          requestId,
          jobName,
          attemptsMade,
          failedReason,
          email: job?.data?.email != null ? '[redacted]' : undefined,
        },
        'notification.job.failed',
      );

      try {
        await this.dlqQueue.add(
          'failed-notification-job',
          {
            originalJobId: requestId,
            jobName,
            failedReason,
            attemptedAt: new Date().toISOString(),
            dataKeys: job?.data ? Object.keys(job.data) : [],
          },
          { removeOnComplete: { count: 1000 } },
        );
      } catch (dlqErr) {
        logger.error({ requestId, error: (dlqErr as Error).message }, 'Failed to add job to DLQ');
      }
    });

    try {
      await this.worker.waitUntilReady();
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
            code: err.code,
          },
          'Redis connection failed',
        );
      }
    }
  }

  async process(job: Job) {
    switch (job.name) {
      case 'send-verify-code':
        try {
          await this.mailsService.sendVerifyCode(job.data.email, job.data.code);
          logger.info(`Send verify code to ${job.data.email}`);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error(
            {
              error: err.message,
              stack: err.stack,
              jobId: job.id,
              jobName: job.name,
              email: job.data.email,
            },
            'Error sending verify code',
          );
          throw new ServiceError({
            code: ErrorCodes.INTERNAL,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error sending verify code: ${err.message}`,
          });
        }
        break;

      case PASSWORD_RESET_REQUESTED:
        try {
          await this.mailsService.sendResetPassword(job.data.email, job.data.token);
          logger.info(`Send reset password to ${job.data.email}`);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error(
            {
              error: err.message,
              jobId: job.id,
              email: job.data.email,
              token: job.data.token,
            },
            'Error sending reset password',
          );
          throw new ServiceError({
            code: ErrorCodes.INTERNAL,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error sending reset password: ${err.message}`,
          });
        }
        break;

      case POST_APPROVE:
        try {
          const payload = PostApproveSchema.parse(job.data);
          const payLoadMap = {
            userId: payload.authorId,
            type: NotificationType.POST_APPROVED,
            title: 'Post approved',
            body: `Your post "${payload.title}" has been approved successfully.`,
            referenceId: payload.postId,
          };
          await this.notification.createNoti(payLoadMap);
          logger.info(
            { jobId: job.id, postId: payload.postId },
            'Post approved notification received',
          );
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error(
            { error: err.message, jobId: job.id, jobName: job.name, postId: job.data.postId },
            'Error processing post.approve job',
          );
          throw new ServiceError({
            code: ErrorCodes.INTERNAL,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error processing post.approve: ${err.message}`,
          });
        }
        break;

      case POST_REJECT:
        try {
          const payload = PostRejectSchema.parse(job.data);
          const payLoadMap = {
            userId: payload.authorId,
            type: NotificationType.POST_REJECTED,
            title: 'Post rejected',
            body: `Your post "${payload.title}" has been rejected.`,
            referenceId: payload.postId,
          };
          await this.notification.createNoti(payLoadMap);
          logger.info({ jobId: job.id, postId: payload.postId }, 'Post rejected notification sent');
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error(
            { error: err.message, jobId: job.id, jobName: job.name, postId: job.data.postId },
            'Error processing post.reject job',
          );
          throw new ServiceError({
            code: ErrorCodes.INTERNAL,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error processing post.reject: ${err.message}`,
          });
        }
        break;

      case COMMENT_ON_POST:
        try {
          const payload = CommentOnPostSchema.parse(job.data);
          const payLoadMap = {
            userId: payload.targetUserId,
            type: NotificationType.NEW_COMMENT,
            title: 'New comment',
            body: `${payload.commenterName ?? 'Someone'} commented: "${payload.contentSnippet}"`,
            referenceId: payload.commentId,
          };
          await this.notification.createNoti(payLoadMap);
          logger.info(
            { jobId: job.id, commentId: payload.commentId },
            'Comment on post notification sent',
          );
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error(
            { error: err.message, jobId: job.id, jobName: job.name },
            'Error processing comment.onPost job',
          );
          throw new ServiceError({
            code: ErrorCodes.INTERNAL,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error processing comment.onPost: ${err.message}`,
          });
        }
        break;

      case COMMENT_REPLY:
        try {
          const payload = CommentReplySchema.parse(job.data);
          const payLoadMap = {
            userId: payload.targetUserId,
            type: NotificationType.COMMENT_REPLIED,
            title: 'Comment replied',
            body: `${payload.commenterName ?? 'Someone'} replied: "${payload.contentSnippet}"`,
            referenceId: payload.commentId,
          };
          await this.notification.createNoti(payLoadMap);
          logger.info(
            { jobId: job.id, commentId: payload.commentId },
            'Comment reply notification sent',
          );
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error(
            { error: err.message, jobId: job.id, jobName: job.name },
            'Error processing comment.reply job',
          );
          throw new ServiceError({
            code: ErrorCodes.INTERNAL,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error processing comment.reply: ${err.message}`,
          });
        }
        break;

      default:
        logger.warn({ jobName: job.name }, 'Received job with unknown name');
        break;
    }
  }
}
