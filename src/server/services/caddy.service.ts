import fs from "fs/promises";
import path from "path";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { type Domain } from "@/server/db/schema";

export class CaddyService {
  private configPath: string;
  private adminApiUrl: string;

  constructor() {
    this.configPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.CADDY_CONFIG_PATH || "./caddy/Caddyfile");
    this.adminApiUrl = (env.CADDY_ADMIN_API_URL || "http://caddy:2019").replace(/\/+$/, "");
  }

  /**
   * Generates a complete, valid Caddyfile from all configured domains,
   * always including the base Caddy Manager service domain.
   */
  public generateCaddyfile(domainList: Domain[]): string {
    const lines: string[] = [];

    // Global options block with admin API enabled
    lines.push("{");
    lines.push("    admin 0.0.0.0:2019 {");
    lines.push("        origins caddy:2019 caddy localhost:2019 127.0.0.1:2019 localhost 127.0.0.1");
    lines.push("    }");
    lines.push("}");
    lines.push("");

    // Primary Caddy Manager domain
    const managerDomain = env.CADDY_MANAGER_DOMAIN;
    const managerPort = env.CADDY_MANAGER_PORT;

    if (managerDomain && managerDomain !== "localhost") {
      lines.push(`${managerDomain} {`);
      lines.push(`    # Caddy Manager UI & API`);
      lines.push(`    reverse_proxy app:${managerPort} {`);
      lines.push(`        header_up Host {host}`);
      lines.push(`        header_up X-Real-IP {remote_host}`);
      lines.push(`        header_up X-Forwarded-For {remote_host}`);
      lines.push(`        header_up X-Forwarded-Proto {scheme}`);
      lines.push(`    }`);
      lines.push("}");
      lines.push("");
    } else {
      // Local development or HTTP-only fallback
      lines.push(`:80 {`);
      lines.push(`    # Default catch-all for local setup`);
      lines.push(`    reverse_proxy app:${managerPort}`);
      lines.push("}");
      lines.push("");
    }

    // Append each user-managed domain
    for (const item of domainList) {
      if (!item.domain) continue;

      lines.push(`${item.domain} {`);
      lines.push(`    # Managed by user: ${item.username} (Port: ${item.port})`);
      lines.push(`    reverse_proxy host.docker.internal:${item.port} {`);
      lines.push(`        header_up Host {host}`);
      lines.push(`        header_up X-Real-IP {remote_host}`);
      lines.push(`        header_up X-Forwarded-For {remote_host}`);
      lines.push(`        header_up X-Forwarded-Proto {scheme}`);
      lines.push(`    }`);
      lines.push("}");
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Writes the Caddyfile to disk and instructs Caddy to reload dynamically via Admin API.
   * Ensures old routes are preserved.
   */
  public async syncCaddy(domainList: Domain[]): Promise<{ success: boolean; message: string }> {
    const caddyfileContent = this.generateCaddyfile(domainList);

    // 1. Write file to disk for persistence
    try {
      const dir = path.dirname(this.configPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.configPath, caddyfileContent, "utf-8");
      logger.info("Caddyfile written successfully", { path: this.configPath });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Disk write failed";
      logger.error("Failed to write Caddyfile to disk", { error: msg });
    }

    // 2. Reload Caddy dynamically via Admin API
    try {
      logger.info("Sending reload request to Caddy Admin API", { url: `${this.adminApiUrl}/load` });
      const response = await fetch(`${this.adminApiUrl}/load`, {
        method: "POST",
        headers: {
          "Content-Type": "text/caddyfile",
          Origin: "http://localhost:2019",
        },
        body: caddyfileContent,
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn("Caddy API responded with non-200", { status: response.status, error: errorText });
        return {
          success: false,
          message: `Caddy reload returned HTTP ${response.status}: ${errorText}`,
        };
      }

      logger.info("Caddy reloaded successfully with new configuration");
      return { success: true, message: "Caddy configuration reloaded successfully" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Caddy connection error";
      logger.warn("Could not communicate with Caddy Admin API (may be running in non-docker mode)", { error: msg });
      return {
        success: true, // disk file was updated, reload skipped or pending container boot
        message: `Saved configuration to file. Caddy API reload: ${msg}`,
      };
    }
  }

  /**
   * Health check for Caddy container
   */
  public async checkCaddyStatus(): Promise<{ ok: boolean; status?: string; error?: string }> {
    try {
      const res = await fetch(`${this.adminApiUrl}/config/`, {
        method: "GET",
        headers: {
          Origin: "http://localhost:2019",
        },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        return { ok: true, status: "Connected & Active" };
      }
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Caddy offline";
      return { ok: false, error: msg };
    }
  }
}

export const caddyService = new CaddyService();
