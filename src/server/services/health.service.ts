import os from "os";
import { checkDbConnection } from "@/server/db";
import { caddyService } from "@/server/services/caddy.service";
import { domainRepository } from "@/server/repositories/domain.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { env } from "@/lib/env";

export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptimeSeconds: number;
  components: {
    database: {
      status: "connected" | "disconnected";
      latencyMs: number;
      error?: string;
    };
    caddy: {
      status: "connected" | "disconnected";
      error?: string;
    };
  };
  metrics: {
    totalDomains: number;
    activeDomains: number;
    totalUsers: number;
    systemMemory: {
      freeBytes: number;
      totalBytes: number;
      processRss: number;
    };
    nodeVersion: string;
    platform: string;
    serverIp: string;
    publicDomain: string;
  };
}

export class HealthService {
  async getHealth(): Promise<SystemHealth> {
    const dbCheck = await checkDbConnection();
    const caddyCheck = await caddyService.checkCaddyStatus();

    let totalDomains = 0;
    let activeDomains = 0;
    let totalUsers = 0;

    if (dbCheck.ok) {
      try {
        const domainList = await domainRepository.findAll();
        totalDomains = domainList.length;
        activeDomains = domainList.filter((d) => d.status === "active").length;
        const users = await userRepository.findAll();
        totalUsers = users.length;
      } catch {
        // ignore metrics fetch errors
      }
    }

    const memUsage = process.memoryUsage();
    const isDegraded = !caddyCheck.ok || !dbCheck.ok;
    const isUnhealthy = !dbCheck.ok;

    return {
      status: isUnhealthy ? "unhealthy" : isDegraded ? "degraded" : "healthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      components: {
        database: {
          status: dbCheck.ok ? "connected" : "disconnected",
          latencyMs: dbCheck.latencyMs,
          error: dbCheck.error,
        },
        caddy: {
          status: caddyCheck.ok ? "connected" : "disconnected",
          error: caddyCheck.error,
        },
      },
      metrics: {
        totalDomains,
        activeDomains,
        totalUsers,
        systemMemory: {
          freeBytes: os.freemem(),
          totalBytes: os.totalmem(),
          processRss: memUsage.rss,
        },
        nodeVersion: process.version,
        platform: `${os.type()} ${os.arch()}`,
        serverIp: env.SERVER_PUBLIC_IP,
        publicDomain: env.CADDY_MANAGER_DOMAIN,
      },
    };
  }
}

export const healthService = new HealthService();
