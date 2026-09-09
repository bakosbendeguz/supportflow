import { API_BASE_URL, getAuthHeaders } from "../../lib/api";
import type { TicketListResponse, TicketDetail } from "./ticket.types";
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
