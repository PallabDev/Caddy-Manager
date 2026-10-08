"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Users, Activity, ShieldCheck, LogOut, ExternalLink, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    admin: boolean;
    isAccess: boolean;
  };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: Server },
    { href: "/dashboard/domains", label: "Domains", icon: Globe },
    ...(user.admin ? [{ href: "/dashboard/users", label: "Users & Access", icon: Users }] : []),
    { href: "/status", label: "System Status", icon: Activity },
  ];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
              <Server className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
                Caddy Manager
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-xs text-slate-400 font-mono">Reverse Proxy Control</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-800 text-sky-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/health" target="_blank" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              Health API
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full p-1 pl-2 text-left hover:bg-slate-900 border border-slate-800/80 transition-colors focus:outline-none">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-sky-400 font-mono flex items-center gap-1">
                    {user.admin ? (
                      <>
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </>
                    ) : (
                      "Operator"
                    )}
                  </span>
                </div>
                <Avatar className="h-8 w-8 ring-1 ring-sky-500/30">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-indigo-600 text-slate-950 font-bold text-xs">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <Server className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/domains" className="cursor-pointer">
                  <Globe className="mr-2 h-4 w-4" /> My Domains
                </Link>
              </DropdownMenuItem>
              {user.admin && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/users" className="cursor-pointer text-sky-400">
                    <Users className="mr-2 h-4 w-4" /> User Management
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-rose-400 focus:text-rose-300 focus:bg-rose-950/40"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
