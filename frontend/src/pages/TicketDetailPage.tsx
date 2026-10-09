import { Link, useParams } from "react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getTicketById,
  updateTicketStatus,
} from "../features/tickets/ticket.api";
import { getTicketComments } from "../features/comments/comment.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCommentSchema,
  type CreateCommentFormValues,
} from "../features/comments/create-comment.schema";
import { createTicketComment } from "../features/comments/comment.api";
import type { TicketStatus } from "../features/tickets/ticket.types";
import { useState, type FormEvent } from "react";
import { useAuth } from "../features/auth/auth.context";

const ticketStatusOptions: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];

export function TicketDetailPage() {
  function onSubmitComment(values: CreateCommentFormValues) {
    createCommentMutation.mutate(values);
  }

  const params = useParams();
  const ticketId = params.ticketId;

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentFormValues>({
    resolver: zodResolver(createCommentSchema),
  });

  const ticketQuery = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => {
      if (!ticketId) {
        throw new Error("Missing ticket id.");
      }

      return getTicketById(ticketId);
    },
    enabled: Boolean(ticketId),
  });

  const canUpdateStatus = user?.role === "ADMIN" || user?.role === "AGENT";

  const commentsQuery = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: () => {
      if (!ticketId) {
        throw new Error("Missing ticket id.");
      }

      return getTicketComments(ticketId);
    },
    enabled: Boolean(ticketId),
  });

  const createCommentMutation = useMutation({
    mutationFn: (values: CreateCommentFormValues) => {
      if (!ticketId) {
        throw new Error("Cannot find ticket.");
      }
      return createTicketComment(ticketId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ticket-comments", ticketId],
      });
      reset();
    },
  });

  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(
    null,
  );

  const updateStatusMutation = useMutation({
    mutationFn: (status: TicketStatus) => {
      if (!ticketId) {
        throw new Error("Cannot find ticket.");
      }
      return updateTicketStatus(ticketId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  if (!ticketId) {
    return (
      <section>
        <p>Missing ticket id.</p>
      </section>
    );
  }

  if (ticketQuery.isLoading) {
    return <section>Loading ticket...</section>;
  }

  if (ticketQuery.isError) {
    return <section>Failed to load ticket.</section>;
  }

  const ticket = ticketQuery.data;
  const comments = commentsQuery.data ?? [];

  if (!ticket) {
    return <section>No ticket data.</section>;
  }

  const loadedTicket = ticket;

  function onSubmitStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const statusToSubmit = selectedStatus ?? loadedTicket.status;

    updateStatusMutation.mutate(statusToSubmit);
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <Link
          to="/tickets"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to tickets
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {loadedTicket.title}
            </h1>

            <p className="mt-1 text-xs text-slate-500">Ticket ID: {ticketId}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {loadedTicket.status.replaceAll("_", " ")}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {loadedTicket.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Description
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {loadedTicket.description}
            </p>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Comments</h2>

            <div className="mt-5">
              {commentsQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading comments...</p>
              ) : null}

              {commentsQuery.isError ? (
                <p className="text-sm text-red-600">Failed to load comments.</p>
              ) : null}

              {!commentsQuery.isLoading &&
              !commentsQuery.isError &&
              comments.length === 0 ? (
                <p className="text-sm text-slate-500">No comments yet.</p>
              ) : null}

              {!commentsQuery.isLoading &&
              !commentsQuery.isError &&
              comments.length > 0 ? (
                <ul className="space-y-3">
                  {comments.map((comment) => (
                    <li
                      key={comment.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="whitespace-pre-wrap text-sm text-slate-800">
                        {comment.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        By {comment.author.name}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <form
              onSubmit={handleSubmit(onSubmitComment)}
              className="mt-6 border-t border-slate-200 pt-6"
            >
              <div>
                <label
                  htmlFor="comment-message"
                  className="block text-sm font-medium text-slate-700"
                >
                  Add comment
                </label>

                <textarea
                  id="comment-message"
                  {...register("message")}
                  rows={4}
                  className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  placeholder="Write a comment..."
                />

                {errors.message ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.message.message}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={createCommentMutation.isPending}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {createCommentMutation.isPending
                    ? "Adding..."
                    : "Add comment"}
                </button>
              </div>

              {createCommentMutation.isError ? (
                <p className="mt-3 text-sm text-red-600">
                  Failed to add comment.
                </p>
              ) : null}
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Ticket details</h2>

            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {loadedTicket.status.replaceAll("_", " ")}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Priority</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {loadedTicket.priority}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Customer</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {loadedTicket.customer.name}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Assigned to</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {loadedTicket.assignee?.name ?? "Unassigned"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Status history
            </h2>

            <div className="mt-4 space-y-4">
              {ticket.statusHistory.map((history) => (
                <div
                  key={history.id}
                  className="border-l-2 border-slate-200 pl-4"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {history.oldStatus === null
                      ? history.newStatus.replaceAll("_", " ")
                      : `${history.oldStatus.replaceAll("_", " ")} → ${history.newStatus.replaceAll("_", " ")}`}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    By {history.changedBy.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(history.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {canUpdateStatus ? (
            <form
              onSubmit={onSubmitStatus}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold text-slate-900">Update status</h2>

              <label
                htmlFor="ticket-status"
                className="mt-4 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="ticket-status"
                defaultValue={loadedTicket.status}
                onChange={(event) => {
                  setSelectedStatus(event.target.value as TicketStatus);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {ticketStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={updateStatusMutation.isPending}
                className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {updateStatusMutation.isPending
                  ? "Updating..."
                  : "Update status"}
              </button>

              {updateStatusMutation.isError ? (
                <p className="mt-3 text-sm text-red-600">
                  Failed to update status.
                </p>
              ) : null}
            </form>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
