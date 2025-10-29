"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <SidebarProvider>
      {!isLoginPage && (
        <Sidebar>
          <AdminSidebar />
        </Sidebar>
      )}
      <SidebarInset>
        {!isLoginPage && (
          <header className="p-4 border-b flex justify-between items-center md:hidden">
              <div className="flex items-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                  <span className="text-xl font-semibold">Fortress</span>
              </div>
              <div className="flex items-center gap-2">
                  <LogoutButton />
                  <SidebarTrigger />
              </div>
          </header>
        )}
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
