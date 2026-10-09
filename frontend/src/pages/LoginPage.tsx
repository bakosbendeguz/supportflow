import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { loginSchema } from "../features/auth/login.schema";
import type { LoginFormValues } from "../features/auth/login.schema";
import { login } from "../features/auth/auth.api";
import { useAuth } from "../features/auth/auth.context";
import { Navigate, useNavigate } from "react-router";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { setAuthFromLogin, isAuthenticated } = useAuth();

  const [loginError, setLoginError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function onSubmit(values: LoginFormValues) {
    setLoginError(null);

    try {
      const response = await login(values);
      setAuthFromLogin(response);
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
        return;
      }

      setLoginError("Login failed.");
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">Login</h1>
          <p className="mt-3 text-slate-600">Sign in to SupportFlow.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {loginError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {loginError}
            </p>
          ) : null}

          <button
            className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
