import { createServer } from "http";
import next from "next";
import { initSocketServer } from "./src/server/socket";
import { logger } from "./src/lib/logger";
import { caddyService } from "./src/server/services/caddy.service";
import { domainRepository } from "./src/server/repositories/domain.repository";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || process.env.CADDY_MANAGER_PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  initSocketServer(httpServer);

  httpServer.listen(port, () => {
    logger.info(`> Caddy-Manager listening on http://${hostname}:${port}`);
  });

  // Bootstrap initial Caddy configuration on startup
  try {
    const existingDomains = await domainRepository.findAll();
    await caddyService.syncCaddy(existingDomains);
    logger.info("Initial Caddyfile synchronized on startup");
  } catch (err) {
    logger.warn("Initial Caddy startup sync skipped or pending database readiness", { error: err });
  }
});
