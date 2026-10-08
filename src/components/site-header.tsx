"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes("/dashboard/domains")) return "Domain Configuration";
    if (pathname.includes("/dashboard/users")) return "User Management";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md transition-all lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted hover:text-text" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 bg-border"
        />
        <h1 className="text-sm font-semibold text-text">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/status"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary transition-colors bg-primary-soft/50 px-2.5 py-1 rounded-full border border-primary/20"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <Activity className="h-3.5 w-3.5 text-primary" />
          Proxy Active
        </Link>
      </div>
    </header>
  );
}
