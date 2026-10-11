"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Route as RouteIcon,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  UserCheck,
  Sparkles,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Pass Requests",
      href: "/admin/requests",
      icon: FileCheck,
    },
    {
      label: "Students Directory",
      href: "/admin/students",
      icon: Users,
    },
    {
      label: "Bus Routes",
      href: "/admin/routes",
      icon: RouteIcon,
    },
    {
      label: "Fees & Ledger",
      href: "/admin/fees",
      icon: CreditCard,
    },
    {
      label: "Admin Staff & HOD",
      href: "/admin/admins",
      icon: UserCheck,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#111827] border-r border-[#1F2937] shrink-0 md:min-h-[calc(100vh-5rem)] p-4 sm:p-5 flex flex-col justify-between text-[#F9FAFB]">
      <div className="space-y-6">
        {/* Admin Badge Header */}
        <div className="px-3.5 py-2.5 rounded-xl bg-[#0A0F1C] border border-[#1F2937] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#A78BFA] text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#F9FAFB] block">
                Transport Desk
              </span>
              <span className="text-[10px] text-[#A78BFA] font-semibold block -mt-0.5">
                Flora Institutes Admin
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links - Horizontal scroll on mobile, vertical on desktop */}
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1.5 pb-2 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#6366F1] text-white shadow-md shadow-indigo-600/30 border border-[#6366F1]"
                    : "text-[#9CA3AF] hover:bg-[#0A0F1C] hover:text-[#F9FAFB] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 hidden md:block" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Dual Role Switcher Button at bottom */}
      <div className="pt-6 border-t border-[#1F2937] space-y-3 mt-6">
        <div className="p-3 rounded-xl bg-[#0A0F1C] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#9CA3AF]">Dual Role Active</span>
            <span className="text-emerald-400 font-bold">Student + Admin</span>
          </div>
          <Link
            href="/student/dashboard"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold bg-[#111827] hover:bg-[#1f2937] text-[#A78BFA] border border-[#6366F1]/40 transition-all hover:scale-[1.02]"
          >
            <GraduationCap className="w-4 h-4 text-[#A78BFA]" />
            <span>Switch to Student View</span>
          </Link>
        </div>

        <div className="text-[10px] text-[#9CA3AF]/60 text-center">
          Flora Education Society, Pune
        </div>
      </div>
    </aside>
  );
}
