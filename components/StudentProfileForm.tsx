"use client";

import { useState } from "react";
import {
  User,
  Phone,
  GraduationCap,
  Building,
  Bus,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RouteItem {
  id: string;
  name: string;
  fee: number;
}

interface StudentProfileFormProps {
  initialData?: {
    fullName?: string;
    year?: string;
    branch?: string;
    mobile?: string;
    routeId?: string;
    feesPaid?: number;
  } | null;
  routes: RouteItem[];
  onSuccess: (savedProfile: any) => void;
  onCancel?: () => void;
}

export default function StudentProfileForm({
  initialData,
  routes,
  onSuccess,
  onCancel,
}: StudentProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields State
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [mobile, setMobile] = useState(initialData?.mobile || "");
  const [year, setYear] = useState(initialData?.year || "1st Year");
  const [branch, setBranch] = useState(initialData?.branch || "Computer");
  const [routeId, setRouteId] = useState(
    initialData?.routeId || (routes.length > 0 ? routes[0].id : "")
  );
  const [feesPaid, setFeesPaid] = useState<number>(initialData?.feesPaid ?? 0);

  // UI State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active Route Calculation
  const selectedRoute = routes.find((r) => r.id === routeId) || routes[0];
  const totalFee = selectedRoute ? selectedRoute.fee : 0;
  const pendingFees = Math.max(0, totalFee - (feesPaid || 0));

  // Step Validation
  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        stepErrors.fullName = "Please enter your full legal name (minimum 2 letters)";
      }
      if (!mobile.trim() || !/^[0-9]{10}$/.test(mobile.trim())) {
        stepErrors.mobile = "Mobile number must be exactly 10 numeric digits";
      }
    }

    if (step === 2) {
      if (!["1st Year", "2nd Year", "3rd Year"].includes(year)) {
        stepErrors.year = "Please choose a valid academic year";
      }
      if (!["Civil", "Mechanical", "Computer"].includes(branch)) {
        stepErrors.branch = "Please choose a valid engineering branch";
      }
    }

    if (step === 3) {
      if (!routeId) {
        stepErrors.routeId = "Please select a bus route";
      }
      if (feesPaid < 0) {
        stepErrors.feesPaid = "Fees paid cannot be negative";
      } else if (feesPaid > totalFee) {
        stepErrors.feesPaid = `Fees paid cannot exceed the route fee of ${formatCurrency(totalFee)}`;
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrorMessage("");
      setCurrentStep((prev) => Math.min(3, prev + 1));
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          year,
          branch,
          routeId,
          feesPaid: Number(feesPaid),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to save profile");
        setLoading(false);
        return;
      }

      onSuccess(data.profile);
    } catch (err: any) {
      setErrorMessage("Network error while submitting profile");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-indigo-50/70 to-slate-50 dark:from-indigo-950/30 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {initialData ? "Update Bus Pass Profile" : "Register Transport Bus Pass"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fill in your details in 3 quick steps to submit your ID pass application
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>

        {/* 3-Step Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            {[
              { num: 1, label: "Personal Info" },
              { num: 2, label: "Academic Info" },
              { num: 3, label: "Transport & Fees" },
            ].map((step) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isCurrent
                        ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / 2) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 sm:p-8">
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Step 1: Personal Details</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your identity details as registered in college records
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                    placeholder="e.g. Harshal Patil"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border ${
                      errors.fullName
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
                    } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number (10 digits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setMobile(val);
                      if (errors.mobile) setErrors({ ...errors, mobile: "" });
                    }}
                    placeholder="9876543210"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border ${
                      errors.mobile
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
                    } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-1 text-xs text-rose-500">{errors.mobile}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Academic Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Step 2: Academic Enrollment</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select your current year of study and engineering department
                </p>
              </div>

              {/* Year Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Academic Year
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["1st Year", "2nd Year", "3rd Year"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setYear(item)}
                      className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                        year === item
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
                {errors.year && <p className="mt-1 text-xs text-rose-500">{errors.year}</p>}
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Engineering Branch
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Civil", "Mechanical", "Computer"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setBranch(item)}
                      className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                        branch === item
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
                {errors.branch && (
                  <p className="mt-1 text-xs text-rose-500">{errors.branch}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Transport & Fees Details */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Bus className="w-4 h-4 text-indigo-600" />
                  <span>Step 3: Route Selection & Fee Ledger</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose your bus route and enter fees paid for live balance calculation
                </p>
              </div>

              {/* Route Dropdown with Price */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Designated Bus Route
                </label>
                <div className="relative">
                  <select
                    value={routeId}
                    onChange={(e) => {
                      setRouteId(e.target.value);
                      if (errors.routeId) setErrors({ ...errors, routeId: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border ${
                      errors.routeId
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
                    } text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-opacity-20 transition-all font-medium`}
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {formatCurrency(r.fee)}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.routeId && (
                  <p className="mt-1 text-xs text-rose-500">{errors.routeId}</p>
                )}
              </div>

              {/* Fees Paid Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Fees Paid by Student (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={totalFee}
                    value={feesPaid}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFeesPaid(isNaN(val) ? 0 : val);
                      if (errors.feesPaid) setErrors({ ...errors, feesPaid: "" });
                    }}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border ${
                      errors.feesPaid
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
                    } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-opacity-20 transition-all font-semibold`}
                  />
                </div>
                {errors.feesPaid && (
                  <p className="mt-1 text-xs text-rose-500">{errors.feesPaid}</p>
                )}
              </div>

              {/* Live Fee Calculation Summary Card */}
              <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Live Fee Calculation</span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Total Route Fee
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {formatCurrency(totalFee)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
                      Fees Paid
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {formatCurrency(feesPaid)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400 block">
                      Pending Fees
                    </span>
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                      {formatCurrency(pendingFees)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic text-center pt-1">
                  Formula: Pending ({formatCurrency(pendingFees)}) = Total ({formatCurrency(totalFee)}) - Paid ({formatCurrency(feesPaid)})
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Transport Profile</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
