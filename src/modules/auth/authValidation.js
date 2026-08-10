import { z } from "zod";

export const signUpSchema = z.object({
  username: z.string().min(3, "username must have atleast 3 characters"),
  password: z
    .string()
    .min(8, "password must have atleast 8 characters")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "password must be contains numbers, lowercase and uppercase letters",
    ),
  email: z.email("please enter your email"),
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});
