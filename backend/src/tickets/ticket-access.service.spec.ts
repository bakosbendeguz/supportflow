import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  Role,
  TicketPriority,
  TicketStatus,
  type Ticket,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TicketAccessService } from './ticket-access.service';
import { NotFoundException } from '@nestjs/common';

describe('TicketAccessService', () => {
  let service: TicketAccessService;

  const prismaMock = {
    ticket: {
      findFirst: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve<Ticket | null>(null);
      }),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TicketAccessService(prismaMock as unknown as PrismaService);
  });

  it('returns no visibility filter for ADMIN', () => {
    const adminUser: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    };

    const result = service.buildVisibilityWhere(adminUser);

    expect(result).toEqual({});
  });

  it('returns visibility filter for CUSTOMER', () => {
    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    const result = service.buildVisibilityWhere(customerUser);

    expect(result).toEqual({ customerId: 'customer-1' });
  });

  it('returns visibility filter for AGENT', () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const result = service.buildVisibilityWhere(agentUser, {
      includeUnassigned: false,
    });

    expect(result).toEqual({ assigneeId: 'agent-1' });
  });

  it('returns visibility filter for AGENT (unassigned tickets)', () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const result = service.buildVisibilityWhere(agentUser, {
      includeUnassigned: true,
    });

    expect(result).toEqual({
      OR: [{ assigneeId: 'agent-1' }, { assigneeId: null }],
    });
  });

  it('includes unassigned tickets by default for AGENT', () => {
    const agentUser: AuthenticatedUser = {
      id: 'agent-1',
      email: 'agent@example.com',
      name: 'Agent User',
      role: Role.AGENT,
    };

    const result = service.buildVisibilityWhere(agentUser);

    expect(result).toEqual({
      OR: [{ assigneeId: 'agent-1' }, { assigneeId: null }],
    });
  });

  it('returns an accessible ticket when Prisma finds one', async () => {
    const fakeTicket = {
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

    prismaMock.ticket.findFirst.mockResolvedValue(fakeTicket);

    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    const result = await service.findAccessibleTicketOrThrow(
      'ticket-1',
      customerUser,
    );

    expect(result).toEqual(fakeTicket);
    expect(prismaMock.ticket.findFirst).toHaveBeenCalledWith({
      where: {
        AND: [{ id: fakeTicket.id }, { customerId: customerUser.id }],
      },
    });
  });

  it('throws NotFoundException when the ticket is not accessible', async () => {
    prismaMock.ticket.findFirst.mockResolvedValue(null);

    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    await expect(
      service.findAccessibleTicketOrThrow('ticket-1', customerUser),
    ).rejects.toThrow(NotFoundException);
  });
});
