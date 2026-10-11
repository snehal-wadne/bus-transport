"use client";

import { useState } from "react";
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Loader2,
  Info,
} from "lucide-react";

interface IDRequestTrackerProps {
  request: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminRemark?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  isProfileComplete: boolean;
  onRequestSubmit: () => void;
  onEditProfile: () => void;
}

export default function IDRequestTracker({
  request,
  isProfileComplete,
  onRequestSubmit,
  onEditProfile,
}: IDRequestTrackerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const handleRequestSubmit = async () => {
    if (!isProfileComplete) return;

    setSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to submit ID request");
        setSubmitting(false);
        return;
      }

      setActionSuccess(data.message || "Pass request submitted successfully!");
      onRequestSubmit();
    } catch (err: any) {
      setActionError("Network error while submitting pass request");
    } finally {
      setSubmitting(false);
    }
  };

  const status = request?.status;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Digital Pass Authorization Hub
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Bus Pass Verification Workflow
          </h3>
        </div>

        {/* Status Colored Badge */}
        <div>
          {status === "PENDING" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Under Review</span>
            </span>
          )}
          {status === "APPROVED" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pass Approved</span>
            </span>
          )}
          {status === "REJECTED" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Request Rejected</span>
            </span>
          )}
          {!status && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <span>Ready for Submission</span>
            </span>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Animated 3-Node Status Pipeline */}
      <div className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1: Submission */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              request
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  request
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {request ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Application Submitted
                </span>
                <span className="text-[10px] text-slate-500">
                  {request ? "Details registered" : "Awaiting request"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Student profile, route preference, and fee ledger submitted to the transport cell.
            </p>
          </div>

          {/* Step 2: Under Review */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              status === "PENDING"
                ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400/20"
                : status === "APPROVED"
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
                : status === "REJECTED"
                ? "bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  status === "PENDING"
                    ? "bg-amber-500 text-white animate-pulse"
                    : status === "APPROVED"
                    ? "bg-emerald-600 text-white"
                    : status === "REJECTED"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {status === "APPROVED" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : status === "REJECTED" ? (
                  <XCircle className="w-4 h-4" />
                ) : status === "PENDING" ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  "2"
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {status === "REJECTED" ? "Application Rejected" : "Administrative Review"}
                </span>
                <span className="text-[10px] text-slate-500">
                  {status === "PENDING"
                    ? "Verification in progress"
                    : status === "APPROVED"
                    ? "Officer verified"
                    : status === "REJECTED"
                    ? "Action required"
                    : "Step 2"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Transport Desk verifies fee payment receipt, seat quota, and college enrollment.
            </p>
          </div>

          {/* Step 3: Approved / Digital Pass */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              status === "APPROVED"
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  status === "APPROVED"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Digital ID Pass Issued
                </span>
                <span className="text-[10px] text-slate-500">
                  {status === "APPROVED" ? "Ready to download" : "Pending approval"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Unique ID generated with authentic QR verification and serverless PDF download.
            </p>
          </div>
        </div>
      </div>

      {/* REJECTION CALLOUT BANNER WITH ADMIN REMARK & RESUBMIT OPTION */}
      {status === "REJECTED" && (
        <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Application Rejected by Transport Administration
              </h4>
              <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-800/80">
                <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider block">
                  Officer&apos;s Remark:
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                  &ldquo;{request?.adminRemark || "Payment receipt or enrollment details could not be validated. Please check and correct your profile details."}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-rose-200/60 dark:border-rose-900/60">
            <p className="text-xs text-rose-700 dark:text-rose-300">
              You can modify your profile details and resubmit your pass request immediately.
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onEditProfile}
                type="button"
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100/50 transition-colors"
              >
                Edit Profile First
              </button>
              <button
                onClick={handleRequestSubmit}
                disabled={submitting}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Resubmit Request</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INITIAL SUBMISSION ACTION (WHEN NO ACTIVE REQUEST EXISTS) */}
      {!request && (
        <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ready to submit your application?</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isProfileComplete
                ? "Your transport profile is fully completed. Request your digital ID to begin review."
                : "⚠️ Please fill all required fields in your profile (Personal, Academic, Route) to activate this button."}
            </p>
          </div>

          <button
            onClick={handleRequestSubmit}
            disabled={!isProfileComplete || submitting}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Request Digital ID</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* PENDING NOTIFICATION BANNER */}
      {status === "PENDING" && request && (
        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Your application was submitted on{" "}
            {new Date(request.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            and is actively under administrative verification. You will be notified here as soon as the transport officer completes verification.
          </span>
        </div>
      )}
    </div>
  );
}
