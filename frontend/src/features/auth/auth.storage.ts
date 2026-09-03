import type { AuthUser, LoginResponse } from "./auth.types";

const ACCESS_TOKEN_KEY = "supportflow_access_token";
const USER_KEY = "supportflow_user";

export function saveAuthData(response: LoginResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export function getStoredToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  return JSON.parse(storedUser) as AuthUser;
}

export function clearAuthData(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
