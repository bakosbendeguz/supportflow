import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TicketsPage } from "./TicketsPage";
import { getTickets } from "../features/tickets/ticket.api";
import type { TicketListResponse } from "../features/tickets/ticket.types";

vi.mock("../features/tickets/ticket.api", () => ({
  getTickets: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TicketsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TicketsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows a loading state while tickets are being loaded", () => {
    vi.mocked(getTickets).mockImplementation(
      () => new Promise<TicketListResponse>(() => undefined),
    );

    renderPage();

    expect(screen.getByText("Loading tickets...")).toBeInTheDocument();
  });

  it("shows an error state when loading tickets fails", async () => {
    vi.mocked(getTickets).mockRejectedValue(new Error("Network error"));

    renderPage();

    expect(
      await screen.findByText("Failed to load tickets."),
    ).toBeInTheDocument();
  });

  it("shows the empty state when no tickets are returned", async () => {
    vi.mocked(getTickets).mockResolvedValue({
      items: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });

    renderPage();

    expect(await screen.findByText("No tickets found")).toBeInTheDocument();
    expect(
      screen.getByText("Create a ticket to get started."),
    ).toBeInTheDocument();
  });

  it("renders tickets returned by a query", async () => {
    const ticketsResponse: TicketListResponse = {
      items: [
        {
          id: "ticket-1",
          title: "Cannot log in",
          description: "Login fails with an error",
          status: "OPEN",
          priority: "HIGH",
          customer: {
            id: "customer-1",
            email: "customer@example.com",
            name: "Customer User",
            role: "CUSTOMER",
          },
          assignee: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    vi.mocked(getTickets).mockResolvedValue(ticketsResponse);

    renderPage();

    expect(
      await screen.findByRole("link", {
        name: "Cannot log in",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Total matching tickets: 1")).toBeInTheDocument();
    expect(screen.getByText(/Assigned to:\s*Unassigned/)).toBeInTheDocument();
    expect(getTickets).toHaveBeenCalledTimes(1);
  });
});
