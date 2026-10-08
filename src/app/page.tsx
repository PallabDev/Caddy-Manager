import Link from "next/link";
import { getCurrentUser } from "@/server/auth.helper";
import { redirect } from "next/navigation";
import { Server, Globe, ShieldCheck, Zap, Activity, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.isAccess) {
      redirect("/dashboard");
    } else {
      redirect("/access-denied");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-slate-950 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-500/15 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20">
            <Server className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Caddy Manager</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/status">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
              System Status
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="gradient" size="sm" className="gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs font-semibold backdrop-blur-md">
          <Zap className="h-3.5 w-3.5 text-sky-400" />
          Production-Grade Reverse Proxy & Automated SSL Gateway
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Effortless Caddy Routing <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
            Managed Dynamically with Docker
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
          Spin up Caddy in Docker, route your public domains to local microservices, automatically issue Let&apos;s Encrypt SSL certificates, and monitor DNS propagation with real-time WebSockets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/login">
            <Button variant="gradient" size="lg" className="w-full sm:w-auto text-base gap-2 px-8">
              Open Web Dashboard <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/status">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base gap-2">
              <Activity className="h-5 w-5 text-emerald-400" /> View Status Page
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-sky-500/10 text-sky-400">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Dynamic Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add or remove domains without downtime. Caddy automatically updates reverse proxy rules while preserving all existing routes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Zero Trust Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict Google OAuth authentication, role-based access approval (<code className="text-sky-300 font-mono">isAccess</code>), and isolated domain ownership.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Live Socket.IO Inspection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time DNS A-record verification and HTTP probing (curl -I equivalent) with instant visual feedback.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Caddy Manager &bull; Powered by Next.js, Drizzle ORM, Better Auth, and Caddy Proxy</p>
      </footer>
    </div>
  );
}
