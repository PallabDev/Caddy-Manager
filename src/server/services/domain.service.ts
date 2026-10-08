import { randomUUID } from "crypto";
import { domainRepository } from "@/server/repositories/domain.repository";
import { caddyService } from "@/server/services/caddy.service";
import { dnsService, type DomainCheckResult } from "@/server/services/dns.service";
import { type Domain, type User } from "@/server/db/schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface CreateDomainDTO {
  username: string;
  domain: string;
  port: number;
}

export class DomainService {
  /**
   * Retrieves domains based on user role.
   * Admins see all domains; regular users see only their own.
   */
  async getDomainsForUser(user: User): Promise<Domain[]> {
    if (user.admin) {
      return await domainRepository.findAll();
    }
    return await domainRepository.findByUserId(user.id);
  }

  async getDomainById(id: string): Promise<Domain | undefined> {
    return await domainRepository.findById(id);
  }

  /**
   * Adds a new domain with port collision checks and Caddyfile synchronization.
   */
  async createDomain(user: User, data: CreateDomainDTO): Promise<Domain> {
    const cleanDomain = data.domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const port = Number(data.port);

    if (!cleanDomain || cleanDomain.length < 3) {
      throw new Error("Invalid domain name specified.");
    }

    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error("Port must be a valid integer between 1 and 65535.");
    }

    // Constraint 1: Check whether that port is already occupied
    const existingPort = await domainRepository.findByPort(port);
    if (existingPort) {
      throw new Error(`Port ${port} is already occupied by domain '${existingPort.domain}'.`);
    }

    // Constraint 2: Check whether that domain is already registered
    const existingDomain = await domainRepository.findByDomain(cleanDomain);
    if (existingDomain) {
      throw new Error(`Domain '${cleanDomain}' is already registered in the system.`);
    }

    const newDomainId = randomUUID();
    const created = await domainRepository.create({
      id: newDomainId,
      userId: user.id,
      username: data.username.trim() || user.username || user.name,
      domain: cleanDomain,
      port,
      targetIp: env.SERVER_PUBLIC_IP,
      status: "pending_dns",
      dnsConfigured: false,
      sslActive: false,
    });

    // Synchronize Caddy without dropping existing domains
    const allDomains = await domainRepository.findAll();
    await caddyService.syncCaddy(allDomains);

    logger.info("Successfully added domain and synchronized Caddy", {
      domainId: created.id,
      domain: created.domain,
      port: created.port,
      userId: user.id,
    });

    return created;
  }

  /**
   * Deletes a domain and refreshes Caddy routes.
   * Only the owner or an admin is permitted.
   */
  async deleteDomain(user: User, domainId: string): Promise<{ success: boolean; message: string }> {
    const domain = await domainRepository.findById(domainId);
    if (!domain) {
      throw new Error("Domain not found.");
    }

    // Authorization check
    if (!user.admin && domain.userId !== user.id) {
      throw new Error("Access denied: You do not have permission to delete this domain.");
    }

    await domainRepository.delete(domainId);

    // Refresh Caddy config
    const allDomains = await domainRepository.findAll();
    await caddyService.syncCaddy(allDomains);

    logger.info("Successfully removed domain and synchronized Caddy", {
      domainId,
      domain: domain.domain,
      deletedBy: user.id,
    });

    return { success: true, message: `Domain '${domain.domain}' removed successfully.` };
  }

  /**
   * Probes DNS and HTTP health, updates database record, and returns diagnostic results.
   */
  async checkDomainStatus(domainId: string): Promise<{ domain: Domain; diagnostics: DomainCheckResult }> {
    const domain = await domainRepository.findById(domainId);
    if (!domain) {
      throw new Error("Domain not found.");
    }

    const diagnostics = await dnsService.inspectDomain(domain.domain, domain.targetIp);
    const status = diagnostics.dnsConfigured ? "active" : "pending_dns";

    const updated = await domainRepository.updateCheckStatus(
      domain.id,
      status,
      diagnostics.dnsConfigured,
      diagnostics.sslActive,
      JSON.stringify(diagnostics)
    );

    return { domain: updated || domain, diagnostics };
  }
}

export const domainService = new DomainService();
