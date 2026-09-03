import type { LoginFormValues } from "./login.schema";
import type { LoginResponse } from "./auth.types";
import { API_BASE_URL } from "../../lib/api";

export async function login(values: LoginFormValues): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };
    throw new Error(errorData.message ?? "Login failed");
  }

  const data = (await response.json()) as LoginResponse;
  return data;
}
