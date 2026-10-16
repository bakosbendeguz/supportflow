import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TicketDetailPage } from "./TicketDetailPage";
import {
  getTicketById,
  updateTicketAssignee,
  updateTicketStatus,
} from "../features/tickets/ticket.api";
import {
  createTicketComment,
  getTicketComments,
} from "../features/comments/comment.api";
import { useAuth } from "../features/auth/auth.context";
import type { AuthUser } from "../features/auth/auth.types";
import type { TicketDetail } from "../features/tickets/ticket.types";
import { getAgents } from "../features/users/user.api";

vi.mock("../features/tickets/ticket.api", () => ({
  getTicketById: vi.fn(),
  updateTicketAssignee: vi.fn(),
  updateTicketStatus: vi.fn(),
}));

vi.mock("../features/comments/comment.api", () => ({
  getTicketComments: vi.fn(),
  createTicketComment: vi.fn(),
}));

vi.mock("../features/auth/auth.context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../features/users/user.api", () => ({
  getAgents: vi.fn(),
}));

const customer = {
  id: "customer-1",
  email: "customer@example.com",
  name: "Customer User",
  role: "CUSTOMER" as const,
};

const agent = {
  id: "agent-1",
  email: "agent@example.com",
  name: "Agent User",
  role: "AGENT" as const,
};

const baseTicket: TicketDetail = {
  id: "ticket-1",
  title: "Cannot log in",
  description: "Login fails with an unexpected error.",
  status: "OPEN",
  priority: "HIGH",
  customer,
  assignee: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  statusHistory: [
    {
      id: "history-1",
      oldStatus: null,
      newStatus: "OPEN",
      createdAt: "2026-01-01T00:00:00.000Z",
      changedBy: customer,
    },
  ],
};

