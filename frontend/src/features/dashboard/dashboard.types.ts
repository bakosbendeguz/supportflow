import type { TicketStatus, TicketPriority } from "../tickets/ticket.types";

export type DashboardSummary = {
  totalTickets: number;
  unassignedTickets: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
};
