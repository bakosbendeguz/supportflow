import { useQuery } from "@tanstack/react-query";
import { getTickets } from "../features/tickets/ticket.api";
import { Link } from "react-router";

export function TicketsPage() {
  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets,
  });

  if (ticketsQuery.isLoading) {
    return <section>Loading tickets...</section>;
  }

  if (ticketsQuery.isError) {
    return <section>Failed to load tickets.</section>;
  }

  const ticketsResponse = ticketsQuery.data;

  if (!ticketsResponse) {
    return <section>No tickets data</section>;
  }

  return (
    <section>
      <h1>Tickets</h1>
      <p>Total matching tickets: {ticketsResponse.meta.total}</p>
      <ul>
        {ticketsResponse.items.map((ticket) => (
          <li key={ticket.id}>
            <p>
              <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
            </p>
            <p>
              {ticket.status} · {ticket.priority}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
