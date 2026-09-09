import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema } from "../features/tickets/create-ticket.schema";
import type { CreateTicketFormValues } from "../features/tickets/create-ticket.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTicket } from "../features/tickets/ticket.api";
import { useNavigate } from "react-router";

export function CreateTicketPage() {
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

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  function onSubmit(values: CreateTicketFormValues) {
    createTicketMutation.mutate(values);
  }

  return (
    <section>
      <h1>Create ticket</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Title</label>
          <input {...register("title")} />
          {errors.title ? <p>{errors.title.message}</p> : null}
        </div>

        <div>
          <label>Description</label>
          <textarea {...register("description")} />
          {errors.description ? <p>{errors.description?.message}</p> : null}
        </div>

        <button type="submit" disabled={createTicketMutation.isPending}>
          {createTicketMutation.isPending ? "Creating..." : "Create ticket"}
        </button>

        {createTicketMutation.isError ? <p>Failed to create ticket.</p> : null}
        {createTicketMutation.isSuccess ? <p>Ticket created.</p> : null}
      </form>
      <p>Ticket form will appear here.</p>
    </section>
  );
}
