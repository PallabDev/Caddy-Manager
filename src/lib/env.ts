import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://ServerCaddy:password@localhost:5432/caddy_manager"),
  BETTER_AUTH_SECRET: z.string().default("caddy_manager_super_secret_auth_token_key_32_bytes_long"),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  CADDY_MANAGER_DOMAIN: z.string().default("localhost"),
  CADDY_MANAGER_PORT: z.string().default("3000"),
  CADDY_MANAGER_USER_EMAIL: z.string().default("admin@example.com"),
  SERVER_PUBLIC_IP: z.string().default("127.0.0.1"),
  CADDY_ADMIN_API_URL: z.string().default("http://localhost:2019"),
  CADDY_CONFIG_PATH: z.string().default("./caddy/Caddyfile"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
}

export const env = parsed.success
  ? parsed.data
  : {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://ServerCaddy:password@localhost:5432/caddy_manager",
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "caddy_manager_super_secret_auth_token_key_32_bytes_long",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
      CADDY_MANAGER_DOMAIN: process.env.CADDY_MANAGER_DOMAIN || "localhost",
      CADDY_MANAGER_PORT: process.env.CADDY_MANAGER_PORT || "3000",
      CADDY_MANAGER_USER_EMAIL: process.env.CADDY_MANAGER_USER_EMAIL || "admin@example.com",
      SERVER_PUBLIC_IP: process.env.SERVER_PUBLIC_IP || "127.0.0.1",
      CADDY_ADMIN_API_URL: process.env.CADDY_ADMIN_API_URL || "http://localhost:2019",
      CADDY_CONFIG_PATH: process.env.CADDY_CONFIG_PATH || "./caddy/Caddyfile",
      NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
    };
