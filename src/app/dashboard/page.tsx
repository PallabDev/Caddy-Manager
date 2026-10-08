import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth.helper";
import { domainService } from "@/server/services/domain.service";
import { AddDomainModal } from "@/components/domains/add-domain-modal";
import { DomainStatusCard } from "@/components/domains/domain-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
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

      {/* Configured Domains Section */}
      <div className="space-y-4">
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
    </div>
  );
}
