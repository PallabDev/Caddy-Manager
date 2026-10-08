"use client";

import { ShieldAlert, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function AccessDeniedPage() {
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const handleRefresh = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="w-full max-w-md rounded-3xl border border-amber-500/20 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Access Pending Approval</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your Google Account has been authenticated, but you do not currently have the required{" "}
            <span className="font-mono text-amber-400 font-semibold">isAccess</span> authorization flag.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 text-left space-y-1.5">
          <p className="font-semibold text-slate-200">What to do next:</p>
          <p>1. Contact your system administrator to approve your account.</p>
          <p>2. Once the administrator grants access in the dashboard, click Refresh.</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            variant="default"
            onClick={handleRefresh}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Check Access Again
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSignOut}
            className="w-full text-slate-400 hover:text-white gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
