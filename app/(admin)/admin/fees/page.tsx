"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Receipt,
  Clock,
  History,
  Loader2,
  Calendar,
  Banknote,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentLog {
  id: string;
  amount: number;
  date: string;
  note?: string | null;
  createdAt: string;
}

interface StudentLedger {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  year: string;
  branch: string;
  route?: {
    id: string;
    name: string;
    fee: number;
  } | null;
  totalFee: number;
  feesPaid: number;
  pendingFees: number;
  isCleared: boolean;
  payments: PaymentLog[];
}

export default function AdminFeesPage() {
  const [ledgers, setLedgers] = useState<StudentLedger[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentLedger | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentNote, setPaymentNote] = useState<string>("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Payment History Drawer/Modal State
  const [historyStudent, setHistoryStudent] = useState<StudentLedger | null>(null);

  const fetchLedgers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (res.ok) {
        setLedgers(data.ledgers || []);
        setStats(data.stats || null);
      } else {
        setErrorNotice(data.error || "Failed to load fee ledger");
      }
    } catch (err: any) {
      setErrorNotice("Network error while loading fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  const openPaymentModal = (student: StudentLedger) => {
    setSelectedStudent(student);
    // Default to the remaining pending amount or standard amount
    setPaymentAmount(student.pendingFees > 0 ? student.pendingFees.toString() : "");
    setPaymentNote("");
    setPaymentError("");
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setPaymentError("Please enter a valid payment amount greater than zero");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: parsedAmount,
          note: paymentNote.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error || "Failed to record payment");
        setPaymentLoading(false);
        return;
      }

      setSuccessNotice(data.message || "Payment recorded successfully!");
      setIsPaymentModalOpen(false);
      fetchLedgers();
    } catch (err: any) {
      setPaymentError("Network error while recording payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const filteredLedgers = ledgers.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.mobile.includes(q) ||
      (item.route?.name && item.route.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2937]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">
            Student Transport Fee Ledger
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Track student fee balances, inspect payment history, and record manual fee receipts.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] block">
              Enrolled Students
            </span>
            <span className="text-2xl font-bold text-[#F9FAFB] mt-1 block">
              {stats.totalStudents}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A78BFA] block">
              Total Route Dues
            </span>
            <span className="text-2xl font-bold text-[#A78BFA] mt-1 block">
              {formatCurrency(stats.totalRevenueExpected)}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block">
              Fees Collected
            </span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              {formatCurrency(stats.totalCollected)}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 block">
              Total Pending Dues
            </span>
            <span className="text-2xl font-bold text-rose-400 mt-1 block">
              {formatCurrency(stats.totalPending)}
            </span>
          </div>
        </div>
      )}

      {/* Notices */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice("")}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={() => setErrorNotice("")}
            className="text-rose-400 hover:text-rose-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, email, or route..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1F2937] shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
          </div>
        ) : filteredLedgers.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-[#6366F1]" />
            <p className="text-sm font-semibold text-[#F9FAFB]">No student fee records found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0F1C] border-b border-[#1F2937] text-[#9CA3AF] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Enrolled Route</th>
                    <th className="px-5 py-3.5 text-right">Total Fee</th>
                    <th className="px-5 py-3.5 text-right">Fees Paid</th>
                    <th className="px-5 py-3.5 text-right">Pending Balance</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {filteredLedgers.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-[#1f2937]/50 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-[#F9FAFB] block text-sm">
                            {student.fullName}
                          </span>
                          <span className="text-[#9CA3AF] text-[11px] block">
                            {student.year} • {student.branch} • +91 {student.mobile}
                          </span>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#F9FAFB]">
                          {student.route?.name || "Not Assigned"}
                        </span>
                      </td>

                      {/* Total Fee */}
                      <td className="px-5 py-4 text-right font-semibold text-[#F9FAFB]">
                        {formatCurrency(student.totalFee)}
                      </td>

                      {/* Fees Paid */}
                      <td className="px-5 py-4 text-right font-bold text-emerald-400">
                        {formatCurrency(student.feesPaid)}
                      </td>

                      {/* Pending Fees */}
                      <td className="px-5 py-4 text-right font-extrabold">
                        {student.pendingFees === 0 ? (
                          <span className="text-emerald-400">
                            {formatCurrency(0)}
                          </span>
                        ) : (
                          <span className="text-rose-400">
                            {formatCurrency(student.pendingFees)}
                          </span>
                        )}
                      </td>

                      {/* Status Badge: green if cleared, red if pending */}
                      <td className="px-5 py-4 text-center">
                        {student.isCleared ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Cleared</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-950/70 text-rose-300 border border-rose-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {student.payments.length > 0 && (
                            <button
                              onClick={() => setHistoryStudent(student)}
                              type="button"
                              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#A78BFA] hover:bg-[#1f2937]"
                              title="View Payment Logs"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => openPaymentModal(student)}
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-sm"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Record Payment</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive KPI Cards */}
            <div className="md:hidden divide-y divide-[#1F2937]">
              {filteredLedgers.map((student) => (
                <div key={student.id} className="p-4 space-y-3 hover:bg-[#1f2937]/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-[#F9FAFB] text-sm block">
                        {student.fullName}
                      </span>
                      <span className="text-[#9CA3AF] text-xs block mt-0.5">
                        {student.year} • {student.branch} • +91 {student.mobile}
                      </span>
                      <span className="text-[11px] text-[#A78BFA] font-medium block mt-1">
                        🚌 {student.route?.name || "Not Assigned"}
                      </span>
                    </div>

                    {student.isCleared ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Cleared</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800 shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Fee KPI Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0A0F1C] border border-[#1F2937] text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block">Total</span>
                      <span className="text-xs font-bold text-[#F9FAFB] mt-0.5 block">
                        {formatCurrency(student.totalFee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">Paid</span>
                      <span className="text-xs font-extrabold text-emerald-400 mt-0.5 block">
                        {formatCurrency(student.feesPaid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-400 block">Due</span>
                      <span
                        className={`text-xs font-extrabold mt-0.5 block ${
                          student.pendingFees === 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {formatCurrency(student.pendingFees)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {student.payments.length > 0 && (
                      <button
                        onClick={() => setHistoryStudent(student)}
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-[#A78BFA] bg-[#0A0F1C] border border-[#1F2937]"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Logs ({student.payments.length})</span>
                      </button>
                    )}

                    <button
                      onClick={() => openPaymentModal(student)}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-sm transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-[#1F2937] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-[#F9FAFB]">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F9FAFB]">
                  Record Student Payment
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {selectedStudent.fullName} • {selectedStudent.route?.name}
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Overview */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0A0F1C] border border-[#1F2937] text-xs">
              <div>
                <span className="text-[#9CA3AF] block">Total Route Fee</span>
                <span className="font-semibold text-[#F9FAFB]">
                  {formatCurrency(selectedStudent.totalFee)}
                </span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block">Current Pending</span>
                <span className="font-bold text-rose-400">
                  {formatCurrency(selectedStudent.pendingFees)}
                </span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Amount Received (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF] font-semibold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[#0A0F1C] border border-[#1F2937] text-[#F9FAFB] outline-none focus:border-[#6366F1] font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Reference Note / Receipt #
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Cash Receipt #402, GPay UPI Ref 928374"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0F1C] border border-[#1F2937] text-[#F9FAFB] outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-white bg-[#0A0F1C] border border-[#1F2937]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#6366F1] hover:bg-[#4f46e5] disabled:opacity-60"
                >
                  {paymentLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-[#1F2937] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col text-[#F9FAFB]">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F9FAFB]">
                  Payment History Log
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {historyStudent.fullName} ({historyStudent.route?.name})
                </p>
              </div>
              <button
                onClick={() => setHistoryStudent(null)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {historyStudent.payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-[#0A0F1C] border border-[#1F2937] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-[#F9FAFB] block">
                      {p.note || "Fee Payment"}
                    </span>
                    <span className="text-[#9CA3AF] flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(p.date || p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    +{formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#1F2937] flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0A0F1C] border border-[#1F2937] text-[#9CA3AF] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
