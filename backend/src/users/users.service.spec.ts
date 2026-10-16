import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Role, type User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

type AgentListItem = Pick<User, 'id' | 'email' | 'name' | 'role'>;

describe('UsersService', () => {
  const prismaMock = {
    user: {
      findMany: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve<AgentListItem[]>([]);
      }),
    },
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new UsersService(prismaMock as unknown as PrismaService);
  });

  it('returns only agents', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    await service.findAgents();

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: {
        role: Role.AGENT,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  });
});
