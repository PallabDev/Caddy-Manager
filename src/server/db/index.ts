import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const connectionString = env.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode if using Supabase/PgBouncer, but standard for local postgres
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {},
});

export const db = drizzle(client, { schema });

export async function checkDbConnection(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await client`SELECT 1`;
    const latencyMs = Date.now() - start;
    return { ok: true, latencyMs };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Database health check failed", { error: message });
    return { ok: false, latencyMs: Date.now() - start, error: message };
  }
}
