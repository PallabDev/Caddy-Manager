import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { domains, type Domain, type NewDomain } from "@/server/db/schema";
import { logger } from "@/lib/logger";

export class DomainRepository {
  async findAll(): Promise<Domain[]> {
    return await db.select().from(domains).orderBy(domains.createdAt);
  }

  async findByUserId(userId: string): Promise<Domain[]> {
    return await db
      .select()
      .from(domains)
      .where(eq(domains.userId, userId))
      .orderBy(domains.createdAt);
  }

  async findById(id: string): Promise<Domain | undefined> {
    const result = await db.select().from(domains).where(eq(domains.id, id)).limit(1);
    return result[0];
  }

  async findByDomain(domain: string): Promise<Domain | undefined> {
    const result = await db
      .select()
      .from(domains)
      .where(eq(domains.domain, domain.toLowerCase().trim()))
      .limit(1);
    return result[0];
  }

  async findByPort(port: number): Promise<Domain | undefined> {
    const result = await db.select().from(domains).where(eq(domains.port, port)).limit(1);
    return result[0];
  }

  async create(data: NewDomain): Promise<Domain> {
    const [inserted] = await db
      .insert(domains)
      .values({
        ...data,
        domain: data.domain.toLowerCase().trim(),
      })
      .returning();
    logger.info("Domain created in repository", { id: inserted.id, domain: inserted.domain, port: inserted.port });
    return inserted;
  }

  async delete(id: string): Promise<Domain | undefined> {
    const [deleted] = await db.delete(domains).where(eq(domains.id, id)).returning();
    if (deleted) {
      logger.info("Domain deleted from repository", { id: deleted.id, domain: deleted.domain });
    }
    return deleted;
  }

  async updateCheckStatus(
    id: string,
    status: string,
    dnsConfigured: boolean,
    sslActive: boolean,
    lastCheckResult?: string
  ): Promise<Domain | undefined> {
    const [updated] = await db
      .update(domains)
      .set({
        status,
        dnsConfigured,
        sslActive,
        lastCheckResult: lastCheckResult || null,
        lastCheckedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(domains.id, id))
      .returning();
    return updated;
  }
}

export const domainRepository = new DomainRepository();
