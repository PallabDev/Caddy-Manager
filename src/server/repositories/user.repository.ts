import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users, type User } from "@/server/db/schema";
import { logger } from "@/lib/logger";

export class UserRepository {
  async findAll(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async findById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);
    return result[0];
  }

  async updateAccess(id: string, isAccess: boolean): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ isAccess, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    logger.info("User access updated", { id, isAccess });
    return updated;
  }

  async updateAdmin(id: string, admin: boolean): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ admin, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    logger.info("User admin status updated", { id, admin });
    return updated;
  }

  async delete(id: string): Promise<User | undefined> {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
    logger.info("User deleted", { id });
    return deleted;
  }
}

export const userRepository = new UserRepository();
