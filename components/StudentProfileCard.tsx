"use client";

import {
  User,
  GraduationCap,
  Bus,
  Phone,
  CreditCard,
  Edit3,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Building,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StudentProfileCardProps {
  profile: {
    id: string;
    fullName: string;
    year: string;
    branch: string;
    mobile: string;
    route?: {
      id: string;
      name: string;
      fee: number;
    } | null;
    feesPaid: number;
    totalFee: number;
    pendingFees: number;
    isApproved?: boolean;
    latestRequest?: {
      status: "PENDING" | "APPROVED" | "REJECTED";
      adminRemark?: string | null;
    } | null;
  };
  onEdit: () => void;
}

export default function StudentProfileCard({
  profile,
  onEdit,
}: StudentProfileCardProps) {
  const status = profile.latestRequest?.status;
  const isApproved = status === "APPROVED";

  return (
    <div className="space-y-6">
      {/* Top Banner & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Registered Transport Profile
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {profile.fullName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {profile.year} • {profile.branch} Engineering
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {status === "APPROVED" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" /> Pass Approved
            </span>
          )}
          {status === "PENDING" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="w-4 h-4" /> Verification Pending
            </span>
          )}
          {status === "REJECTED" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <XCircle className="w-4 h-4" /> Request Rejected
            </span>
          )}
          {!status && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Profile Saved
            </span>
          )}

          {/* Edit Button (disabled if approved) */}
          <button
            onClick={onEdit}
            disabled={isApproved}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {isApproved && (
        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Your bus pass is verified and approved. Details are locked to prevent tampering. Access your verified Digital ID Card below.
          </span>
        </div>
      )}

      {status === "PENDING" && (
        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-bold block text-sm">Application Under Administrative Review</span>
            <span className="text-amber-800 dark:text-amber-300 mt-0.5 block leading-relaxed">
              Your bus pass application for <strong>{profile.route?.name || "selected route"}</strong> with a declared payment of <strong>{formatCurrency(profile.feesPaid)}</strong> has been submitted. The transport department will review and reconcile your payment before activating your official bus pass.
            </span>
          </div>
        </div>
      )}

      {/* Grid: Details and Live Fees Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal & Academic Details Card */}
        <div className="md:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Student Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Full Legal Name
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {profile.fullName}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Contact Mobile
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                +91 {profile.mobile}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Academic Year
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                {profile.year}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Engineering Branch
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                {profile.branch} Engineering
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Assigned Bus Route
                </span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {profile.route?.name || "No Route Selected"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Annual Route Fare</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
                {formatCurrency(profile.totalFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Fees Summary Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Transport Fee Ledger</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Route Fare:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(profile.totalFee)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Fees Paid by Student:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(profile.feesPaid)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Fees Pending:
                </span>
                <span
                  className={`font-extrabold text-base ${
                    profile.pendingFees > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatCurrency(profile.pendingFees)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold block text-slate-700 dark:text-slate-300">
                Formula Rule:
              </span>
              Pending Fees = Route Fee ({formatCurrency(profile.totalFee)}) - Paid ({formatCurrency(profile.feesPaid)})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
