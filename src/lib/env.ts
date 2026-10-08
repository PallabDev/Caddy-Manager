import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET is required (minimum 16 characters)"),
  BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  CADDY_MANAGER_DOMAIN: z.string().min(1, "CADDY_MANAGER_DOMAIN is required"),
  CADDY_MANAGER_PORT: z.string().min(1, "CADDY_MANAGER_PORT is required"),
  CADDY_MANAGER_USER_EMAIL: z.string().email("CADDY_MANAGER_USER_EMAIL must be a valid email"),
  SERVER_PUBLIC_IP: z.string().min(1, "SERVER_PUBLIC_IP is required"),
  CADDY_ADMIN_API_URL: z.string().min(1, "CADDY_ADMIN_API_URL is required"),
  CADDY_CONFIG_PATH: z.string().min(1, "CADDY_CONFIG_PATH is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" ||
  Boolean(process.env.SKIP_ENV_VALIDATION);

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  if (isBuild) {
    console.warn("⚠️ [Build Phase] Skipping strict env validation during next build static phase.");
  } else {
    console.error("\n❌ ========================================================");
    console.error("❌ CRITICAL: Missing or invalid required environment variables!");
    console.error("❌ Every required value must be present in .env to start the server.");
    console.error("❌ ========================================================\n");
    console.error(JSON.stringify(parsed.error.format(), null, 2));

    const missingKeys = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
    throw new Error(`CRITICAL: Server startup aborted. Missing or invalid required variables: [${missingKeys}]`);
  }
}

export const env = (parsed.success ? parsed.data : process.env) as z.infer<typeof envSchema>;
