import { API_BASE_URL, getAuthHeaders } from "../../lib/api";
import type { DashboardSummary } from "./dashboard.types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load dashboard summary.");
  }

  const data = (await response.json()) as DashboardSummary;
  return data;
}
