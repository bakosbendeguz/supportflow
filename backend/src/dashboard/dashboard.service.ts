import { Injectable } from '@nestjs/common';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { TicketAccessService } from '../tickets/ticket-access.service';

const ticketStatuses: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
  TicketStatus.WAITING_FOR_CUSTOMER,
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
];

const ticketPriorities: TicketPriority[] = [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.URGENT,
];

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketAccessService: TicketAccessService,
  ) {}

  async getSummary(user: AuthenticatedUser) {
    const visibilityWhere = this.ticketAccessService.buildVisibilityWhere(user);

    // TODO 1:
    // Count all visible tickets.
    const totalTickets = await this.prisma.ticket.count({
      where: visibilityWhere,
    });

    // TODO 2:
    // Count visible tickets for each status.
    const statusCounts = await Promise.all(
      ticketStatuses.map(async (status) => {
        const count = await this.prisma.ticket.count({
          where: {
            AND: [visibilityWhere, { status }],
          },
        });

        return [status, count] as const;
      }),
    );

    const byStatus = Object.fromEntries(statusCounts) as Record<
      TicketStatus,
      number
    >;

    // TODO 3:
    // Count visible tickets for each priority.
    const priorityCounts = await Promise.all(
      ticketPriorities.map(async (priority) => {
        const count = await this.prisma.ticket.count({
          where: {
            AND: [visibilityWhere, { priority }],
          },
        });

        return [priority, count] as const;
      }),
    );

    const byPriority = Object.fromEntries(priorityCounts) as Record<
      TicketPriority,
      number
    >;
    // TODO 4:
    // Count visible unassigned tickets.
    const unassignedTickets = await this.prisma.ticket.count({
      where: {
        AND: [visibilityWhere, { assigneeId: null }],
      },
    });

    // TODO 5:
    // Return the dashboard object.

    return {
      totalTickets,
      byStatus,
      byPriority,
      unassignedTickets,
    };
  }
}
