import { z } from "zod";

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Please enter a ticket title.")
    .min(3, "Title must be at least 3 characters."),

  description: z
    .string()
    .trim()
    .min(1, "Please enter a ticket description.")
    .min(10, "Description must be at least 10 characters."),
});

export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;
