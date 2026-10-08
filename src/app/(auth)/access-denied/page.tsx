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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg text-text relative overflow-hidden transition-colors">
      <div className="w-full max-w-md rounded-2xl border border-warning/30 bg-surface p-8 shadow-sm text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 border border-warning/30 text-warning">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-text">Access Pending Approval</h1>
          <p className="text-sm text-muted leading-relaxed">
            Your Google Account has been authenticated, but your account does not currently have the required{" "}
            <span className="font-mono text-warning font-semibold">isAccess</span> authorization approval.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg/50 p-4 text-xs text-muted text-left space-y-1.5">
          <p className="font-semibold text-text">What to do next:</p>
          <p>1. Contact your system administrator to approve your account access.</p>
          <p>2. Once the administrator approves access in the dashboard, click Refresh.</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            variant="default"
            onClick={handleRefresh}
            className="w-full gap-2 font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Check Access Again
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSignOut}
            className="w-full text-muted hover:text-text gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
