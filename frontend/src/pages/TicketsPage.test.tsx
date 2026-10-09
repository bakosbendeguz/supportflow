import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { getTickets } from "../features/tickets/ticket.api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TicketsPage } from "./TicketsPage";
import type { TicketListResponse } from "../features/tickets/ticket.types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

vi.mock("../features/tickets/ticket.api", () => ({
  getTickets: vi.fn(),
}));

describe("TicketsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
          createdAt: "2026-01-01T00:00:00.00Z",
          updatedAt: "2026-01-01T00:00:00.00Z",
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

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TicketsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("link", {
        name: "Cannot log in",
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Total matching tickets: 1"),
    ).toBeInTheDocument();

    expect(getTickets).toHaveBeenCalled();
  });
});
