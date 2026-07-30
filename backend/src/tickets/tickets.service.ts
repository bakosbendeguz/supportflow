import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, TicketPriority, TicketStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketsQueryDto } from './dto/get-tickets-query.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

const ticketInclude = Prisma.validator<Prisma.TicketInclude>()({
  customer: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  },
  assignee: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  },
  comments: {
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
  },
  statusHistory: {
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      changedBy: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  },
});

type TicketWithRelations = Prisma.TicketGetPayload<{
  include: typeof ticketInclude;
}>;

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetTicketsQueryDto, user: AuthenticatedUser) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where = this.buildTicketWhere(query, user);

    const orderBy: Prisma.TicketOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          assignee: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          _count: {
            select: {
              comments: true,
              statusHistory: true,
            },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TicketWithRelations> {
    return this.findAccessibleTicket(id, user);
  }

  async create(
    createTicketDto: CreateTicketDto,
    user: AuthenticatedUser,
  ): Promise<TicketWithRelations> {
    if (createTicketDto.assigneeId && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only admins can assign tickets during creation.',
      );
    }

    if (createTicketDto.priority && user.role === Role.CUSTOMER) {
      throw new ForbiddenException('Customers cannot set ticket priority.');
    }

    await this.validateAssignee(createTicketDto.assigneeId);

    const createdTicket = await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          title: createTicketDto.title,
          description: createTicketDto.description,
          priority:
            user.role === Role.CUSTOMER
              ? TicketPriority.MEDIUM
              : (createTicketDto.priority ?? TicketPriority.MEDIUM),
          status: TicketStatus.OPEN,
          customerId: user.id,
          assigneeId: createTicketDto.assigneeId ?? null,
        },
      });

      await tx.ticketStatusHistory.create({
        data: {
          ticketId: ticket.id,
          oldStatus: null,
          newStatus: TicketStatus.OPEN,
          changedById: user.id,
        },
      });

      return ticket;
    });

    return this.findAccessibleTicket(createdTicket.id, user);
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    user: AuthenticatedUser,
  ): Promise<TicketWithRelations> {
    const existingTicket = await this.findAccessibleTicket(id, user);

    this.validateUpdatePermissions(existingTicket, updateTicketDto, user);
    await this.validateAssignee(updateTicketDto.assigneeId);

    const data: Prisma.TicketUncheckedUpdateInput = {};

    if (updateTicketDto.title !== undefined) {
      data.title = updateTicketDto.title;
    }

    if (updateTicketDto.description !== undefined) {
      data.description = updateTicketDto.description;
    }

    if (updateTicketDto.priority !== undefined) {
      data.priority = updateTicketDto.priority;
    }

    if (updateTicketDto.assigneeId !== undefined) {
      data.assigneeId = updateTicketDto.assigneeId;
    }

    await this.prisma.ticket.update({
      where: { id },
      data,
    });

    return this.findAccessibleTicket(id, user);
  }

  async updateStatus(
    id: string,
    updateTicketStatusDto: UpdateTicketStatusDto,
    user: AuthenticatedUser,
  ): Promise<TicketWithRelations> {
    if (user.role === Role.CUSTOMER) {
      throw new ForbiddenException('Customers cannot update ticket status.');
    }

    const existingTicket = await this.findAccessibleTicket(id, user);

    if (existingTicket.status === updateTicketStatusDto.status) {
      return existingTicket;
    }

    await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: {
          status: updateTicketStatusDto.status,
        },
      }),
      this.prisma.ticketStatusHistory.create({
        data: {
          ticketId: id,
          oldStatus: existingTicket.status,
          newStatus: updateTicketStatusDto.status,
          changedById: user.id,
        },
      }),
    ]);

    return this.findAccessibleTicket(id, user);
  }

  async remove(id: string, user: AuthenticatedUser) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete tickets.');
    }

    await this.findAccessibleTicket(id, user);

    await this.prisma.ticket.delete({
      where: { id },
    });

    return {
      message: 'Ticket deleted successfully.',
      id,
    };
  }

  private buildTicketWhere(
    query: GetTicketsQueryDto,
    user: AuthenticatedUser,
  ): Prisma.TicketWhereInput {
    const andConditions: Prisma.TicketWhereInput[] = [
      this.buildVisibilityWhere(user, query),
    ];

    if (query.search) {
      andConditions.push({
        OR: [
          {
            title: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (query.status) {
      andConditions.push({
        status: query.status,
      });
    }

    if (query.priority) {
      andConditions.push({
        priority: query.priority,
      });
    }

    if (query.assigneeId) {
      andConditions.push({
        assigneeId: query.assigneeId === 'unassigned' ? null : query.assigneeId,
      });
    }

    return {
      AND: andConditions,
    };
  }

  private buildVisibilityWhere(
    user: AuthenticatedUser,
    query?: GetTicketsQueryDto,
  ): Prisma.TicketWhereInput {
    if (user.role === Role.ADMIN) {
      return {};
    }

    if (user.role === Role.AGENT) {
      const includeUnassigned = query?.includeUnassigned ?? true;

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

  private async findAccessibleTicket(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TicketWithRelations> {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        AND: [
          {
            id,
          },
          this.buildVisibilityWhere(user),
        ],
      },
      include: ticketInclude,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket bot found.');
    }

    return ticket;
  }

  private async validateAssignee(assigneeId?: string | null) {
    if (!assigneeId) {
      return;
    }

    const assignee = await this.prisma.user.findUnique({
      where: {
        id: assigneeId,
      },
    });

    if (!assignee || assignee.role !== Role.AGENT) {
      throw new BadRequestException('Assignee must be an existing agent.');
    }
  }

  private validateUpdatePermissions(
    ticket: TicketWithRelations,
    updateTicketDto: UpdateTicketDto,
    user: AuthenticatedUser,
  ) {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.CUSTOMER) {
      if (updateTicketDto.priority !== undefined) {
        throw new ForbiddenException(
          'Customers cannot update ticket priority.',
        );
      }

      if (updateTicketDto.assigneeId !== undefined) {
        throw new ForbiddenException('Customers cannot assign tickets.');
      }

      return;
    }

    if (user.role === Role.AGENT) {
      if (updateTicketDto.assigneeId === undefined) {
        return;
      }

      if (
        ticket.assigneeId === null &&
        updateTicketDto.assigneeId === user.id
      ) {
        return;
      }

      throw new ForbiddenException(
        'Agents can only assign unassigned tickets to themselves.',
      );
    }
  }
}
