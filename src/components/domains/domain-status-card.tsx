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
  Radio,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Domain } from "@/server/db/schema";
import { deleteDomainAction } from "@/features/domains/actions/domain.actions";

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
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initialize existing parsed result if present
  useEffect(() => {
    if (domain.lastCheckResult) {
      try {
        const parsed = JSON.parse(domain.lastCheckResult);
        setDiagnostics(parsed);
      } catch {
        // ignore JSON parse error
      }
    }
  }, [domain.lastCheckResult]);

  // Connect to Socket.IO for continuous live status
  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsSocketConnected(true);
      socket.emit("watch-domain", { domainId: domain.id, domain: domain.domain });
    });

    socket.on("domain-status-update", (data: { domainId: string; diagnostics: DiagnosticsData }) => {
      if (data.domainId === domain.id) {
        setDiagnostics(data.diagnostics);
        setIsProbing(false);
      }
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    return () => {
      socket.emit("unwatch-domain", { domainId: domain.id });
      socket.disconnect();
    };
  }, [domain.id, domain.domain]);

  const handleManualProbe = async () => {
    setIsProbing(true);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("check-domain-now", { domainId: domain.id, domain: domain.domain });
    } else {
      // Fallback via REST API probe
      try {
        const res = await fetch(`/api/domains/${domain.id}/check`);
        const json = await res.json();
        if (json.diagnostics) {
          setDiagnostics(json.diagnostics);
        }
      } catch {
        // ignore probe error
      } finally {
        setIsProbing(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove '${domain.domain}'? This will unbind port ${domain.port}.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDomainAction(domain.id);
      if (onDeleted) onDeleted();
    } catch {
      // handle error
    } finally {
      setIsDeleting(false);
    }
  };

  const isDnsOk = diagnostics ? diagnostics.dnsConfigured : domain.dnsConfigured;
  const httpCode = diagnostics?.httpsStatus || diagnostics?.httpStatus;
  const canDelete = isAdmin || domain.userId === currentUserId;

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md shadow-xl transition-all duration-200 hover:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Domain Title & Proxy details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-white hover:text-sky-400 transition-colors flex items-center gap-1.5"
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
                <AlertTriangle className="h-3 w-3" /> Invalid Configuration / Pending DNS
              </Badge>
            )}

            {isSocketConnected && (
              <span className="flex items-center gap-1 text-[11px] text-sky-400 font-mono bg-sky-950/60 border border-sky-500/20 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                Live WS
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md text-slate-300">
              <Server className="h-3.5 w-3.5 text-sky-400" />
              Reverse Proxy: <strong className="text-white">Port {domain.port}</strong>
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
            className="h-8 px-2.5 text-xs gap-1 border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isProbing ? "animate-spin text-sky-400" : ""}`} />
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
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* DNS Resolution Pillar */}
          <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              DNS Record
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-200">
                {diagnostics?.resolvedIps?.length
                  ? diagnostics.resolvedIps.join(", ")
                  : "No A records resolved"}
              </span>
              {isDnsOk ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              )}
            </div>
            {!isDnsOk && (
              <p className="text-[11px] text-amber-400/90 mt-1">
                Point A record to <code className="text-white font-bold">{domain.targetIp}</code>
              </p>
            )}
          </div>

          {/* HTTP Status Probe Pillar */}
          <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              HTTP Probe (curl -I)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono">
                {httpCode ? (
                  <span
                    className={`font-bold ${
                      httpCode >= 200 && httpCode < 400
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    HTTP {httpCode}
                  </span>
                ) : (
                  <span className="text-slate-500">Unreachable</span>
                )}
              </span>
              {diagnostics?.latencyMs ? (
                <span className="text-[11px] text-slate-400 flex items-center gap-0.5 font-mono">
                  <Zap className="h-3 w-3 text-amber-400" />
                  {diagnostics.latencyMs}ms
                </span>
              ) : null}
            </div>
            {diagnostics?.serverHeader && (
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Server: <span className="text-slate-300">{diagnostics.serverHeader}</span>
              </p>
            )}
          </div>

          {/* SSL / Caddy Certificate */}
          <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              SSL / TLS Encryption
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <ShieldCheck
                  className={`h-4 w-4 ${
                    diagnostics?.sslActive ? "text-emerald-400" : "text-slate-500"
                  }`}
                />
                {diagnostics?.sslActive ? "Auto-HTTPS Active" : "Pending Handshake"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Managed automatically by Caddy
            </p>
          </div>
        </div>

        {/* Page Content / Title preview */}
        {diagnostics?.pageTitle && (
          <div className="text-xs text-slate-300 bg-slate-900/90 rounded-lg p-2 px-3 border border-slate-800 flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">Page Title:</span>
            <span className="font-medium text-white truncate">&quot;{diagnostics.pageTitle}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
}
