import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  Role,
  TicketPriority,
  TicketStatus,
  type Ticket,
} from '@prisma/client';

import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { TicketAccessService } from './ticket-access.service';
import { TicketsService } from './tickets.service';

describe('TicketService', () => {
  const prismaMock = {
    ticket: {
      findFirst: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve<Ticket | null>(null);
      }),
      update: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve(null);
      }),
    },
    ticketStatusHistory: {
      create: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve(null);
      }),
    },
    user: {
      findUnique: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve<{ role: Role } | null>(null);
      }),
    },
    $transaction: jest.fn((operations?: unknown) => {
      void operations;
      return Promise.resolve([]);
    }),
  };

  const ticketAccessServiceMock = {
    buildVisibilityWhere: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.ticket.findFirst.mockResolvedValue(null);
    ticketAccessServiceMock.buildVisibilityWhere.mockReturnValue({});
  });

  const service = new TicketsService(
    prismaMock as unknown as PrismaService,
    ticketAccessServiceMock as unknown as TicketAccessService,
  );

  it('throws ForbiddenException when a customer tries to update ticket status', async () => {
    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    await expect(
      service.updateStatus(
        'ticket-1',
        { status: TicketStatus.IN_PROGRESS },
        customerUser,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('returns the existing ticket without updating when the status is unchanged', async () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const fakeTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: 'agent-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    const result = await service.updateStatus(
      fakeTicket.id,
      { status: TicketStatus.IN_PROGRESS },
      agentUser,
    );

    expect(result).toEqual(fakeTicket);
    expect(prismaMock.ticket.update).not.toHaveBeenCalled();
    expect(prismaMock.ticketStatusHistory.create).not.toHaveBeenCalled();
  });

  it('updates status and creates status history for an assigned agent ticket', async () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const existingTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: 'agent-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const updatedTicket = {
      ...existingTicket,
      status: TicketStatus.IN_PROGRESS,
    };

    prismaMock.ticket.findFirst
      .mockResolvedValueOnce(existingTicket)
      .mockResolvedValueOnce(updatedTicket);

    const result = await service.updateStatus(
      existingTicket.id,
      { status: TicketStatus.IN_PROGRESS },
      agentUser,
    );

    expect(result).toEqual(updatedTicket);

    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: { id: existingTicket.id },
      data: {
        status: TicketStatus.IN_PROGRESS,
      },
    });

    expect(prismaMock.ticketStatusHistory.create).toHaveBeenCalledWith({
      data: {
        ticketId: existingTicket.id,
        oldStatus: TicketStatus.OPEN,
        newStatus: TicketStatus.IN_PROGRESS,
        changedById: agentUser.id,
      },
    });
  });

  it('auto-assigns an unassigned ticket to the agent when updating status', async () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const existingTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const updatedTicket = {
      ...existingTicket,
      status: TicketStatus.IN_PROGRESS,
      assigneeId: agentUser.id,
    };

    prismaMock.ticket.findFirst
      .mockResolvedValueOnce(existingTicket)
      .mockResolvedValueOnce(updatedTicket);

    const result = await service.updateStatus(
      existingTicket.id,
      { status: TicketStatus.IN_PROGRESS },
      agentUser,
    );

    expect(result).toEqual(updatedTicket);

    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: { id: existingTicket.id },
      data: {
        status: TicketStatus.IN_PROGRESS,
        assigneeId: agentUser.id,
      },
    });

    expect(prismaMock.ticketStatusHistory.create).toHaveBeenCalledWith({
      data: {
        ticketId: existingTicket.id,
        oldStatus: TicketStatus.OPEN,
        newStatus: TicketStatus.IN_PROGRESS,
        changedById: agentUser.id,
      },
    });
  });

  it('does not auto-assign an unassigned ticket when an admin updates status', async () => {
    const adminUser: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    };

    const existingTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const updatedTicket = {
      ...existingTicket,
      status: TicketStatus.IN_PROGRESS,
    };

    prismaMock.ticket.findFirst
      .mockResolvedValueOnce(existingTicket)
      .mockResolvedValueOnce(updatedTicket);

    const result = await service.updateStatus(
      existingTicket.id,
      { status: TicketStatus.IN_PROGRESS },
      adminUser,
    );

    expect(result).toEqual(updatedTicket);

    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: { id: existingTicket.id },
      data: {
        status: TicketStatus.IN_PROGRESS,
      },
    });
  });

  it('throws ForbiddenException when a customer tries to update ticket priority', async () => {
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
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    await expect(
      service.update(
        fakeTicket.id,
        { priority: TicketPriority.HIGH },
        customerUser,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(prismaMock.ticket.update).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when an agent tries to assign a ticket to another agent', async () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const fakeTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    await expect(
      service.update(fakeTicket.id, { assigneeId: 'agent-2' }, agentUser),
    ).rejects.toThrow(ForbiddenException);

    expect(prismaMock.ticket.update).not.toHaveBeenCalled();
  });

  it('allows an agent to assign an unassigned ticket to themselves', async () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const existingTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const updatedTicket = {
      ...existingTicket,
      assigneeId: agentUser.id,
    };

    prismaMock.ticket.findFirst
      .mockResolvedValueOnce(existingTicket)
      .mockResolvedValueOnce(updatedTicket);

    prismaMock.user.findUnique.mockResolvedValue({
      role: Role.AGENT,
    });

    const result = await service.update(
      existingTicket.id,
      { assigneeId: agentUser.id },
      agentUser,
    );

    expect(result).toEqual(updatedTicket);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: agentUser.id,
      },
    });

    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: {
        id: existingTicket.id,
      },
      data: {
        assigneeId: agentUser.id,
      },
    });
  });

  it('throws BadRequestException when the assignee is not an agent', async () => {
    const adminUser: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    };

    const fakeTicket = {
      id: 'ticket-1',
      title: 'Test ticket',
      description: 'Test description',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: 'customer-1',
      assigneeId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    prismaMock.user.findUnique.mockResolvedValue({
      role: Role.CUSTOMER,
    });

    await expect(
      service.update(fakeTicket.id, { assigneeId: 'customer-2' }, adminUser),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'customer-2',
      },
    });

    expect(prismaMock.ticket.update).not.toHaveBeenCalled();
  });
});
