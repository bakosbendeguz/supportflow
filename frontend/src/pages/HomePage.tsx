import { Link } from "react-router";

export function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-slate-900">SupportFlow</h1>

        <p className="mt-3 text-lg text-slate-600">
          Mini helpdesk and ticketing SaaS.
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          Explore role-based ticket management, comments, status history, and
          dashboard statistics using the seeded demo accounts.
        </p>

        <div className="mt-8">
          <Link
            to="/login"
            className="inline-flex rounded-md bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-700"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
