"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Domain } from "@/server/db/schema";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DiagnosticsData {
  domain: string;
  targetIp: string;
  dnsConfigured: boolean;
  resolvedIps: string[];
  httpStatus: number | null;
  httpsStatus: number | null;
  sslActive: boolean;
  latencyMs: number;
  serverHeader: string | null;
  contentType: string | null;
  pageTitle: string | null;
  error?: string;
  checkedAt: string;
}

interface DomainStatusCardProps {
  domain: Domain;
  currentUserId?: string;
  isAdmin?: boolean;
  onDeleted?: () => void;
}

export function DomainStatusCard({
  domain,
  currentUserId,
  isAdmin = false,
  onDeleted,
}: DomainStatusCardProps) {
  const router = useRouter();
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initialize existing parsed result if present
  useEffect(() => {
    if (domain.lastCheckResult) {
      try {
        const parsed = JSON.parse(domain.lastCheckResult) as DiagnosticsData;
        setDiagnostics(parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, [domain.lastCheckResult]);

  // Auto-probe once on mount if domain is currently pending DNS
  useEffect(() => {
    if (!domain.dnsConfigured) {
      fetch(`/api/domains/${domain.id}/check`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.diagnostics) {
            setDiagnostics(data.diagnostics);
            if (data.diagnostics.dnsConfigured) {
              router.refresh();
            }
          }
        })
        .catch(() => {});
    }
  }, [domain.id, domain.dnsConfigured, router]);

  // Connect to Socket.IO real-time monitor
  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsSocketConnected(true);
      socket.emit("watch-domain", { domainId: domain.id, domain: domain.domain });
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    socket.on("domain-status-update", (data: { domainId: string; diagnostics: DiagnosticsData; status: string }) => {
      if (data.domainId === domain.id && data.diagnostics) {
        setDiagnostics(data.diagnostics);
        if (data.diagnostics.dnsConfigured && !domain.dnsConfigured) {
          router.refresh();
        }
      }
    });

    socket.on("domain:diagnostics", (data: any) => {
      const diag = data.diagnostics || data;
      if (diag && (diag.domain === domain.domain || data.domainId === domain.id)) {
        setDiagnostics(diag);
      }
    });

    return () => {
      socket.emit("unwatch-domain", { domainId: domain.id });
      socket.disconnect();
    };
  }, [domain.id, domain.domain, domain.dnsConfigured, router]);

  // Manual Trigger Probe
  const handleManualProbe = async () => {
    setIsProbing(true);
    try {
      const res = await fetch(`/api/domains/${domain.id}/check`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        const diag: DiagnosticsData = data.diagnostics || data;
        setDiagnostics(diag);
        router.refresh();
        if (diag.dnsConfigured) {
          toast.success("DNS configuration verified successfully!");
        } else {
          toast.error("DNS record not detected pointing to target IP yet.");
        }
      } else {
        toast.error("Failed to run domain inspection probe.");
      }
    } catch (err) {
      console.error("Failed to probe domain manually", err);
      toast.error("Failed to run domain inspection probe.");
    } finally {
      setIsProbing(false);
    }
  };

  // Delete Domain Route
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${domain.domain}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/domains/${domain.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Domain ${domain.domain} removed successfully.`);
        router.refresh();
        if (onDeleted) onDeleted();
      } else {
        toast.error(data.error || "Failed to remove route");
      }
    } catch {
      toast.error("Unexpected error removing route.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isDnsOk = diagnostics ? diagnostics.dnsConfigured : domain.dnsConfigured;
  const httpCode = diagnostics?.httpsStatus || diagnostics?.httpStatus;
  const canDelete = isAdmin || domain.userId === currentUserId;

  return (
    <div className="relative group overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 hover:border-primary/40">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Domain Title & Proxy details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-text hover:text-primary transition-colors flex items-center gap-1.5"
            >
              {domain.domain}
              <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            </a>

            {isDnsOk ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Valid Configuration
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Pending DNS
              </Badge>
            )}

            {isSocketConnected && (
              <span className="flex items-center gap-1 text-[11px] text-primary font-mono bg-primary-soft border border-primary/20 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Live WS
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted font-mono flex-wrap">
            <span className="flex items-center gap-1 bg-primary-soft px-2.5 py-1 rounded-md text-primary font-semibold">
              <Server className="h-3.5 w-3.5" />
              Reverse Proxy: Port {domain.port}
            </span>
            <span>Target IP: {domain.targetIp}</span>
            <span>Owner: {domain.username}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start">
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualProbe}
            disabled={isProbing}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isProbing ? "animate-spin text-primary" : ""}`} />
            Inspect Now
          </Button>

          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 px-2.5 text-xs gap-1"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Vercel-style Inspection Diagnostics Box */}
      <div className="mt-4 rounded-lg border border-border bg-bg/50 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* DNS Resolution Pillar */}
          <div className="rounded-md bg-surface p-2.5 border border-border">
            <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block mb-1">
              DNS Record
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text">
                {diagnostics?.resolvedIps?.length
                  ? diagnostics.resolvedIps.join(", ")
                  : "No A records resolved"}
              </span>
              {isDnsOk ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
            </div>
            {!isDnsOk && (
              <p className="text-[11px] text-warning mt-1">
                Point A record to <code className="text-text font-bold">{domain.targetIp}</code>
              </p>
            )}
          </div>

          {/* HTTP Status Probe Pillar */}
          <div className="rounded-md bg-surface p-2.5 border border-border">
            <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block mb-1">
              HTTP Probe (curl -I)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono">
                {httpCode ? (
                  <span
                    className={`font-bold ${
                      httpCode >= 200 && httpCode < 400
                        ? "text-success"
                        : "text-warning"
                    }`}
                  >
                    HTTP {httpCode}
                  </span>
                ) : (
                  <span className="text-muted">Unreachable</span>
                )}
              </span>
              {diagnostics?.latencyMs ? (
                <span className="text-[11px] text-muted flex items-center gap-0.5 font-mono">
                  <Zap className="h-3 w-3 text-accent" />
                  {diagnostics.latencyMs}ms
                </span>
              ) : null}
            </div>
            {diagnostics?.serverHeader && (
              <p className="text-[11px] text-muted mt-1 truncate">
                Server: <span className="text-text">{diagnostics.serverHeader}</span>
              </p>
            )}
          </div>

          {/* SSL / Caddy Certificate */}
          <div className="rounded-md bg-surface p-2.5 border border-border">
            <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block mb-1">
              SSL / TLS Encryption
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text flex items-center gap-1.5">
                <ShieldCheck
                  className={`h-4 w-4 ${
                    diagnostics?.sslActive ? "text-success" : "text-muted"
                  }`}
                />
                {diagnostics?.sslActive ? "Auto-HTTPS Active" : "Pending Handshake"}
              </span>
            </div>
            <p className="text-[11px] text-muted mt-1">
              Managed automatically by Caddy
            </p>
          </div>
        </div>

        {/* Page Content / Title preview */}
        {diagnostics?.pageTitle && (
          <div className="text-xs text-text bg-surface rounded-md p-2 px-3 border border-border flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-muted">Page Title:</span>
            <span className="font-medium text-text truncate">&quot;{diagnostics.pageTitle}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
}
