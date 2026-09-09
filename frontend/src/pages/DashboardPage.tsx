import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../features/dashboard/dashboard.api";

export function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  if (summaryQuery.isLoading) {
    return <section>Loading dashboard...</section>;
  }

  if (summaryQuery.isError) {
    return <section>Failed to load dashboard.</section>;
  }

  const summary = summaryQuery.data;

  if (!summary) {
    return <section>No dashboard data.</section>;
  }

  return (
    <section className="flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total tickets</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary.totalTickets}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Open tickets</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary.byStatus.OPEN}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">
              Unassigned tickets
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary.unassignedTickets}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Urgent tickets</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary.byPriority.URGENT}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
