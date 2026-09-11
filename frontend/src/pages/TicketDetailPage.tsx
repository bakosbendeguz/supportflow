import { useParams } from "react-router";
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
    <section>
      <h1>Ticket detail</h1>
      <h1>{loadedTicket.title}</h1>
      <p>Ticket ID: {ticketId}</p>
      <p>Ticket status: {loadedTicket.status}</p>
      <form onSubmit={onSubmitStatus}>
        <label>Status</label>
        <select
          defaultValue={loadedTicket.status}
          onChange={(event) => {
            setSelectedStatus(event.target.value as TicketStatus);
          }}
        >
          {ticketStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button type="submit" disabled={updateStatusMutation.isPending}>
          {updateStatusMutation.isPending ? "Updating..." : "Update status"}
        </button>

        {updateStatusMutation.isError ? <p>Failed to update status.</p> : null}
      </form>
      <p>Ticket priority: {ticket.priority}</p>
      <p>Ticket description: {ticket.description}</p>

      <section>
        <h2>Comments</h2>

        {commentsQuery.isLoading ? <p>Loading comments...</p> : null}

        {commentsQuery.isError ? <p>Failed to load comments.</p> : null}

        {!commentsQuery.isLoading &&
        !commentsQuery.isError &&
        comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : null}

        {!commentsQuery.isLoading &&
        !commentsQuery.isError &&
        comments.length > 0 ? (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <p>{comment.message}</p>
                <p>By {comment.author.name}</p>
              </li>
            ))}
          </ul>
        ) : null}

        <form onSubmit={handleSubmit(onSubmitComment)}>
          <div>
            <label>Comment</label>
            <textarea {...register("message")} />
            {errors.message ? <p>{errors.message.message}</p> : null}
          </div>

          <button type="submit" disabled={createCommentMutation.isPending}>
            {createCommentMutation.isPending ? "Adding..." : "Add comment"}
          </button>
          {createCommentMutation.isError ? <p>Failed to add comment.</p> : null}
        </form>
      </section>
    </section>
  );
}
