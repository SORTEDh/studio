
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Stethoscope, ClipboardList, BarChart3 } from "lucide-react";

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserNav } from "@/components/user-nav";

export function DashboardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Overview", icon: Home },
    {
      href: "/dashboard/prescriptions",
      label: "Prescriptions",
      icon: FileText,
    },
    {
      href: "/dashboard/care-plans",
      label: "Care Plans",
      icon: ClipboardList,
    },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/users", label: "Users", icon: Users },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-primary"
          >
            <Stethoscope className="h-6 w-6" />
            <span className="group-data-[collapsible=icon]:hidden">
              Patient Support
            </span>
          </Link>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={{ children: item.label, side: "right" }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </>
  );
}
