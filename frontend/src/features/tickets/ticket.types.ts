import type { Role } from "../auth/auth.types";

export type TicketUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TicketListItem = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer: TicketUser;
  assignee: TicketUser | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TicketListResponse = {
  items: TicketListItem[];
  meta: TicketListMeta;
};

export type TicketStatusHistoryItem = {
  id: string;
  oldStatus: TicketStatus | null;
  newStatus: TicketStatus;
  createdAt: string;
  changedBy: TicketUser;
};

export type TicketDetail = TicketListItem & {
  statusHistory: TicketStatusHistoryItem[];
};
