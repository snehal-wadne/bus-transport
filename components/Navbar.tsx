"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Bus,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  LogOut,
  User,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const user = session?.user;
  const role = user?.role;
  const dashboardLink = role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";
  const isInAdminView = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1F2937] bg-[#0A0F1C]/90 backdrop-blur-md transition-colors text-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Flora Logo - Clean Square Container */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform flex items-center justify-center border border-[#1F2937] shrink-0">
              <Image
                src="/logo.png"
                alt="Flora Institutes Logo"
                width={56}
                height={56}
                className="object-contain w-full h-full"
                priority
              />
            </div>

            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#F9FAFB] flex items-center gap-2">
                Flora Institutes
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#6366F1]/20 text-[#A78BFA] border border-[#6366F1]/40">
                  Transit
                </span>
              </span>
              <p className="text-[11px] text-[#9CA3AF] -mt-0.5 hidden sm:block">
                Flora Education Society • Campus Bus Portal
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#9CA3AF]">
            <Link
              href="/"
              className="hover:text-[#A78BFA] transition-colors"
            >
              Flora Campus Route
            </Link>
            <Link
              href="/#credentials"
              className="hover:text-[#A78BFA] transition-colors"
            >
              Portal Credentials
            </Link>
            <Link
              href="/#features"
              className="hover:text-[#A78BFA] transition-colors"
            >
              QR Verification
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />

            {status === "loading" ? (
              <div className="w-28 h-9 bg-[#111827] rounded-xl animate-pulse border border-[#1F2937]" />
            ) : user ? (
              <div className="flex items-center gap-2.5">
                {/* Dual-Role Switcher for Admins (User = Student + Admin) */}
                {role === "ADMIN" && (
                  <Link
                    href={isInAdminView ? "/student/dashboard" : "/admin/dashboard"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-[#6366F1]/15 to-[#A78BFA]/15 text-[#A78BFA] border border-[#6366F1]/40 hover:border-[#A78BFA] hover:scale-105"
                    title={
                      isInAdminView
                        ? "Switch to Student Pass View"
                        : "Switch to Admin Control Desk"
                    }
                  >
                    {isInAdminView ? (
                      <>
                        <GraduationCap className="w-4 h-4 text-[#A78BFA]" />
                        <span>Student View</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#6366F1]" />
                        <span>Admin Desk</span>
                      </>
                    )}
                  </Link>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                {/* User Info Chip */}
                <Link
                  href={dashboardLink}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1F2937] bg-[#111827] hover:bg-[#1f2937]/80 transition-all text-xs text-[#F9FAFB]"
                >
                  <User className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span className="font-medium text-[#F9FAFB] max-w-[130px] truncate">
                    {user.email}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      role === "ADMIN"
                        ? "bg-[#6366F1]/20 text-[#A78BFA] border border-[#6366F1]/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {role === "ADMIN" ? "Admin" : "Student"}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-400 hover:bg-rose-950/40 border border-rose-900/60 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-[#F9FAFB] hover:text-[#A78BFA] rounded-xl hover:bg-[#111827] border border-transparent hover:border-[#1F2937] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-[#6366F1]"
                >
                  Apply Pass
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-[#9CA3AF] hover:text-white bg-[#111827] border border-[#1F2937]"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#1F2937] bg-[#0A0F1C] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[#F9FAFB] hover:bg-[#111827] hover:text-[#A78BFA]"
            >
              🚌 Flora Campus Route
            </Link>
            <Link
              href="/#credentials"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[#F9FAFB] hover:bg-[#111827] hover:text-[#A78BFA]"
            >
              🔑 Portal Credentials
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[#F9FAFB] hover:bg-[#111827] hover:text-[#A78BFA]"
            >
              ✨ QR Verification
            </Link>
          </nav>

          <div className="pt-3 flex flex-col gap-3 border-t border-[#1F2937]">
            {user ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F9FAFB] truncate">
                      {user.email}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        role === "ADMIN"
                          ? "bg-[#6366F1]/20 text-[#A78BFA] border border-[#6366F1]/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {role}
                    </span>
                  </div>

                  {/* Dual-role link in mobile drawer */}
                  {role === "ADMIN" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1F2937]">
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#6366F1] text-white text-xs font-bold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Desk
                      </Link>
                      <Link
                        href="/student/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#111827] border border-[#6366F1]/40 text-[#A78BFA] text-xs font-bold"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Student View
                      </Link>
                    </div>
                  )}

                  {role !== "ADMIN" && (
                    <Link
                      href="/student/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#6366F1] text-white text-xs font-bold"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Student Dashboard
                    </Link>
                  )}
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-900/60 font-semibold text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-[#1F2937] bg-[#111827] text-xs font-bold text-[#F9FAFB]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#6366F1] text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  Apply Pass
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
