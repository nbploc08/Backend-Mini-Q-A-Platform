import { Job, Queue } from 'bullmq';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { ErrorCodes, logger, ServiceError } from '@common/core';
import { HttpStatus, OnModuleInit } from '@nestjs/common';
import { PASSWORD_RESET_REQUESTED } from '@contracts/core';
import {
  CREATE_USER_REP,
  CreateUserRepSchema,
} from '@contracts/core/dist/jobs/createUser.jobs';
import { UserReplicaService } from 'src/modules/user-replica/user-replica.service';

@Processor('mail')
export class JobsService extends WorkerHost implements OnModuleInit {
  constructor(
    @InjectQueue('mail') private readonly queue: Queue,
    @InjectQueue('mail-dlq') private readonly dlqQueue: Queue,
    private readonly userReplicaService: UserReplicaService,
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

    this.worker.on('failed', async (job: Job | undefined, error: Error) => {
      if (job?.opts?.attempts && job.attemptsMade < job.opts.attempts) {
        return;
      }

      const requestId = job?.id ?? 'unknown';
      const jobName = job?.name ?? 'unknown';
      const attemptsMade = job?.attemptsMade ?? 0;
      const failedReason = error?.message ?? 'Unknown error';

      logger.error(
        {
          event: 'bullmq.job.failed',
          queue: 'mail',
          requestId,
          jobName,
          attemptsMade,
          failedReason,
          email: job?.data?.email != null ? '[redacted]' : undefined,
        },
        'BullMQ job failed (after retries)',
      );

      try {
        await this.dlqQueue.add(
          'failed-mail-job',
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
          error.name === 'AggregateError' && 'errors' in error
            ? (error as any).errors.map((e: any) => e.message).join(', ')
            : error.message;

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

  async process(job: Job) {
    switch (job.name) {
      case CREATE_USER_REP: {
        try {
          const data = CreateUserRepSchema.parse(job.data);
          await this.userReplicaService.upsertFromCreateUserJob(data);
          logger.info(
            { jobId: job.id, userId: data.id, email: data.email },
            'UserReplica upserted from auth-service job',
          );
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error(
            {
              error: err.message,
              stack: err.stack,
              jobId: job.id,
              jobName: job.name,
            },
            'Error processing user.created job',
          );
          throw new ServiceError({
            code: ErrorCodes.INTERNAL,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error processing user.created: ${err.message}`,
          });
        }
        break;
      }

      case 'send-verify-code':
        try {
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

      default:
        logger.warn({ jobId: job.id, jobName: job.name }, 'Unhandled BullMQ job name');
    }
  }
}
