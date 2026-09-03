import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser, LoginResponse } from "./auth.types";
import { AuthContext } from "./auth.context";
import type { AuthContextValue } from "./auth.context";
import {
  getStoredToken,
  getStoredUser,
  saveAuthData,
  clearAuthData,
} from "./auth.storage";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  function setAuthFromLogin(response: LoginResponse): void {
    saveAuthData(response);
    setToken(response.accessToken);
    setUser(response.user);
  }

  function logout(): void {
    clearAuthData();
    setToken(null);
    setUser(null);
  }

  const value: AuthContextValue = {
    token,
    user,
    isAuthenticated: token !== null,
    setAuthFromLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
