import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { userRepository } from "@/server/repositories/user.repository";
import { type User } from "@/server/db/schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session || !session.user) {
      return null;
    }

    let user = await userRepository.findById(session.user.id);
    if (!user) {
      return null;
    }

    // Auto-promote initial bootstrap admin if configured
    if (
      env.CADDY_MANAGER_USER_EMAIL &&
      user.email.toLowerCase() === env.CADDY_MANAGER_USER_EMAIL.toLowerCase() &&
      (!user.isAccess || !user.admin)
    ) {
      logger.info("Auto-promoting bootstrap admin user", { email: user.email });
      await userRepository.updateAccess(user.id, true);
      await userRepository.updateAdmin(user.id, true);
      user = await userRepository.findById(user.id);
    }

    return user || null;
  } catch (error) {
    logger.error("Failed to resolve current session user", { error });
    return null;
  }
}

export async function requireAuthUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (!user.isAccess) {
    throw new Error("ACCESS_PENDING");
  }
  return user;
}

export async function requireAdminUser(): Promise<User> {
  const user = await requireAuthUser();
  if (!user.admin) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
