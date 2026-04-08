import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1)
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
