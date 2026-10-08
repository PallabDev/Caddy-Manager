import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { dnsService } from "@/server/services/dns.service";
import { domainRepository } from "@/server/repositories/domain.repository";
import { logger } from "@/lib/logger";

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.debug("Socket client connected", { socketId: socket.id });
    const watchers = new Map<string, NodeJS.Timeout>();

    const runProbe = async (domainId: string, domainName: string) => {
      try {
        const diagnostics = await dnsService.inspectDomain(domainName);
        const status = diagnostics.dnsConfigured ? "active" : "pending_dns";

        // Update database with latest status
        await domainRepository.updateCheckStatus(
          domainId,
          status,
          diagnostics.dnsConfigured,
          diagnostics.sslActive,
          JSON.stringify(diagnostics)
        );

        socket.emit("domain-status-update", {
          domainId,
          diagnostics,
          status,
        });
      } catch (err) {
        logger.error("Error during socket domain probe", { domainId, error: err });
      }
    };

    socket.on("watch-domain", async (data: { domainId: string; domain: string }) => {
      if (!data?.domainId || !data?.domain) return;
      logger.info("Socket client started watching domain", { socketId: socket.id, domain: data.domain });

      // Run immediate probe
      await runProbe(data.domainId, data.domain);

      // Clear existing watcher for this domain if any
      if (watchers.has(data.domainId)) {
        clearInterval(watchers.get(data.domainId)!);
      }

      // Schedule continuous check every 8 seconds
      const interval = setInterval(() => {
        runProbe(data.domainId, data.domain);
      }, 8000);

      watchers.set(data.domainId, interval);
    });

    socket.on("unwatch-domain", (data: { domainId: string }) => {
      if (watchers.has(data?.domainId)) {
        clearInterval(watchers.get(data.domainId)!);
        watchers.delete(data.domainId);
      }
    });

    socket.on("check-domain-now", async (data: { domainId: string; domain: string }) => {
      if (!data?.domainId || !data?.domain) return;
      await runProbe(data.domainId, data.domain);
    });

    socket.on("disconnect", () => {
      logger.debug("Socket client disconnected", { socketId: socket.id });
      watchers.forEach((timer) => clearInterval(timer));
      watchers.clear();
    });
  });

  logger.info("Socket.IO server initialized on /socket.io");
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
