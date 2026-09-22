import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { CreateTicketPage } from "./pages/CreateTicketPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tickets",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <TicketsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/tickets/new",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <CreateTicketPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/tickets/:ticketId",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <TicketDetailPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
]);
