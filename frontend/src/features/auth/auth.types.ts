export type Role = "ADMIN" | "AGENT" | "CUSTOMER";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};
