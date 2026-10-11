import Link from "next/link";
import Image from "next/image";
import {
  Bus,
  ShieldCheck,
  QrCode,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ArrowRight,
  MapPin,
  Building2,
  Users,
  Navigation,
  Compass,
  Zap,
  PhoneCall,
  Calendar,
  AlertCircle,
  FileCheck,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  const boardingStops = [
    {
      stopNumber: 1,
      name: "Warje Chowk / Flyover",
      landmark: "Near Warje Flyover Junction & Mai Mangeshkar Hospital Bypass",
      badge: "Starting Point",
    },
    {
      stopNumber: 2,
      name: "Vadgaon Bridge Hub",
      landmark: "Vadgaon Phata Bridge underpass / Sinhagad Road junction",
      badge: "Transfer Hub",
    },
    {
      stopNumber: 3,
      name: "Navale Bridge",
      landmark: "Navale Bridge Highway Service Road pickup shelter",
      badge: "Highway Point",
    },
    {
      stopNumber: 4,
      name: "Narhe Phata / Chowk",
      landmark: "Narhe Main Road entrance & campus link connector",
      badge: "Student Hub",
    },
    {
      stopNumber: 5,
      name: "Bhumkar Bridge",
      landmark: "Bhumkar Chowk / Bridge Highway Terminal",
      badge: "Terminal Stop",
    },
  ];

  return (
    <div className="flex flex-col items-center w-full bg-[#0A0F1C] text-[#F9FAFB] transit-grid-bg">
      {/* Hero Section */}
      <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#1F2937]">
        {/* Atmospheric Transit Glow Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#6366F1]/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-[#A78BFA]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Official Emblem Banner */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#111827] text-[#A78BFA] border border-[#1F2937] shadow-lg mb-8 hover:border-[#6366F1]/50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 border border-[#1F2937]">
              <Image src="/logo.png" alt="Flora Logo" width={24} height={24} className="object-contain w-full h-full" />
            </div>
            <span>Flora Education Society, Pune • Official Transport Portal 2026-27</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F9FAFB] max-w-4xl mx-auto leading-[1.15]">
            Flora Institutes Campus{" "}
            <span className="bg-gradient-to-r from-[#6366F1] via-[#A78BFA] to-[#6366F1] bg-clip-text text-transparent">
              Transit & Bus Pass Portal
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-sm sm:text-lg md:text-xl text-[#9CA3AF] max-w-3xl mx-auto leading-relaxed">
            Direct dedicated campus bus transit connecting Warje, Vadgaon Bridge, Navale Bridge, Narhe, and Bhumkar Bridge to Flora Institutes. Fast digital pass applications and verified QR boarding passes.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-[#6366F1]"
            >
              <Bus className="w-4 h-4" />
              <span>Apply for Bus Pass</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-[#F9FAFB] bg-[#111827] border border-[#1F2937] hover:border-[#6366F1]/60 hover:bg-[#1f2937] shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
              <span>Student / Admin Sign In</span>
            </Link>
          </div>

          {/* Unified Transit Bus Route Cockpit */}
          <div className="mt-14 max-w-5xl mx-auto p-4 sm:p-7 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-2xl relative text-left">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#1F2937]">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 border border-[#1F2937] shadow-lg flex items-center justify-center shrink-0">
                  <Image src="/logo.png" alt="Flora Logo" width={56} height={56} className="object-contain w-full h-full" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F9FAFB] flex items-center gap-2">
                    <span>Flora Campus Fleet • Dedicated Route Bus</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6366F1]/20 text-[#A78BFA] border border-[#6366F1]/30">
                      MH-12-FL-2001
                    </span>
                  </h3>
                  <p className="text-xs text-[#9CA3AF]">
                    Unified Transit Corridor: Warje ➔ Vadgaon Bridge ➔ Navale Bridge ➔ Narhe ➔ Bhumkar Bridge ➔ Flora Campus
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Operational Route
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6366F1]/20 text-[#A78BFA] border border-[#6366F1]/30 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  5 Official Boarding Points
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800 font-bold">
                  ₹22,000 / year
                </span>
              </div>
            </div>

            {/* Visual Route Path Line Diagram */}
            <div className="pt-6 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA] block">
                Official Boarding Stop Sequence (Designated Transit Corridor)
              </span>

              {/* Sequential Route Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {boardingStops.map((stop) => (
                  <div
                    key={stop.name}
                    className="p-3.5 rounded-2xl bg-[#0A0F1C] border border-[#1F2937] hover:border-[#6366F1]/60 transition-all space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-[#6366F1]/20 text-[#A78BFA] flex items-center justify-center font-bold text-xs border border-[#6366F1]/30">
                        0{stop.stopNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-[#A78BFA] px-2 py-0.5 rounded-full bg-[#111827] border border-[#1F2937]">
                        {stop.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#F9FAFB] group-hover:text-[#A78BFA] transition-colors">
                      {stop.name}
                    </h4>

                    <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
                      {stop.landmark}
                    </p>
                  </div>
                ))}
              </div>

              {/* Destination Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#111827] to-[#111827] border border-emerald-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Final Campus Destination: Flora Education Society & Institutes, Pune</span>
                </div>
                <span className="text-[11px] text-[#A78BFA] font-medium hidden sm:block">
                  Campus Gate Station
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Credentials & Access Desk */}
      <section id="credentials" className="w-full py-16 md:py-24 border-b border-[#1F2937] bg-[#0A0F1C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] bg-[#6366F1]/10 px-3 py-1 rounded-full border border-[#6366F1]/30">
              Authorized Portal Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F9FAFB] mt-3">
              Flora Transport Portal Credentials
            </h2>
            <p className="text-sm sm:text-base text-[#9CA3AF] mt-2">
              Sign in with your registered college credentials to access your bus pass or administrative desk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Credentials Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#111827] border border-[#1F2937] hover:border-[#6366F1]/50 shadow-xl transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/20 text-[#A78BFA] flex items-center justify-center font-bold border border-[#6366F1]/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] block">
                    Student Passenger Portal
                  </span>
                  <h3 className="text-xl font-bold text-[#F9FAFB] mt-1">
                    Student Bus Pass & Digital ID
                  </h3>
                </div>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Sign in with your registered college email to view your real-time pass status, track route boarding points, verify fee payments, and access your 3D Digital Transit ID card.
                </p>
              </div>

              <div className="pt-4 border-t border-[#1F2937] flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/login"
                  className="w-full sm:w-auto flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-md shadow-indigo-600/20 transition-all border border-[#6366F1]"
                >
                  Student Sign In
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold text-[#F9FAFB] bg-[#0A0F1C] border border-[#1F2937] hover:border-[#6366F1]/60 transition-all"
                >
                  Apply for Pass
                </Link>
              </div>
            </div>

            {/* Admin Credentials Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#111827] border border-[#1F2937] hover:border-[#A78BFA]/50 shadow-xl transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center font-bold border border-[#A78BFA]/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] block">
                    Administrative Desk
                  </span>
                  <h3 className="text-xl font-bold text-[#F9FAFB] mt-1">
                    Transport Control & HOD Staff
                  </h3>
                </div>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Authorized access for Flora Institute transport officers and HOD Sir to inspect student applications, issue digital passes, record fee receipts, and configure route stops.
                </p>
              </div>

              <div className="pt-4 border-t border-[#1F2937]">
                <Link
                  href="/login"
                  className="w-full block text-center py-3 px-4 rounded-xl text-xs font-bold text-[#F9FAFB] bg-[#0A0F1C] border border-[#1F2937] hover:border-[#6366F1] hover:bg-[#111827] shadow-md transition-all"
                >
                  Admin / Staff Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Verification Callout */}
      <section id="features" className="w-full py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#111827] via-[#111827] to-[#1E1B4B] border border-[#6366F1]/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                <ShieldCheck className="w-4 h-4" />
                <span>Anti-Counterfeit Protection</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB]">
                Public QR Verification for Conductors & Gate Officers
              </h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                Every issued bus pass comes equipped with a cryptographically signed QR code. Anyone scanning it with an iPhone or Android camera is directed to <code>/verify/[idNumber]</code> to immediately validate route legitimacy and validity timestamp without needing special scanners.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] text-center shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Register as Student
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold text-[#F9FAFB] bg-[#0A0F1C] border border-[#1F2937] hover:border-[#6366F1] text-center transition-all"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
