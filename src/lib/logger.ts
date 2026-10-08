import winston from "winston";

const sensitiveKeys = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "better_auth_secret",
  "google_client_secret",
  "apikey",
  "api_key",
]);

function maskSensitiveData(obj: unknown, depth = 0): unknown {
  if (depth > 5 || !obj || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => maskSensitiveData(item, depth + 1));
  }

  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.has(lowerKey) || lowerKey.includes("secret") || lowerKey.includes("password")) {
      masked[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      masked[key] = maskSensitiveData(value, depth + 1);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

const customMaskFormat = winston.format((info) => {
  const masked = maskSensitiveData(info) as winston.Logform.TransformableInfo;
  return masked;
})();

const isDev = process.env.NODE_ENV !== "production";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    customMaskFormat,
    isDev
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
            const stackStr = stack ? `\n${stack}` : "";
            return `[${timestamp}] [${level}]: ${message}${metaStr}${stackStr}`;
          })
        )
      : winston.format.json()
  ),
  defaultMeta: { service: "caddy-manager" },
  transports: [
    new winston.transports.Console(),
  ],
});
