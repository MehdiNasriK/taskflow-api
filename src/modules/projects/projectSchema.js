import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().max(50),
});
