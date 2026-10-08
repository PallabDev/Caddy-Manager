"use client";

import { useState } from "react";
import { Server, ShieldCheck, Lock, ArrowRight, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate Google sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background radial gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Glow border wrap */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 shadow-xl shadow-sky-500/25">
              <Server className="h-7 w-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Caddy Manager
              </h1>
              <p className="text-sm text-slate-400">
                Automated Reverse Proxy & SSL Gateway
              </p>
            </div>
          </div>

          {/* Login Card Body */}
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <Lock className="h-3.5 w-3.5 text-sky-400" />
                <span>Authorized Authentication</span>
              </div>
              <p className="leading-relaxed">
                Single Sign-On is exclusively restricted to Google Accounts. Access is granted based on administrator approval.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 text-sm font-semibold rounded-xl bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            {/* Feature badges */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero Trust RBAC</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 justify-center">
                <Globe className="h-4 w-4 text-sky-400" />
                <span>Auto SSL / TLS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
