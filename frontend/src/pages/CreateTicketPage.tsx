import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema } from "../features/tickets/create-ticket.schema";
import type { CreateTicketFormValues } from "../features/tickets/create-ticket.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTicket } from "../features/tickets/ticket.api";
import { Link, useNavigate } from "react-router";

export function CreateTicketPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
  });

  const createTicketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (createdTicket) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      navigate(`/tickets/${createdTicket.id}`);
    },
  });

  function onSubmit(values: CreateTicketFormValues) {
    createTicketMutation.mutate(values);
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <Link
          to="/tickets"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to tickets
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Create ticket
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Describe the issue and create a new support request.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="ticket-title"
            className="block text-sm font-medium text-slate-700"
          >
            Title
          </label>

          <input
            id="ticket-title"
            {...register("title")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="Brief summary of the issue"
          />

          {errors.title ? (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="ticket-description"
            className="block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="ticket-description"
            {...register("description")}
            rows={7}
            className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="Describe what happened and what you expected."
          />

          {errors.description ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        {createTicketMutation.isError ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Failed to create ticket.
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createTicketMutation.isPending}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {createTicketMutation.isPending ? "Creating..." : "Create ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}
