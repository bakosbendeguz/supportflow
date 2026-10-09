import { useQuery } from "@tanstack/react-query";
import { getTickets } from "../features/tickets/ticket.api";
import { Link } from "react-router";

export function TicketsPage() {
  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets,
  });

  if (ticketsQuery.isLoading) {
    return (
      <section className="mx-auto max-w-5xl p-6">
        <p className="text-slate-600">Loading tickets...</p>
      </section>
    );
  }

  if (ticketsQuery.isError) {
    return (
      <section className="mx-auto max-w-5xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load tickets.
        </div>
      </section>
    );
  }

  const ticketsResponse = ticketsQuery.data;

  if (!ticketsResponse) {
    return (
      <section className="mx-auto max-w-5xl p-6">
        <p className="text-slate-600">No tickets data</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Total matching tickets: {ticketsResponse.meta.total}
          </p>
        </div>

        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          New ticket
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {ticketsResponse.items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-slate-900">No tickets found</p>
            <p className="mt-1 text-sm text-slate-500">
              Create a ticket to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {ticketsResponse.items.map((ticket) => (
              <li key={ticket.id} className="p-5 transition hover:bg-slate-50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="font-semibold text-slate-900 hover:text-slate-600"
                    >
                      {ticket.title}
                    </Link>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {ticket.description}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Customer: {ticket.customer.name} · Assigned to:{" "}
                      {ticket.assignee?.name ?? "Unassigned"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {ticket.status.replaceAll("_", " ")}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
