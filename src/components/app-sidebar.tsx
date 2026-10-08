"use client";

import * as React from "react";
import {
  Server,
  Globe,
  Users,
  LayoutDashboard,
  Activity,
  FileCode,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    admin: boolean;
    isAccess: boolean;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const navMainItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Domain",
      url: "/dashboard/domains",
      icon: Globe,
    },
    ...(user.admin
      ? [
          {
            title: "User",
            url: "/dashboard/users",
            icon: Users,
          },
        ]
      : []),
  ];

  const navSecondaryItems = [
    {
      title: "System Status",
      url: "/status",
      icon: Activity,
    },
    {
      title: "Health API (JSON)",
      url: "/health",
      icon: FileCode,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border bg-surface">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                  <Server className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-text">Caddy Manager</span>
                  <span className="truncate text-xs text-muted font-mono">Reverse Proxy</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
