import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketAccessService {
  constructor(private readonly prisma: PrismaService) {}

  buildVisibilityWhere(
    user: AuthenticatedUser,
    options?: { includeUnassigned?: boolean },
  ): Prisma.TicketWhereInput {
    if (user.role === Role.ADMIN) {
      return {};
    }

    if (user.role === Role.AGENT) {
      const includeUnassigned = options?.includeUnassigned ?? true;

      if (!includeUnassigned) {
        return {
          assigneeId: user.id,
        };
      }

      return {
        OR: [{ assigneeId: user.id }, { assigneeId: null }],
      };
    }

    return {
      customerId: user.id,
    };
  }

  async findAccessibleTicketOrThrow(
    id: string,
    user: AuthenticatedUser,
  ): Promise<Prisma.TicketGetPayload<object>> {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        AND: [{ id }, this.buildVisibilityWhere(user)],
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    return ticket;
  }
}
