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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:scale-105">
              <Server className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-text flex items-center gap-1.5 text-base">
                Caddy Manager
                <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
              </span>
              <span className="text-xs text-muted font-mono">Reverse Proxy Control</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-soft text-primary font-semibold shadow-xs"
                      : "text-muted hover:text-text hover:bg-primary-soft/40"
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
            <Button variant="ghost" size="sm" className="text-xs text-muted hover:text-text gap-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Health JSON
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full p-1 pl-2 text-left hover:bg-primary-soft/50 border border-border transition-colors focus:outline-none cursor-pointer">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-text">{user.name}</span>
                  <span className="text-[10px] text-primary font-mono flex items-center gap-1">
                    {user.admin ? (
                      <>
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </>
                    ) : (
                      "Operator"
                    )}
                  </span>
                </div>
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className="bg-primary text-white font-bold text-xs">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-surface border-border text-text">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-text">{user.name}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer hover:bg-primary-soft hover:text-primary">
                  <Server className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/domains" className="cursor-pointer hover:bg-primary-soft hover:text-primary">
                  <Globe className="mr-2 h-4 w-4" /> My Domains
                </Link>
              </DropdownMenuItem>
              {user.admin && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/users" className="cursor-pointer text-primary hover:bg-primary-soft">
                    <Users className="mr-2 h-4 w-4" /> User Management
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
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
