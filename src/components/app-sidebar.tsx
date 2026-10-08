"use client";

import * as React from "react";
import {
  Server,
  Globe,
  Users,
  LayoutDashboard,
  Activity,
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
  ];

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border bg-surface">
      <SidebarHeader className="h-14 shrink-0 border-b border-border px-3.5 group-data-[collapsible=icon]:px-0 flex flex-row items-center justify-start group-data-[collapsible=icon]:justify-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs shrink-0 group-data-[collapsible=icon]:mx-auto">
            <Server className="h-4 w-4 stroke-[2.2]" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold text-text">Caddy Manager</span>
            <span className="truncate text-xs text-muted font-mono">Reverse Proxy</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2 group-data-[collapsible=icon]:p-1 shrink-0 flex items-center justify-center">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
