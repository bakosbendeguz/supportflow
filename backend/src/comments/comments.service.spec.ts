import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import {
  Role,
  type Ticket,
  TicketStatus,
  TicketPriority,
} from '@prisma/client';

import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { TicketAccessService } from '../tickets/ticket-access.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentsService', () => {
  const prismaMock = {
    ticketComment: {
      findMany: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve<unknown[]>([]);
      }),

      create: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve<unknown>(null);
      }),
    },
  };

  const ticketAccessServiceMock = {
    findAccessibleTicketOrThrow: jest.fn(
      (ticketId?: string, user?: AuthenticatedUser) => {
        void ticketId;
        void user;

        return Promise.resolve({} as Ticket);
      },
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const service = new CommentsService(
    prismaMock as unknown as PrismaService,
    ticketAccessServiceMock as unknown as TicketAccessService,
  );

  it('does not load comments when the ticket is not accessible', async () => {
    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    ticketAccessServiceMock.findAccessibleTicketOrThrow.mockRejectedValue(
      new NotFoundException('Ticket not found.'),
    );

    await expect(service.findAll('ticket-1', customerUser)).rejects.toThrow(
      NotFoundException,
    );

    expect(
      ticketAccessServiceMock.findAccessibleTicketOrThrow,
    ).toHaveBeenCalledWith('ticket-1', customerUser);
  });

  expect(prismaMock.ticketComment.findMany).not.toHaveBeenCalled();

  it('returns comments for an accessible ticket', async () => {
    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    const fakeTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: 'agent-1',
      createdAt: new Date('2026-01-01T00:00:00.00Z'),
      updatedAt: new Date('2026-01-01T00:00:00.00Z'),
    };

    const fakeComment = [
      {
        id: 'comment-1',
        message: 'Test comment',
        ticketId: 'ticket-1',
        authorId: 'customer-1',
        createdAt: new Date('2026-01-01T00:00:00.00Z'),
        updatedAt: new Date('2026-01-01T00:00:00.00Z'),
        author: {
          id: 'customer-1',
          email: 'customer@example.com',
          name: 'Customer User',
          role: Role.CUSTOMER,
        },
      },
    ];

    ticketAccessServiceMock.findAccessibleTicketOrThrow.mockResolvedValue(
      fakeTicket,
    );

    prismaMock.ticketComment.findMany.mockResolvedValue(fakeComment);

    const result = await service.findAll(fakeTicket.id, customerUser);

    expect(result).toEqual(fakeComment);

    expect(
      ticketAccessServiceMock.findAccessibleTicketOrThrow,
    ).toHaveBeenCalledWith(fakeTicket.id, customerUser);

    expect(prismaMock.ticketComment.findMany).toHaveBeenCalledWith({
      where: {
        ticketId: fakeTicket.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  });

  it('creates a comment for an accessible ticket', async () => {
    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    const fakeTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: 'agent-1',
      createdAt: new Date('2026-01-01T00:00:00.00Z'),
      updatedAt: new Date('2026-01-01T00:00:00.00Z'),
    };

    const createCommentDto: CreateCommentDto = {
      message: 'Test comment',
    };

    const fakeComment = {
      id: 'comment-1',
      message: 'Test comment',
      ticketId: 'ticket-1',
      authorId: 'customer-1',
      createdAt: new Date('2026-01-01T00:00:00.00Z'),
      updatedAt: new Date('2026-01-01T00:00:00.00Z'),
      author: {
        id: 'customer-1',
        email: 'customer@example.com',
        name: 'Customer User',
        role: Role.CUSTOMER,
      },
    };

    ticketAccessServiceMock.findAccessibleTicketOrThrow.mockResolvedValue(
      fakeTicket,
    );

    prismaMock.ticketComment.create.mockResolvedValue(fakeComment);

    const result = await service.create(
      fakeTicket.id,
      createCommentDto,
      customerUser,
    );

    expect(result).toEqual(fakeComment);

    expect(
      ticketAccessServiceMock.findAccessibleTicketOrThrow,
    ).toHaveBeenCalledWith(fakeTicket.id, customerUser);

    expect(prismaMock.ticketComment.create).toHaveBeenCalledWith({
      data: {
        message: createCommentDto.message,
        ticketId: fakeTicket.id,
        authorId: customerUser.id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  });

  it('does not create a comment when a ticket is not accessible', async () => {
    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    const createCommentDto: CreateCommentDto = {
      message: 'Test comment',
    };

    ticketAccessServiceMock.findAccessibleTicketOrThrow.mockRejectedValue(
      new NotFoundException('Ticket not found.'),
    );

    await expect(
      service.create('ticket-1', createCommentDto, customerUser),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.ticketComment.create).not.toHaveBeenCalled();
  });
});
