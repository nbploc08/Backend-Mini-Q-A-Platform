import { Injectable } from '@nestjs/common';
import { CreateUserRepSchema } from '@contracts/core/dist/jobs/createUser.jobs';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class UserReplicaService {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Đẩy job để content-service (và consumer khác) đồng bộ bản ghi UserReplica.
   */
  async publishUserCreated(params: {
    id: string;
    email: string;
    name?: string | null;
  }): Promise<void> {
    const eventPayload = {
      id: params.id,
      email: params.email,
      ...(params.name != null && params.name !== '' ? { name: params.name } : {}),
    };
    const validatedPayload = CreateUserRepSchema.parse(eventPayload);
    await this.queueService.createUserJob(validatedPayload);
  }
}
