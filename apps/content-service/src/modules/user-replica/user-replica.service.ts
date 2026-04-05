import { Injectable } from '@nestjs/common';
import type { CreateUserRepJob } from '@contracts/core/dist/jobs/createUser.jobs';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UserReplicaService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromCreateUserJob(data: CreateUserRepJob): Promise<void> {
    await this.prisma.userReplica.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        email: data.email,
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
      },
      update: {
        email: data.email,
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
      },
    });
  }
}
