import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";

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
]);
