import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import { LoginPage } from "./LoginPage";
import { login } from "../features/auth/auth.api";
import { useAuth } from "../features/auth/auth.context";

vi.mock("../features/auth/auth.api", () => ({
  login: vi.fn(),
}));

vi.mock("../features/auth/auth.context", () => ({
  useAuth: vi.fn(),
}));

describe("LoginPage", () => {
  const setAuthFromLoginMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuthFromLogin: setAuthFromLoginMock,
      logout: vi.fn(),
    });
  });

  it("shows validation errors and does not call login for an empty form", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Password is required."),
    ).toBeInTheDocument();

    expect(login).not.toHaveBeenCalled();
  });

  it("submits valid credentials, stores auth data, and navigates to the dashboard", async () => {
    const user = userEvent.setup();

    const loginResponse = {
      accessToken: "fake-token",
      user: {
        id: "customer-1",
        email: "customer@example.com",
        name: "Customer User",
        role: "CUSTOMER" as const,
        createdAt: "2026-01-01T00:00:00.00Z",
        updatedAt: "2026-01-01T00:00:00.00Z",
      },
    };

    vi.mocked(login).mockResolvedValue(loginResponse);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<h1>Dashboard test route</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "customer@example.com");

    await user.type(screen.getByLabelText("Password"), "customer123");

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByRole("heading", {
        name: "Dashboard test route",
      }),
    ).toBeInTheDocument();

    expect(login).toHaveBeenCalledWith({
      email: "customer@example.com",
      password: "customer123",
    });

    expect(setAuthFromLoginMock).toHaveBeenCalledWith(loginResponse);
  });
});
