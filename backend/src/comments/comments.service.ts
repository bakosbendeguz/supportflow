import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { TicketAccessService } from '../tickets/ticket-access.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const safeAuthorSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketAccessService: TicketAccessService,
  ) {}

  async findAll(ticketId: string, user: AuthenticatedUser) {
    const ticket = await this.ticketAccessService.findAccessibleTicketOrThrow(
      ticketId,
      user,
    );

    const comments = await this.prisma.ticketComment.findMany({
      where: {
        ticketId: ticket.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: {
          select: safeAuthorSelect,
        },
      },
    });

    return comments;
  }

  async create(
    ticketId: string,
    createCommentDto: CreateCommentDto,
    user: AuthenticatedUser,
  ) {
    const ticket = await this.ticketAccessService.findAccessibleTicketOrThrow(
      ticketId,
      user,
    );

    const comment = await this.prisma.ticketComment.create({
      data: {
        message: createCommentDto.message,
        ticketId: ticket.id,
        authorId: user.id,
      },
      include: {
        author: {
          select: safeAuthorSelect,
        },
      },
    });

    return comment;
  }
}
