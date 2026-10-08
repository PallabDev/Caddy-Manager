"use client";

import { useState } from "react";
import { Plus, Globe, Check, Copy, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDomainAction } from "@/features/domains/actions/domain.actions";

interface AddDomainModalProps {
  currentUsername: string;
  serverIp: string;
  occupiedPorts?: number[];
  onDomainAdded?: () => void;
}

export function AddDomainModal({
  currentUsername,
  serverIp = "127.0.0.1",
  occupiedPorts = [],
  onDomainAdded,
}: AddDomainModalProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(currentUsername || "");
  const [domain, setDomain] = useState("");
  const [port, setPort] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedDns, setCopiedDns] = useState(false);

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const portNum = parseInt(port, 10);
  const isPortOccupied = !isNaN(portNum) && occupiedPorts.includes(portNum);

  const handleCopyDns = () => {
    navigator.clipboard.writeText(serverIp);
    setCopiedDns(true);
    setTimeout(() => setCopiedDns(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cleanDomain) {
      setError("Please provide a valid domain name.");
      return;
    }

    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError("Please specify a valid port number (1 - 65535).");
      return;
    }

    if (isPortOccupied) {
      setError(`Port ${portNum} is already assigned to an existing reverse proxy route.`);
      return;
    }

    setLoading(true);

    try {
      const res = await addDomainAction({
        username: username.trim() || currentUsername,
        domain: cleanDomain,
        port: portNum,
      });

      if (!res.success) {
        setError(res.error || "Failed to create domain configuration.");
        setLoading(false);
        return;
      }

      setOpen(false);
      setDomain("");
      setPort("");
      if (onDomainAdded) onDomainAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Configure New Domain</DialogTitle>
                <DialogDescription>
                  Set up reverse proxy routing in Caddy with automatic SSL certificate provisioning.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Username Input */}
            <div className="grid gap-2">
              <Label htmlFor="username">Username / Project Owner</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jdoe or my-project"
                required
              />
              <p className="text-xs text-slate-500">
                The identifier associated with this domain assignment.
              </p>
            </div>

            {/* Domain Input */}
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. app.yourcompany.com or mysite.org"
                required
              />
            </div>

            {/* DNS Instructions Banner (Dynamically shown when domain entered) */}
            {cleanDomain.length > 2 && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-3.5 text-sm transition-all animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-sky-500/20 text-sky-400 mt-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="font-medium text-sky-200">DNS Configuration Required</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Add an <span className="font-semibold text-white">A record</span> for{" "}
                      <span className="font-mono text-sky-300 font-semibold">{cleanDomain}</span> on your DNS provider
                      pointing to:
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-xs text-emerald-400 font-bold">
                        {serverIp}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleCopyDns}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        {copiedDns ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy Target IP
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Port Input */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="port">Target Service Port</Label>
                {isPortOccupied && (
                  <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Port already occupied!
                  </span>
                )}
              </div>
              <Input
                id="port"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="e.g. 3000, 8080, 5000"
                min={1}
                max={65535}
                required
                className={isPortOccupied ? "border-rose-500 focus-visible:ring-rose-500" : ""}
              />
              <p className="text-xs text-slate-500">
                The local port your upstream application is listening on (forwarded via Caddy).
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading || isPortOccupied || !cleanDomain || !port}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save & Apply Route
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
