import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Role, TicketPriority, TicketStatus } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { TicketAccessService } from '../tickets/ticket-access.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  const prismaMock = {
    ticket: {
      count: jest.fn((args?: unknown) => {
        void args;
        return Promise.resolve(0);
      }),
    },
  };

  const ticketAccessServiceMock = {
    buildVisibilityWhere: jest.fn((user?: AuthenticatedUser) => {
      void user;
      return {};
    }),
  };

  const service = new DashboardService(
    prismaMock as unknown as PrismaService,
    ticketAccessServiceMock as unknown as TicketAccessService,
  );

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.ticket.count.mockResolvedValue(0);
    ticketAccessServiceMock.buildVisibilityWhere.mockReturnValue({});
  });

  it('returns a dashboard summary using the user visibility scope', async () => {
    const customerUser: AuthenticatedUser = {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
    };

    const visibilityWhere = {
      customerId: customerUser.id,
    };

    ticketAccessServiceMock.buildVisibilityWhere.mockReturnValue(
      visibilityWhere,
    );

    prismaMock.ticket.count
      .mockResolvedValueOnce(10) // totalTickets
      .mockResolvedValueOnce(3) // OPEN
      .mockResolvedValueOnce(2) // IN_PROGRESS
      .mockResolvedValueOnce(1) // WAITING_FOR_CUSTOMER
      .mockResolvedValueOnce(3) // RESOLVED
      .mockResolvedValueOnce(1) // CLOSED

      .mockResolvedValueOnce(2) // LOW
      .mockResolvedValueOnce(4) // MEDIUM
      .mockResolvedValueOnce(3) // HIGH
      .mockResolvedValueOnce(1) // URGENT

      .mockResolvedValueOnce(2); // unassigned

    const result = await service.getSummary(customerUser);

    expect(result).toEqual({
      totalTickets: 10,

      byStatus: {
        [TicketStatus.OPEN]: 3,
        [TicketStatus.IN_PROGRESS]: 2,
        [TicketStatus.WAITING_FOR_CUSTOMER]: 1,
        [TicketStatus.RESOLVED]: 3,
        [TicketStatus.CLOSED]: 1,
      },

      byPriority: {
        [TicketPriority.LOW]: 2,
        [TicketPriority.MEDIUM]: 4,
        [TicketPriority.HIGH]: 3,
        [TicketPriority.URGENT]: 1,
      },

      unassignedTickets: 2,
    });

    expect(ticketAccessServiceMock.buildVisibilityWhere).toHaveBeenCalledWith(
      customerUser,
    );

    expect(prismaMock.ticket.count).toHaveBeenCalledTimes(11);

    expect(prismaMock.ticket.count).toHaveBeenNthCalledWith(1, {
      where: visibilityWhere,
    });

    expect(prismaMock.ticket.count).toHaveBeenNthCalledWith(2, {
      where: {
        AND: [visibilityWhere, { status: TicketStatus.OPEN }],
      },
    });

    expect(prismaMock.ticket.count).toHaveBeenNthCalledWith(7, {
      where: {
        AND: [visibilityWhere, { priority: TicketPriority.LOW }],
      },
    });

    expect(prismaMock.ticket.count).toHaveBeenNthCalledWith(11, {
      where: {
        AND: [visibilityWhere, { assigneeId: null }],
      },
    });
  });
});
