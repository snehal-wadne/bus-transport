import Link from "next/link";
import Image from "next/image";
import { Bus, MapPin, Phone, Mail, ShieldAlert, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1F2937] bg-[#0A0F1C] text-[#9CA3AF] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#1F2937] flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="Flora Institutes Logo"
                  width={36}
                  height={36}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <span className="font-extrabold text-base text-[#F9FAFB] block">
                  Flora Institutes
                </span>
                <span className="text-[10px] text-[#A78BFA] font-semibold block -mt-0.5">
                  Flora Education Society, Pune
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[#9CA3AF]">
              Official campus transportation and bus fleet management system. Fast digital pass generation, QR verification, and automated route allocations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#F9FAFB] mb-3 text-xs uppercase tracking-wider">
              Student Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-[#A78BFA] transition-colors">
                  Apply for Bus Pass
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#A78BFA] transition-colors">
                  Track ID Request Status
                </Link>
              </li>
              <li>
                <Link href="/#routes" className="hover:text-[#A78BFA] transition-colors">
                  Bus Routes & Schedules
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#A78BFA] transition-colors">
                  Download Digital ID Pass
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration */}
          <div>
            <h4 className="font-bold text-[#F9FAFB] mb-3 text-xs uppercase tracking-wider">
              Administration & Staff
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-[#A78BFA] transition-colors">
                  Transport Admin Login
                </Link>
              </li>
              <li>
                <Link href="/admin/admins" className="hover:text-[#A78BFA] transition-colors">
                  Admin & HOD Staff Desk
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-[#A78BFA] transition-colors">
                  Server Health Check
                </Link>
              </li>
              <li>
                <span className="text-[#9CA3AF]/60">
                  Campus Fleet: Warje • Vadgaon • Bhumkar
                </span>
              </li>
            </ul>
          </div>

          {/* Helpdesk */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#F9FAFB] mb-3 text-xs uppercase tracking-wider">
              Campus Transport Helpdesk
            </h4>
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <MapPin className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
              <span>Flora Institutes Campus, Pune</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <Phone className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <Mail className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
              <span>transport@flora.edu.in</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#9CA3AF]">
          <p>© {new Date().getFullYear()} Flora Education Society, Pune. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-[#A78BFA]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital ID & QR Verification System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
