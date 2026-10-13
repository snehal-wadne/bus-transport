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
  MapPin,
  Check,
  ShieldCheck,
  Receipt,
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
  const [routeId, setRouteId] = useState(initialData?.routeId || "");
  const [feesPaid, setFeesPaid] = useState<number>(initialData?.feesPaid ?? 0);
  const [paymentMode, setPaymentMode] = useState<string>("UPI");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paymentNote, setPaymentNote] = useState<string>("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active Route Calculation
  const selectedRoute = routes.find((r) => r.id === routeId);
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
        stepErrors.routeId = "Please select your bus route first before proceeding to payment";
      }
    }

    if (step === 4) {
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
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

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
          paymentMode: feesPaid > 0 ? paymentMode : "PAY_LATER",
          paymentRef: paymentRef.trim(),
          paymentNote: paymentNote.trim(),
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
              Fill in your details in 4 steps: Personal $\rightarrow$ Academic $\rightarrow$ Route $\rightarrow$ Payment
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

        {/* 4-Step Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            {[
              { num: 1, label: "Personal" },
              { num: 2, label: "Academic" },
              { num: 3, label: "Bus Route" },
              { num: 4, label: "Payment & Fees" },
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
                width: `${((currentStep - 1) / 3) * 100}%`,
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
                    placeholder="e.g. Harshal Wadne"
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

          {/* STEP 3: Route Selection (Asks Route First!) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Bus className="w-4 h-4 text-indigo-600" />
                  <span>Step 3: Select Your Bus Route</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick your boarding stop. Each route has its specific annual transportation fare.
                </p>
              </div>

              {/* Route Grid Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Available Campus Bus Routes & Fares
                </label>

                {routes.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                    <p className="text-sm">No bus routes configured yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {routes.map((r) => {
                      const isSelected = routeId === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setRouteId(r.id);
                            if (errors.routeId) setErrors({ ...errors, routeId: "" });
                          }}
                          className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 shadow-sm"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                <MapPin className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                                {r.name}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Annual Fee
                            </span>
                            <span
                              className={`text-sm font-extrabold ${
                                isSelected
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {formatCurrency(r.fee)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {errors.routeId && (
                  <p className="mt-2 text-xs text-rose-500">{errors.routeId}</p>
                )}
              </div>

              {/* Selected Route Confirmation Box */}
              {selectedRoute && (
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        Selected Destination
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedRoute.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Total Fee
                    </span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(selectedRoute.fee)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Payment Details & Fee Calculation (Asks Payment THEN Admin Review!) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Step 4: How Much Paid & Administrative Review
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Declare your route payment. Applications and payment receipts are verified by administration before issuing your pass.
                </p>
              </div>

              {/* Chosen Route Header Card */}
              {selectedRoute && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                        Assigned Bus Route
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedRoute.name}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Change Route
                  </button>
                </div>
              )}

              {/* How Much Paid Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    How much have you paid? (₹)
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    Total Route Fare: {formatCurrency(totalFee)}
                  </span>
                </div>

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
                    placeholder="Enter amount paid"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border ${
                      errors.feesPaid
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
                    } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-opacity-20 transition-all font-bold text-base`}
                  />
                </div>
                {errors.feesPaid && (
                  <p className="mt-1 text-xs text-rose-500">{errors.feesPaid}</p>
                )}

                {/* Quick Payment Options */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setFeesPaid(totalFee)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    Full Payment ({formatCurrency(totalFee)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeesPaid(Math.round(totalFee / 2))}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                  >
                    50% Installment ({formatCurrency(Math.round(totalFee / 2))})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeesPaid(0)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Pay Later at Counter (₹0)
                  </button>
                </div>
              </div>

              {/* Payment Details when feesPaid > 0 */}
              {feesPaid > 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Payment Mode
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "UPI", label: "UPI / QR", desc: "GPay, PhonePe, Paytm" },
                        { id: "CASH", label: "Cash Desk", desc: "Campus accounts counter" },
                        { id: "NETBANKING", label: "Bank Transfer", desc: "NEFT / RTGS / IMPS" },
                        { id: "CHEQUE_DD", label: "DD / Cheque", desc: "Bank Draft" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMode(m.id)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            paymentMode === m.id
                              ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 dark:text-indigo-200"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs font-bold block">{m.label}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction Reference ID / UTR / Receipt No.
                    </label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. UTR 428190829102 or Receipt #502"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Entering the transaction reference helps the admin quickly verify and approve your pass.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Note / Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="e.g. Paid at campus counter on 12th Oct"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    You selected <strong>₹0 (Pay Later)</strong>. Your bus route registration will be submitted for administrative review, and you can clear your route fee in person at the campus counter.
                  </span>
                </div>
              )}

              {/* Real-Time Fee Calculation Summary Card */}
              <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Real-Time Fee Calculation</span>
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

              {/* Administrative Review Protocol Notice Banner */}
              <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                    Under Administrative Review Protocol
                  </span>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                    Once submitted, your declared payment ({formatCurrency(feesPaid)}) and selected bus route will be sent directly to the Transport Administration desk. Transport officers review and reconcile your payment before activating your official Digital Bus ID Pass.
                  </p>
                </div>
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

            {currentStep < 4 ? (
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
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application for Admin Review</span>
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
