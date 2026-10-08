"use server";

import { revalidatePath } from "next/cache";
import { requireAuthUser } from "@/server/auth.helper";
import { domainService } from "@/server/services/domain.service";
import { createDomainSchema, type CreateDomainInput } from "../schemas/domain.schema";
import { logger } from "@/lib/logger";

export async function getDomainsAction() {
  try {
    const user = await requireAuthUser();
    const list = await domainService.getDomainsForUser(user);
    return { success: true, data: list, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load domains";
    logger.error("Error in getDomainsAction", { error: message });
    return { success: false, error: message };
  }
}

export async function addDomainAction(input: CreateDomainInput) {
  try {
    const user = await requireAuthUser();
    const parsed = createDomainSchema.safeParse(input);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Validation failed";
      return { success: false, error: issue };
    }

    const domain = await domainService.createDomain(user, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/domains");

    return { success: true, data: domain };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add domain";
    logger.warn("Domain creation rejected", { error: message });
    return { success: false, error: message };
  }
}

export async function deleteDomainAction(domainId: string) {
  try {
    const user = await requireAuthUser();
    const result = await domainService.deleteDomain(user, domainId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/domains");
    return { success: true, message: result.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete domain";
    logger.error("Error in deleteDomainAction", { domainId, error: message });
    return { success: false, error: message };
  }
}

export async function checkDomainAction(domainId: string) {
  try {
    await requireAuthUser();
    const result = await domainService.checkDomainStatus(domainId);
    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check domain status";
    logger.error("Error in checkDomainAction", { domainId, error: message });
    return { success: false, error: message };
  }
}
