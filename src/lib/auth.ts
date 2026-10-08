import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { env } from "./env";
import { logger } from "./logger";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  user: {
    additionalFields: {
      isAccess: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      admin: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      username: {
        type: "string",
        required: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const isInitialAdmin =
            Boolean(env.CADDY_MANAGER_USER_EMAIL) &&
            user.email.toLowerCase() === env.CADDY_MANAGER_USER_EMAIL.toLowerCase();

          logger.info("Creating user in Better Auth", {
            email: user.email,
            isInitialAdmin,
          });

          return {
            data: {
              ...user,
              isAccess: isInitialAdmin ? true : false,
              admin: isInitialAdmin ? true : false,
              username: user.name || user.email.split("@")[0],
            },
          };
        },
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
