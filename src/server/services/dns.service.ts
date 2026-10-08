import dns from "dns/promises";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface DomainCheckResult {
  domain: string;
  targetIp: string;
  dnsConfigured: boolean;
  resolvedIps: string[];
  httpStatus: number | null;
  httpsStatus: number | null;
  sslActive: boolean;
  latencyMs: number;
  serverHeader: string | null;
  contentType: string | null;
  pageTitle: string | null;
  error?: string;
  checkedAt: string;
}

export class DnsService {
  /**
   * Resolves A records for a domain and inspects HTTP/HTTPS endpoint reachability
   */
  async inspectDomain(domain: string, targetIp: string = env.SERVER_PUBLIC_IP): Promise<DomainCheckResult> {
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const start = Date.now();
    const result: DomainCheckResult = {
      domain: cleanDomain,
      targetIp,
      dnsConfigured: false,
      resolvedIps: [],
      httpStatus: null,
      httpsStatus: null,
      sslActive: false,
      latencyMs: 0,
      serverHeader: null,
      contentType: null,
      pageTitle: null,
      checkedAt: new Date().toISOString(),
    };

    // 1. Check DNS resolution
    try {
      const records = await dns.resolve4(cleanDomain);
      result.resolvedIps = records;
      result.dnsConfigured = records.includes(targetIp);
    } catch (dnsErr) {
      const msg = dnsErr instanceof Error ? dnsErr.message : "DNS resolution failed";
      logger.debug("DNS lookup for domain failed", { domain: cleanDomain, error: msg });
      result.error = `DNS lookup: ${msg}`;
    }

    // 2. Perform HTTP/HTTPS probe with redirect following (simulating curl -I -L)
    try {
      // First try HTTPS
      const httpsController = new AbortController();
      const timeout = setTimeout(() => httpsController.abort(), 4000);

      try {
        const httpsRes = await fetch(`https://${cleanDomain}`, {
          method: "GET",
          headers: {
            "User-Agent": "Caddy-Manager-Probe/1.0",
            Accept: "text/html,application/xhtml+xml,application/json,*/*",
          },
          redirect: "follow",
          signal: httpsController.signal,
        });
        clearTimeout(timeout);

        result.httpsStatus = httpsRes.status;
        result.sslActive = true;
        result.serverHeader = httpsRes.headers.get("server");
        result.contentType = httpsRes.headers.get("content-type");

        // Try extracting HTML title if available
        if (result.contentType?.includes("text/html")) {
          const html = await httpsRes.text();
          const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (match && match[1]) {
            result.pageTitle = match[1].trim().slice(0, 100);
          }
        }
      } catch (httpsErr) {
        clearTimeout(timeout);
        // HTTPS failed, try plain HTTP
        const httpController = new AbortController();
        const httpTimeout = setTimeout(() => httpController.abort(), 4000);
        try {
          const httpRes = await fetch(`http://${cleanDomain}`, {
            method: "GET",
            headers: {
              "User-Agent": "Caddy-Manager-Probe/1.0",
            },
            redirect: "follow",
            signal: httpController.signal,
          });
          clearTimeout(httpTimeout);
          result.httpStatus = httpRes.status;
          result.serverHeader = httpRes.headers.get("server");
          result.contentType = httpRes.headers.get("content-type");
        } catch (httpErr) {
          clearTimeout(httpTimeout);
        }
      }
    } catch (probeErr) {
      logger.debug("Endpoint probe error", { domain: cleanDomain, error: probeErr });
    }

    result.latencyMs = Date.now() - start;
    return result;
  }
}

export const dnsService = new DnsService();