function authUser(role: AuthUser["role"]): AuthUser {
  const id =
    role === "ADMIN" ? "admin-1" : role === "AGENT" ? "agent-1" : "customer-1";

  return {
    id,
    email: `${role.toLowerCase()}@example.com`,
    name: `${role} User`,
    role,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function mockAuth(role: AuthUser["role"]) {
  vi.mocked(useAuth).mockReturnValue({
    token: "fake-token",
    user: authUser(role),
    isAuthenticated: true,
    setAuthFromLogin: vi.fn(),
    logout: vi.fn(),
  });
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/tickets/ticket-1"]}>
        <Routes>
          <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TicketDetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAuth("AGENT");
    vi.mocked(getTicketComments).mockResolvedValue([]);
    vi.mocked(getAgents).mockResolvedValue([agent]);
  });

  it("shows a loading state while the ticket is loading", () => {
    vi.mocked(getTicketById).mockImplementation(
      () => new Promise<TicketDetail>(() => undefined),
    );

    renderPage();

    expect(screen.getByText("Loading ticket...")).toBeInTheDocument();
  });

  it("shows an error state when the ticket query fails", async () => {
    vi.mocked(getTicketById).mockRejectedValue(new Error("Network error"));

    renderPage();

    expect(
      await screen.findByText("Failed to load ticket."),
    ).toBeInTheDocument();
  });

  it("renders ticket details, status history, and comments", async () => {
    vi.mocked(getTicketById).mockResolvedValue(baseTicket);
    vi.mocked(getTicketComments).mockResolvedValue([
      {
        id: "comment-1",
        message: "I can reproduce the issue.",
        author: agent,
        createdAt: "2026-01-01T01:00:00.000Z",
        updatedAt: "2026-01-01T01:00:00.000Z",
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Cannot log in" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Login fails with an unexpected error."),
    ).toBeInTheDocument();

    expect(screen.getByText("I can reproduce the issue.")).toBeInTheDocument();
    expect(screen.getByText("By Agent User")).toBeInTheDocument();
    expect(screen.getAllByText("OPEN").length).toBeGreaterThan(0);
  });

  it("allows an admin to assign a ticket to an agent", async () => {
    const user = userEvent.setup();

    mockAuth("ADMIN");

    vi.mocked(getTicketById).mockResolvedValue(baseTicket);

    vi.mocked(updateTicketAssignee).mockResolvedValue({
      ...baseTicket,
      assignee: agent,
    });

    renderPage();

    const select = await screen.findByLabelText("Assign agent");

    await user.selectOptions(select, agent.id);

    await waitFor(() => {
      expect(updateTicketAssignee).toHaveBeenCalledWith("ticket-1", agent.id);
    });
  });

  it("allows an admin to unassign a ticket", async () => {
    const user = userEvent.setup();

    mockAuth("ADMIN");

    vi.mocked(getTicketById).mockResolvedValue({
      ...baseTicket,
      assignee: agent,
    });

    vi.mocked(updateTicketAssignee).mockResolvedValue(baseTicket);

    renderPage();

    const select = await screen.findByLabelText("Assign agent");

    await user.selectOptions(select, "");

    await waitFor(() => {
      expect(updateTicketAssignee).toHaveBeenCalledWith("ticket-1", null);
    });
  });

  it("allows an agent to assign an unassigned ticket to themselves", async () => {
    const user = userEvent.setup();

    vi.mocked(getTicketById).mockResolvedValue(baseTicket);
    vi.mocked(updateTicketAssignee).mockResolvedValue({
      ...baseTicket,
      assignee: agent,
    });

    renderPage();

    const assignButton = await screen.findByRole("button", {
      name: "Assign to me",
    });

    await user.click(assignButton);

    await waitFor(() => {
      expect(updateTicketAssignee).toHaveBeenCalledWith("ticket-1", "agent-1");
    });
  });

  it("allows an agent to update ticket status", async () => {
    const user = userEvent.setup();

    vi.mocked(getTicketById).mockResolvedValue({
      ...baseTicket,
      assignee: agent,
    });

    vi.mocked(updateTicketStatus).mockResolvedValue({
      ...baseTicket,
      assignee: agent,
      status: "IN_PROGRESS",
    });

    renderPage();

    await screen.findByRole("heading", { name: "Cannot log in" });

    await user.selectOptions(screen.getByLabelText("Status"), "IN_PROGRESS");

    await user.click(screen.getByRole("button", { name: "Update status" }));

    await waitFor(() => {
      expect(updateTicketStatus).toHaveBeenCalledWith(
        "ticket-1",
        "IN_PROGRESS",
      );
    });
  });

  it("hides assignment and status controls from customers", async () => {
    mockAuth("CUSTOMER");
    vi.mocked(getTicketById).mockResolvedValue(baseTicket);

    renderPage();

    await screen.findByRole("heading", { name: "Cannot log in" });

    expect(
      screen.queryByRole("button", { name: "Assign to me" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Update status" }),
    ).not.toBeInTheDocument();
  });

  it("does not show Assign to me when the ticket is already assigned", async () => {
    vi.mocked(getTicketById).mockResolvedValue({
      ...baseTicket,
      assignee: agent,
    });

    renderPage();

    await screen.findByRole("heading", { name: "Cannot log in" });

    expect(
      screen.queryByRole("button", { name: "Assign to me" }),
    ).not.toBeInTheDocument();
  });

  it("creates a comment", async () => {
    const user = userEvent.setup();

    vi.mocked(getTicketById).mockResolvedValue(baseTicket);

    vi.mocked(createTicketComment).mockResolvedValue({
      id: "comment-2",
      message: "Please check this additional detail.",
      author: agent,
      createdAt: "2026-01-01T02:00:00.000Z",
      updatedAt: "2026-01-01T02:00:00.000Z",
    });

    renderPage();

    await screen.findByRole("heading", { name: "Cannot log in" });

    await user.type(
      screen.getByLabelText("Add comment"),
      "Please check this additional detail.",
    );

    await user.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => {
      expect(createTicketComment).toHaveBeenCalledWith("ticket-1", {
        message: "Please check this additional detail.",
      });
    });
  });

  it("shows an error when comment creation fails", async () => {
    const user = userEvent.setup();

    vi.mocked(getTicketById).mockResolvedValue(baseTicket);
    vi.mocked(createTicketComment).mockRejectedValue(
      new Error("Request failed"),
    );

    renderPage();

    await screen.findByRole("heading", { name: "Cannot log in" });

    await user.type(screen.getByLabelText("Add comment"), "More details");
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(
      await screen.findByText("Failed to add comment."),
    ).toBeInTheDocument();
  });
});
