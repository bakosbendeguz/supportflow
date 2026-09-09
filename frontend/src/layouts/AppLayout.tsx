import type { ReactNode } from "react";
import { useAuth } from "../features/auth/auth.context";
import { Link } from "react-router";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-lg font-semibold text-slate-900">SupportFlow</p>

          <nav className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>

            <Link
              to="/tickets"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Tickets
            </Link>

            <Link
              to="/tickets/new"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              New ticket
            </Link>
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-600">
                {user.email} · {user.role}
              </p>
              <button
                className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
