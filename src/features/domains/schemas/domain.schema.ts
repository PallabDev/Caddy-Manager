import { z } from "zod";

const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

export const createDomainSchema = z.object({
  username: z.string().min(1, "Username is required").max(60, "Username too long"),
  domain: z
    .string()
    .min(3, "Domain must be at least 3 characters")
    .max(253, "Domain is too long")
    .refine((val) => domainRegex.test(val.trim()), {
      message: "Please enter a valid domain format (e.g., app.example.com or example.com)",
    }),
  port: z.coerce
    .number()
    .int("Port must be an integer")
    .min(1, "Port must be at least 1")
    .max(65535, "Port cannot exceed 65535"),
});

export type CreateDomainInput = z.infer<typeof createDomainSchema>;
