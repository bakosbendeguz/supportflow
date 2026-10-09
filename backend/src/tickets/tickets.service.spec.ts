import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { TicketAccessService } from './ticket-access.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import {
  Role,
  TicketStatus,
  type Ticket,
  TicketPriority,
} from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
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

    const updateTicketStatusDto = {
      status: TicketStatus.IN_PROGRESS,
    };

    await expect(
      service.updateStatus('ticket-1', updateTicketStatusDto, customerUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('returns the existing ticket without updating when the status is unchanged', async () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const updateTicketStatusDto = {
      status: TicketStatus.IN_PROGRESS,
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

    ticketAccessServiceMock.buildVisibilityWhere.mockReturnValue({
      OR: [{ assigneeId: 'agent-1' }, { assigneeId: null }],
    });

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    const result = await service.updateStatus(
      fakeTicket.id,
      updateTicketStatusDto,
      agentUser,
    );

    expect(result).toEqual(fakeTicket);

    expect(prismaMock.ticket.update).not.toHaveBeenCalled();

    expect(prismaMock.ticketStatusHistory.create).not.toHaveBeenCalled();
  });

  it('updates the status and creates status history when the status changes', async () => {
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
      createdAt: new Date('2026-01-01T00:00:00.00Z'),
      updatedAt: new Date('2026-01-01T00:00:00.00Z'),
    };

    const updatedTicket = {
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

    const updateTicketStatusDto = {
      status: TicketStatus.IN_PROGRESS,
    };

    prismaMock.ticket.findFirst
      .mockResolvedValueOnce(existingTicket)
      .mockResolvedValueOnce(updatedTicket);

    const result = await service.updateStatus(
      existingTicket.id,
      updateTicketStatusDto,
      agentUser,
    );

    expect(result).toEqual(updatedTicket);

    expect(prismaMock.$transaction).toHaveBeenCalled();

    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: {
        id: existingTicket.id,
      },
      data: {
        status: updateTicketStatusDto.status,
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
      createdAt: new Date('2026-01-01T00:00:00.00Z'),
      updatedAt: new Date('2026-01-01T00:00:00.00Z'),
    };

    const updateTicketDto = {
      priority: TicketPriority.HIGH,
    };

    ticketAccessServiceMock.buildVisibilityWhere({});

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    await expect(
      service.update(fakeTicket.id, updateTicketDto, customerUser),
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
      createdAt: new Date('2026-01-01T00:00:00.00Z'),
      updatedAt: new Date('2026-01-01T00:00:00.00Z'),
    };

    const updateTicketDto = {
      assigneeId: 'agent-2',
    };

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    await expect(
      service.update(fakeTicket.id, updateTicketDto, agentUser),
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
      createdAt: new Date('2026-01-01T00:00:00.00Z'),
      updatedAt: new Date('2026-01-01T00:00:00.00Z'),
    };

    const updatedTicket = {
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

    prismaMock.ticket.findFirst
      .mockResolvedValueOnce(existingTicket)
      .mockResolvedValueOnce(updatedTicket);

    prismaMock.user.findUnique.mockResolvedValue({
      role: Role.AGENT,
    });

    const result = await service.update(
      'ticket-1',
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
        assigneeId: updatedTicket.assigneeId,
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
      createdAt: new Date('2026-01-01T00:00:00.00Z'),
      updatedAt: new Date('2026-01-01T00:00:00.00Z'),
    };

    const updateTicketDto = {
      assigneeId: 'customer-2',
    };

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    prismaMock.user.findUnique.mockResolvedValue({
      role: Role.CUSTOMER,
    });

    await expect(
      service.update(fakeTicket.id, updateTicketDto, adminUser),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'customer-2',
      },
    });

    expect(prismaMock.ticket.update).not.toHaveBeenCalled();
  });
});
