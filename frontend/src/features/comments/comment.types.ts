import type { TicketUser } from "../tickets/ticket.types";

export type TicketComment = {
  id: string;
  message: string;
  author: TicketUser;
  createdAt: string;
  updatedAt: string;
};
