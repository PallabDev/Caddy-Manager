import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth.helper";
import { domainService } from "@/server/services/domain.service";
import { AddDomainModal } from "@/components/domains/add-domain-modal";
import { DomainStatusCard } from "@/components/domains/domain-status-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const domainList = await domainService.getDomainsForUser(user);
  const totalDomains = domainList.length;
  const activeDomains = domainList.filter((d) => d.dnsConfigured || d.status === "active").length;
  const pendingDomains = totalDomains - activeDomains;
  const occupiedPorts = domainList.map((d) => d.port);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">
            Dashboard Overview
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Real-time Caddy reverse proxy router and automated SSL monitor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/status">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Activity className="h-4 w-4 text-primary" />
              System Status
            </Button>
          </Link>
          <AddDomainModal
            currentUsername={user.username || user.name}
            serverIp={env.SERVER_PUBLIC_IP}
            occupiedPorts={occupiedPorts}
          />
        </div>
      </div>

      {/* 4 KPI Summary Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Total Routes
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary-soft text-primary">
              <Server className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{totalDomains}</div>
            <p className="text-xs text-muted mt-1">
              Active in Caddy reverse proxy
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Active & Secured
            </CardTitle>
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeDomains}</div>
            <p className="text-xs text-muted mt-1">
              DNS pointing & SSL verified
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Pending Setup
            </CardTitle>
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingDomains}</div>
            <p className="text-xs text-muted mt-1">
              A-record pointing required
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Server Target IP
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent-soft text-accent">
              <Globe className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-primary truncate">
              {env.SERVER_PUBLIC_IP}
            </div>
            <p className="text-xs text-muted mt-1">
              A-record destination address
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Configured Domains on Left & System Info on Right */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Configured Domains
              </h3>
              <p className="text-xs text-muted">
                Live inspection status streamed continuously via Socket.IO
              </p>
            </div>
          </div>

          {domainList.length === 0 ? (
            <Card className="border-dashed p-10 text-center bg-bg/50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary mb-3">
                <Globe className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-text">No domains configured yet</h4>
              <p className="text-xs text-muted max-w-sm mx-auto mt-1 mb-5">
                Add your first domain to bind it to a local service port. Caddy will automatically issue a Let&apos;s Encrypt SSL certificate.
              </p>
              <AddDomainModal
                currentUsername={user.username || user.name}
                serverIp={env.SERVER_PUBLIC_IP}
                occupiedPorts={occupiedPorts}
              />
            </Card>
          ) : (
            <div className="grid gap-4">
              {domainList.map((d) => (
                <DomainStatusCard
                  key={d.id}
                  domain={d}
                  currentUserId={user.id}
                  isAdmin={user.admin}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                SSL & DNS Guide
              </CardTitle>
              <CardDescription>
                Point your domain to enable automatic HTTPS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="rounded-lg border border-border bg-bg p-3.5 space-y-2">
                <div className="font-semibold text-text flex items-center justify-between">
                  <span>Required A-Record</span>
                  <Badge variant="default" className="text-[10px]">Active</Badge>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>Type:</span>
                  <span className="text-text font-bold">A</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>Points to:</span>
                  <span className="text-primary font-bold">{env.SERVER_PUBLIC_IP}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-muted leading-relaxed">
                <p>
                  1. Add an A record on your DNS provider pointing to <strong className="text-text font-mono">{env.SERVER_PUBLIC_IP}</strong>.
                </p>
                <p>
                  2. As soon as DNS resolves, Caddy automatically provisions a trusted TLS certificate on port 443.
                </p>
                <p>
                  3. The port collision guard ensures your target port is never assigned twice.
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-muted">Need full metrics?</span>
                <Link href="/status">
                  <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                    System Health
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-accent" />
                Reverse Proxy Core
              </CardTitle>
              <CardDescription>
                Runtime configuration overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-muted">Proxy Engine</span>
                <span className="font-semibold text-text">Caddy 2 (Docker)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-muted">Storage Driver</span>
                <span className="font-semibold text-text">PostgreSQL 16</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-muted">Monitoring</span>
                <span className="font-semibold text-text">Socket.IO Live</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted">Health API</span>
                <Link href="/health" target="_blank" className="font-mono text-primary hover:underline">
                  /health (JSON)
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
