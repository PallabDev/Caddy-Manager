import Link from "next/link";
import { getCurrentUser } from "@/server/auth.helper";
import { redirect } from "next/navigation";
import { Server, Globe, ShieldCheck, Zap, Activity, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between selection:bg-primary-soft selection:text-primary relative overflow-hidden transition-colors">
      {/* Glow backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Server className="h-5 w-5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-lg text-text tracking-tight">Caddy Manager</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/status">
            <Button variant="ghost" size="sm" className="text-xs text-muted hover:text-text">
              System Status
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="default" size="sm" className="gap-2 font-semibold shadow-xs">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary-soft text-primary text-xs font-semibold backdrop-blur-md">
          <Zap className="h-3.5 w-3.5" />
          Production-Grade Reverse Proxy & Automated SSL Gateway
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-text leading-tight">
          Effortless Caddy Routing <br />
          <span className="bg-gradient-to-r from-primary via-emerald-600 to-accent bg-clip-text text-transparent">
            Managed Dynamically with Docker
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted leading-relaxed">
          Spin up Caddy in Docker, route your public domains to local microservices, automatically issue Let&apos;s Encrypt SSL certificates, and monitor DNS propagation with real-time WebSockets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/login">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto text-base gap-2 px-8 shadow-sm font-semibold"
            >
              Open Web Dashboard <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/status">
            <Button
              variant="outline"
              size="lg"
              className="px-6 w-full sm:w-auto text-base gap-2"
            >
              <Activity className="h-5 w-5 text-primary" /> View Status Page
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-2 hover:border-primary/40 transition-colors">
            <div className="p-2.5 w-fit rounded-lg bg-primary-soft text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-text text-base">Dynamic Routing</h3>
            <p className="text-xs text-muted leading-relaxed">
              Add or remove domains without downtime. Caddy automatically updates reverse proxy rules while preserving all existing routes.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-2 hover:border-primary/40 transition-colors">
            <div className="p-2.5 w-fit rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-text text-base">Zero Trust Security</h3>
            <p className="text-xs text-muted leading-relaxed">
              Strict Google OAuth authentication, role-based access approval, and isolated domain ownership.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-2 hover:border-primary/40 transition-colors">
            <div className="p-2.5 w-fit rounded-lg bg-accent-soft text-accent">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-text text-base">Live Socket.IO Inspection</h3>
            <p className="text-xs text-muted leading-relaxed">
              Real-time DNS A-record verification and HTTP probing (curl -I equivalent) with instant visual feedback.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted">
        <p>Caddy Manager • Powered by Next.js, Drizzle ORM, Better Auth, and Caddy Proxy</p>
      </footer>
    </div>
  );
}
