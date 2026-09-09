import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "../features/tickets/ticket.api";

export function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId;

  const ticketQuery = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => {
      if (!ticketId) {
        throw new Error("Missing ticket id.");
      }

      return getTicketById(ticketId);
    },
    enabled: Boolean(ticketId),
  });

  if (!ticketId) {
    return (
      <section>
        <p>Missing ticket id.</p>
      </section>
    );
  }

  if (ticketQuery.isLoading) {
    return <section>Loading ticket...</section>;
  }

  if (ticketQuery.isError) {
    return <section>Failed to load ticket.</section>;
  }

  const ticket = ticketQuery.data;

  if (!ticket) {
    return <section>No ticket data.</section>;
  }

  return (
    <section>
      <h1>Ticket detail</h1>
      <h1>{ticket.title}</h1>
      <p>Ticket ID: {ticketId}</p>
      <p>Ticket status: {ticket.status}</p>
      <p>Ticket priority: {ticket.priority}</p>
      <p>Ticket description: {ticket.description}</p>
    </section>
  );
}
