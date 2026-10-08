import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth.helper";
import { domainService } from "@/server/services/domain.service";
import { AddDomainModal } from "@/components/domains/add-domain-modal";
import { DomainStatusCard } from "@/components/domains/domain-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, CheckCircle2, AlertTriangle, Server, ArrowUpRight, Copy } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Caddy reverse proxy router and automatic SSL monitor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddDomainModal
            currentUsername={user.username || user.name}
            serverIp={env.SERVER_PUBLIC_IP}
            occupiedPorts={occupiedPorts}
          />
        </div>
      </div>

      {/* 4 Stat Cards (Inspired by dashboard-01) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Routes */}
        <Card className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Routes
            </CardTitle>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Server className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{totalDomains}</div>
            <p className="text-xs text-slate-500 mt-1">
              Active inside Caddy reverse proxy
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Active DNS */}
        <Card className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Valid Configurations
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-400">{activeDomains}</div>
            <p className="text-xs text-slate-500 mt-1">
              DNS pointed & resolving correctly
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Pending DNS */}
        <Card className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Pending DNS
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-400">{pendingDomains}</div>
            <p className="text-xs text-slate-500 mt-1">
              Waiting for A record propagation
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Target IP */}
        <Card className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Server Target IP
            </CardTitle>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Globe className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-sky-300">
              {env.SERVER_PUBLIC_IP}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Target for all your DNS A records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Domain List & Real-time Live Inspectors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-sky-400" />
              Configured Domains
            </h2>
            <p className="text-xs text-slate-400">
              Live inspection status streamed via Socket.IO
            </p>
          </div>
        </div>

        {domainList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 mb-4">
              <Globe className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">No domains configured yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              Add your first domain to bind it to a local service port. Caddy will automatically issue an SSL certificate!
            </p>
            <AddDomainModal
              currentUsername={user.username || user.name}
              serverIp={env.SERVER_PUBLIC_IP}
              occupiedPorts={occupiedPorts}
            />
          </div>
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
