import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CreateTicketPage } from "./CreateTicketPage";
import { createTicket } from "../features/tickets/ticket.api";
import type { TicketDetail } from "../features/tickets/ticket.types";

vi.mock("../features/tickets/ticket.api", () => ({
  createTicket: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/tickets/new"]}>
        <Routes>
          <Route path="/tickets/new" element={<CreateTicketPage />} />
          <Route
            path="/tickets/:ticketId"
            element={<h1>Created ticket route</h1>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CreateTicketPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows validation errors for an empty form", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole("button", { name: "Create ticket" }));

    expect(
      await screen.findByText("Please enter a ticket title."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Please enter a ticket description."),
    ).toBeInTheDocument();

    expect(createTicket).not.toHaveBeenCalled();
  });

  it("creates a ticket and navigates to its details page", async () => {
    const user = userEvent.setup();

    const createdTicket: TicketDetail = {
      id: "ticket-1",
      title: "Cannot access reports",
      description: "The reports page returns an unexpected error.",
      status: "OPEN",
      priority: "MEDIUM",
      customer: {
        id: "customer-1",
        email: "customer@example.com",
        name: "Customer User",
        role: "CUSTOMER",
      },
      assignee: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      statusHistory: [],
    };

    vi.mocked(createTicket).mockResolvedValue(createdTicket);

    renderPage();

    await user.type(screen.getByLabelText("Title"), createdTicket.title);
    await user.type(
      screen.getByLabelText("Description"),
      createdTicket.description,
    );

    await user.click(screen.getByRole("button", { name: "Create ticket" }));

    expect(
      await screen.findByRole("heading", { name: "Created ticket route" }),
    ).toBeInTheDocument();

    expect(vi.mocked(createTicket).mock.calls[0]?.[0]).toEqual({
      title: createdTicket.title,
      description: createdTicket.description,
    });
  });

  it("shows an error when ticket creation fails", async () => {
    const user = userEvent.setup();

    vi.mocked(createTicket).mockRejectedValue(new Error("Request failed"));

    renderPage();

    await user.type(screen.getByLabelText("Title"), "Cannot access reports");
    await user.type(
      screen.getByLabelText("Description"),
      "The reports page returns an unexpected error.",
    );

    await user.click(screen.getByRole("button", { name: "Create ticket" }));

    expect(
      await screen.findByText("Failed to create ticket."),
    ).toBeInTheDocument();
  });
});
