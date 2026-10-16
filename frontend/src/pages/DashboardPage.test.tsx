import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DashboardPage } from "./DashboardPage";
import { getDashboardSummary } from "../features/dashboard/dashboard.api";
import type { DashboardSummary } from "../features/dashboard/dashboard.types";

vi.mock("../features/dashboard/dashboard.api", () => ({
  getDashboardSummary: vi.fn(),
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
      <DashboardPage />
    </QueryClientProvider>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows a loading state", () => {
    vi.mocked(getDashboardSummary).mockImplementation(
      () => new Promise<DashboardSummary>(() => undefined),
    );

    renderPage();

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("shows an error state when the dashboard query fails", async () => {
    vi.mocked(getDashboardSummary).mockRejectedValue(
      new Error("Network error"),
    );

    renderPage();

    expect(
      await screen.findByText("Failed to load dashboard."),
    ).toBeInTheDocument();
  });

  it("renders dashboard statistics", async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue({
      totalTickets: 12,
      unassignedTickets: 3,
      byStatus: {
        OPEN: 4,
        IN_PROGRESS: 3,
        WAITING_FOR_CUSTOMER: 2,
        RESOLVED: 2,
        CLOSED: 1,
      },
      byPriority: {
        LOW: 2,
        MEDIUM: 5,
        HIGH: 4,
        URGENT: 1,
      },
    });

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Total tickets")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    expect(screen.getByText("Open tickets")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    expect(screen.getByText("Unassigned tickets")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("Urgent tickets")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
