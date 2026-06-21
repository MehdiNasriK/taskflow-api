import { z } from "zod";

export const taskSchema = z.object({
  description: z.string().max(200).optional(),
  title: z.string().max(50),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  dueDate: z.coerce.date().optional(),
});
