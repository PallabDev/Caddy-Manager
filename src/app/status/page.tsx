import { healthService } from "@/server/services/health.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Server,
  ShieldCheck,
  Database,
  Radio,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const health = await healthService.getHealth();
  const isHealthy = health.status === "healthy";

  const services = [
    {
      name: "Caddy Reverse Proxy Core",
      desc: "Dynamic virtual host routing and edge traffic forwarding",
      status: health.components.caddy.status === "connected" ? "Operational" : "Degraded",
      icon: Server,
    },
    {
      name: "Auto-HTTPS & SSL Certificate Provisioning",
      desc: "Let's Encrypt / ZeroSSL automated ACME lifecycle",
      status: "Operational",
      icon: ShieldCheck,
    },
    {
      name: "PostgreSQL Database Store",
      desc: "User authorizations, domain route registrations",
      status: health.components.database.status === "connected" ? "Operational" : "Major Outage",
      icon: Database,
    },
    {
      name: "Real-time WebSocket Daemon",
      desc: "Continuous domain DNS and HTTP health inspection",
      status: "Operational",
      icon: Radio,
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text p-4 sm:p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top bar with back button */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <span className="text-xs text-muted font-mono">
            Updated: {new Date(health.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Big Status Banner */}
        <div
          className={`rounded-2xl p-6 sm:p-8 border shadow-sm ${
            isHealthy
              ? "border-success/30 bg-primary-soft/30"
              : "border-warning/30 bg-warning/10"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                isHealthy
                  ? "bg-success/15 text-success"
                  : "bg-warning/15 text-warning"
              }`}
            >
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-text">
                {isHealthy ? "All Systems Operational" : "Partial System Degradation"}
              </h1>
              <p className="text-sm text-muted mt-0.5">
                Caddy reverse proxy and domain management microservices are functioning normally.
              </p>
            </div>
          </div>
        </div>

        {/* Individual Service Rows */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            System Components
          </h2>

          <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden shadow-sm">
            {services.map((svc) => {
              const Icon = svc.icon;
              const isOk = svc.status === "Operational";

              return (
                <div
                  key={svc.name}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-bg/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-lg bg-primary-soft text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text">{svc.name}</h3>
                      <p className="text-xs text-muted">{svc.desc}</p>
                    </div>
                  </div>

                  <Badge variant={isOk ? "success" : "warning"} className="font-mono text-xs">
                    {svc.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Proxy Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] text-muted uppercase font-semibold">
                Total Routes
              </span>
              <p className="text-2xl font-black text-text mt-1">
                {health.metrics.totalDomains}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] text-muted uppercase font-semibold">
                Active SSL
              </span>
              <p className="text-2xl font-black text-success mt-1">
                {health.metrics.activeDomains}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] text-muted uppercase font-semibold">
                Registered Users
              </span>
              <p className="text-2xl font-black text-primary mt-1">
                {health.metrics.totalUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] text-muted uppercase font-semibold">
                Uptime
              </span>
              <p className="text-2xl font-black text-text mt-1 font-mono">
                {Math.floor(health.uptimeSeconds / 3600)}h {Math.floor((health.uptimeSeconds % 3600) / 60)}m
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
