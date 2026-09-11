import { z } from "zod";

export const createCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Please enter a comment.")
    .min(3, "Comment must be at least 3 characters."),
});

export type CreateCommentFormValues = z.infer<typeof createCommentSchema>;
