import { API_BASE_URL, getAuthHeaders } from "../../lib/api";
import type {
  TicketListResponse,
  TicketDetail,
  TicketStatus,
} from "./ticket.types";
import type { CreateTicketFormValues } from "./create-ticket.schema";

export async function getTickets(): Promise<TicketListResponse> {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load tickets.");
  }

  const data = (await response.json()) as TicketListResponse;
  return data;
}

export async function getTicketById(ticketId: string): Promise<TicketDetail> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load ticket.");
  }

  const data = (await response.json()) as TicketDetail;
  return data;
}

export async function createTicket(
  values: CreateTicketFormValues,
): Promise<TicketDetail> {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Failed to create ticket.");
  }

  const data = (await response.json()) as TicketDetail;
  return data;
}

export async function updateTicketAssignee(
  ticketId: string,
  assigneeId: string | null,
): Promise<TicketDetail> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ assigneeId }),
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket assignment.");
  }

  const data = (await response.json()) as TicketDetail;
  return data;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<TicketDetail> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket status.");
  }

  const data = (await response.json()) as TicketDetail;
  return data;
}
