import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("provides a working Sign in navigation path", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<h1>Login test route</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "SupportFlow" }),
    ).toBeInTheDocument();

    const signInLink = screen.getByRole("link", { name: "Sign in" });
    expect(signInLink).toHaveAttribute("href", "/login");

    await user.click(signInLink);

    expect(
      await screen.findByRole("heading", { name: "Login test route" }),
    ).toBeInTheDocument();
  });
});
