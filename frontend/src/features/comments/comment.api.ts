import { API_BASE_URL, getAuthHeaders } from "../../lib/api";
import type { TicketComment } from "./comment.types";
import type { CreateCommentFormValues } from "./create-comment.schema";

export async function getTicketComments(
  ticketId: string,
): Promise<TicketComment[]> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load comments.");
  }

  const data = (await response.json()) as TicketComment[];
  return data;
}

export async function createTicketComment(
  ticketId: string,
  values: CreateCommentFormValues,
): Promise<TicketComment> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment.");
  }

  const data = (await response.json()) as TicketComment;
  return data;
}
