import { getStoredToken } from "../features/auth/auth.storage";

export const API_BASE_URL = "http://localhost:3000";

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();

  if (token !== null) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  return {};
}
