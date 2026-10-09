import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

describe("frontend test setup", () => {
  it("renders content in the DOM", () => {
    render(<h1>SupportFlow</h1>);

    expect(
      screen.getByRole("heading", { name: "SupportFlow" }),
    ).toBeInTheDocument();
  });
});
