import { healthService } from "@/server/services/health.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";
import {
  Activity,
  Database,
  Server,
  Cpu,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const health = await healthService.getHealth();

  const isDbOk = health.components.database.status === "connected";
  const isCaddyOk = health.components.caddy.status === "connected";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-6 w-6 text-sky-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                System Health & Diagnostics
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Live hardware, database connectivity, and Caddy proxy engine metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={
                health.status === "healthy"
                  ? "success"
                  : health.status === "degraded"
                  ? "warning"
                  : "destructive"
              }
              className="text-sm px-3 py-1 gap-1.5"
            >
              {health.status === "healthy" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> All Systems Healthy
                </>
              ) : health.status === "degraded" ? (
                <>
                  <AlertTriangle className="h-4 w-4" /> System Degraded
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" /> System Outage
                </>
              )}
            </Badge>

            <Link href="/api/health" target="_blank">
              <Badge variant="outline" className="text-xs px-2.5 py-1 gap-1 text-slate-400 hover:text-white">
                JSON Endpoint <ExternalLink className="h-3 w-3" />
              </Badge>
            </Link>
          </div>
        </div>

        {/* Component Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Database Health Card */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">PostgreSQL Database</CardTitle>
                  <CardDescription className="text-xs">Drizzle connection pool</CardDescription>
                </div>
              </div>
              <Badge variant={isDbOk ? "success" : "destructive"}>
                {isDbOk ? "Connected" : "Disconnected"}
              </Badge>
            </CardHeader>
            <CardContent className="pt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Ping Latency:</span>
                <span className="text-emerald-400 font-bold">{health.components.database.latencyMs}ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Database Role:</span>
                <span className="text-slate-200">ServerCaddy</span>
              </div>
              {health.components.database.error && (
                <div className="text-rose-400 mt-2 p-2 rounded bg-rose-950/40 border border-rose-500/20">
                  {health.components.database.error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Caddy Proxy Engine Card */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Caddy Proxy Gateway</CardTitle>
                  <CardDescription className="text-xs">Dynamic Admin API on port 2019</CardDescription>
                </div>
              </div>
              <Badge variant={isCaddyOk ? "success" : "warning"}>
                {isCaddyOk ? "Online & Synced" : "Unreachable (Dev/Offline)"}
              </Badge>
            </CardHeader>
            <CardContent className="pt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Admin API:</span>
                <span className="text-sky-300">http://caddy:2019</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Config Sync:</span>
                <span className="text-emerald-400 font-bold">Automatic Reload</span>
              </div>
              {health.components.caddy.error && (
                <div className="text-amber-400 mt-2 p-2 rounded bg-amber-950/40 border border-amber-500/20">
                  {health.components.caddy.error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System & Memory Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-sky-400" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs font-mono">
              <div className="text-xl font-bold text-white">
                {formatBytes(health.metrics.systemMemory.processRss)}
              </div>
              <p className="text-slate-500 text-[11px]">
                Free Host RAM: {formatBytes(health.metrics.systemMemory.freeBytes)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Process Uptime
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs font-mono">
              <div className="text-xl font-bold text-emerald-400">
                {Math.floor(health.uptimeSeconds / 60)}m {health.uptimeSeconds % 60}s
              </div>
              <p className="text-slate-500 text-[11px]">Node.js {health.metrics.nodeVersion}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs font-mono">
              <div className="text-sm font-bold text-slate-200 truncate">
                {health.metrics.platform}
              </div>
              <p className="text-slate-500 text-[11px]">
                Target IP: {health.metrics.serverIp}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
