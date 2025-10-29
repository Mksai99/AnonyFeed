"use client";

import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { LayoutDashboard, LogOut, Ticket, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
          <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Feedback Fortress</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/dashboard"}
              tooltip={{children: 'Dashboard'}}
            >
              <Link href="/admin/dashboard">
                <LayoutDashboard />
                <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/tokens"}
              tooltip={{children: 'Tokens'}}
            >
              <Link href="/admin/tokens">
                <Ticket />
                <span className="group-data-[collapsible=icon]:hidden">Tokens</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/faculty"}
              tooltip={{children: 'Faculty'}}
            >
              <Link href="/admin/faculty">
                <Users />
                <span className="group-data-[collapsible=icon]:hidden">Faculty</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="hidden md:flex">
        <div className="w-full">
            <SidebarMenuButton asChild className="w-full" tooltip={{children: 'Logout'}}>
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                  {/* client-side logout button */}
                  <LogoutButton />
                </div>
            </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </>
  );
}
