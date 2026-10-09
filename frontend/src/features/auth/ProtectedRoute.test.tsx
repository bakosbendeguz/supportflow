import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "./auth.context";

vi.mock("./auth.context", () => ({
  useAuth: vi.fn(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirects unauthenticated users to login", async () => {
    vi.mocked(useAuth).mockReturnValue({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuthFromLogin: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <h1>Protected content</h1>
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<h1>Login test route</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.getByRole("heading", { name: "Login test route" }),
    ).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      token: null,
      user: null,
      isAuthenticated: true,
      setAuthFromLogin: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <h1>Protected content</h1>
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<h1>Login test route</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Protected content" }),
    ).toBeInTheDocument();
  });
});
