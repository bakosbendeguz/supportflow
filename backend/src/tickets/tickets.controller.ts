import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketsQueryDto } from './dto/get-tickets-query.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({
    summary: 'List tickets with role-based visibility, filters and pagination',
  })
  @ApiOkResponse({
    description: 'Tickets returned successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  findAll(
    @Query() query: GetTicketsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one ticket by id',
  })
  @ApiOkResponse({
    description: 'Ticket returned successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found or not visible to current user.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.findOne(id, user);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a ticket',
  })
  @ApiOkResponse({
    description: 'Ticket created successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  @ApiForbiddenResponse({
    description:
      'Current user is not allowed to set priority or assign tickets.',
  })
  create(
    @Body() CreateTicketDto: CreateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.create(CreateTicketDto, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a ticket',
  })
  @ApiOkResponse({
    description: 'Ticket updated successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  @ApiForbiddenResponse({
    description: 'Current user is not allowed to perform this ticket update.',
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found or not visible to current user.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.update(id, updateTicketDto, user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  @ApiOperation({
    summary: 'Update ticket status and write status history',
  })
  @ApiOkResponse({
    description: 'Ticket status updated successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  @ApiForbiddenResponse({
    description: 'Current user cannot update ticket status.',
  })
  @ApiNotFoundResponse({
    description: 'Tickets not found or not visible to current user.',
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.updateStatus(id, updateTicketStatusDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a ticket as admin',
  })
  @ApiOkResponse({
    description: 'Ticket deleted successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  @ApiForbiddenResponse({
    description: 'Only admins can delete tickets.',
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.remove(id, user);
  }
}
