import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth.helper";
import { domainService } from "@/server/services/domain.service";
import { AddDomainModal } from "@/components/domains/add-domain-modal";
import { DomainStatusCard } from "@/components/domains/domain-status-card";
import { Globe } from "lucide-react";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DomainsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const domainList = await domainService.getDomainsForUser(user);
  const occupiedPorts = domainList.map((d) => d.port);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2.5">
            <Globe className="h-6 w-6 text-primary" />
            Proxy Domains
          </h1>
          <p className="text-sm text-muted mt-1">
            {user.admin
              ? "All reverse proxy routes across the system (Administrator view)."
              : "Domains managed by your account."}
          </p>
        </div>

        <AddDomainModal
          currentUsername={user.username || user.name}
          serverIp={env.SERVER_PUBLIC_IP}
          occupiedPorts={occupiedPorts}
        />
      </div>

      <div className="grid gap-4">
        {domainList.map((domain) => (
          <DomainStatusCard
            key={domain.id}
            domain={domain}
            currentUserId={user.id}
            isAdmin={user.admin}
          />
        ))}
      </div>
    </div>
  );
}
