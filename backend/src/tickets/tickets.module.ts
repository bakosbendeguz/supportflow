import { Module } from '@nestjs/common';
import { TicketAccessService } from './ticket-access.service';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, TicketAccessService],
  exports: [TicketAccessService],
})
export class TicketsModule {}
