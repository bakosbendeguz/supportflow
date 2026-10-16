import { API_BASE_URL, getAuthHeaders } from "../../lib/api";
import type { TicketUser } from "../tickets/ticket.types";

export async function getAgents(): Promise<TicketUser[]> {
  const response = await fetch(`${API_BASE_URL}/users/agents`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load agents.");
  }

  return (await response.json()) as TicketUser[];
}
