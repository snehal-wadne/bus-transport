"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Phone,
  Mail,
  GraduationCap,
  Bus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  X,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StudentRecord {
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
  feesPaid: number;
  totalFee: number;
  pendingFees: number;
  isCleared: boolean;
  status: "APPROVED" | "PENDING" | "REJECTED" | "NOT_SUBMITTED";
  digitalIdNumber?: string | null;
  createdAt: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [routes, setRoutes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState<"name" | "feesPaid" | "pendingFees" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selected Student Drawer
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [issuingId, setIssuingId] = useState(false);
  const [issueNotice, setIssueNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Fee Management in Drawer
  const [payAmount, setPayAmount] = useState<string>("");
  const [payNote, setPayNote] = useState<string>("");
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [editTotalMode, setEditTotalMode] = useState(false);
  const [customTotalPaid, setCustomTotalPaid] = useState<string>("");

  const openStudentDrawer = (s: StudentRecord) => {
    setSelectedStudent(s);
    setPayAmount(s.pendingFees > 0 ? s.pendingFees.toString() : "");
    setCustomTotalPaid(s.feesPaid.toString());
    setPayNote("");
    setPaymentFeedback(null);
    setIssueNotice(null);
    setEditTotalMode(false);
  };

  const [deletingStudent, setDeletingStudent] = useState(false);

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this student account? This will remove all their pass requests, digital pass, payments, and account data.")) {
      return;
    }
    setDeletingStudent(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedStudent(null);
        fetchStudents();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete student account");
      }
    } catch (err) {
      alert("Network error while deleting student account");
    } finally {
      setDeletingStudent(false);
    }
  };

  const handleRecordPaymentInDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPaymentFeedback({ type: "error", msg: "Please enter a valid amount greater than ₹0." });
      return;
    }
    setRecordingPayment(true);
    setPaymentFeedback(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: amountNum,
          note: payNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentFeedback({ type: "error", msg: data.error || "Failed to record payment." });
      } else {
        const newPaid = selectedStudent.feesPaid + amountNum;
        const newPending = Math.max(0, selectedStudent.totalFee - newPaid);
        const isCleared = newPending === 0;

        setSelectedStudent({
          ...selectedStudent,
          feesPaid: newPaid,
          pendingFees: newPending,
          isCleared,
        });

        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id
              ? { ...s, feesPaid: newPaid, pendingFees: newPending, isCleared }
              : s
          )
        );

        setPayAmount(newPending > 0 ? newPending.toString() : "");
        setPayNote("");
        setCustomTotalPaid(newPaid.toString());
        setPaymentFeedback({
          type: "success",
          msg: `Payment of ₹${amountNum.toLocaleString("en-IN")} recorded! Student profile updated.`,
        });
      }
    } catch (err) {
      setPaymentFeedback({ type: "error", msg: "Network error while saving payment." });
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleAdjustTotalPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const totalNum = parseFloat(customTotalPaid);
    if (isNaN(totalNum) || totalNum < 0) {
      setPaymentFeedback({ type: "error", msg: "Please enter a valid positive number for total fees paid." });
      return;
    }
    setRecordingPayment(true);
    setPaymentFeedback(null);
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feesPaid: totalNum,
          paymentNote: payNote.trim() || "Admin direct fee adjustment",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentFeedback({ type: "error", msg: data.error || "Failed to adjust fee." });
      } else {
        const newPending = Math.max(0, selectedStudent.totalFee - totalNum);
        const isCleared = newPending === 0;

        setSelectedStudent({
          ...selectedStudent,
          feesPaid: totalNum,
          pendingFees: newPending,
          isCleared,
        });

        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id
              ? { ...s, feesPaid: totalNum, pendingFees: newPending, isCleared }
              : s
          )
        );

        setPayAmount(newPending > 0 ? newPending.toString() : "");
        setEditTotalMode(false);
        setPaymentFeedback({
          type: "success",
          msg: `Total fees paid adjusted to ₹${totalNum.toLocaleString("en-IN")}. Student profile updated!`,
        });
      }
    } catch (err) {
      setPaymentFeedback({ type: "error", msg: "Network error while adjusting fee." });
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleDirectIssuePass = async (studentId: string) => {
    setIssuingId(true);
    setIssueNotice(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/issue-id`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setIssueNotice({ type: "error", msg: data.error || "Failed to generate pass." });
      } else {
        setIssueNotice({ type: "success", msg: data.message });
        if (data.digitalId) {
          setStudents((prev) =>
            prev.map((s) =>
              s.id === studentId
                ? { ...s, digitalIdNumber: data.digitalId.idNumber, status: "APPROVED" }
                : s
            )
          );
          if (selectedStudent && selectedStudent.id === studentId) {
            setSelectedStudent({
              ...selectedStudent,
              digitalIdNumber: data.digitalId.idNumber,
              status: "APPROVED",
            });
          }
        }
      }
    } catch (err) {
      setIssueNotice({ type: "error", msg: "Network error while issuing pass." });
    } finally {
      setIssuingId(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [ledgersRes, routesRes] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/routes"),
      ]);

      const ledgersData = await ledgersRes.json();
      const routesData = await routesRes.json();

      if (ledgersRes.ok && ledgersData.ledgers) {
        // Also query requests to get status
        const reqRes = await fetch("/api/admin/requests?limit=100");
        const reqData = await reqRes.json();
        const requestMap = new Map<string, any>();

        if (reqRes.ok && reqData.requests) {
          reqData.requests.forEach((r: any) => {
            requestMap.set(r.student.id, r);
          });
        }

        const enrichedStudents: StudentRecord[] = ledgersData.ledgers.map((s: any) => {
          const reqInfo = requestMap.get(s.id);
          return {
            ...s,
            status: reqInfo ? reqInfo.status : s.isCleared ? "APPROVED" : "NOT_SUBMITTED",
            digitalIdNumber: reqInfo?.student?.digitalId?.idNumber || null,
            createdAt: s.payments?.[0]?.createdAt || new Date().toISOString(),
          };
        });

        setStudents(enrichedStudents);
      }

      if (routesRes.ok && routesData.routes) {
        setRoutes(routesData.routes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/admin/export/students");
      if (!response.ok) throw new Error("CSV export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Students-Transport-Export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to export students CSV.");
    } finally {
      setExporting(false);
    }
  };

  // Toggle Sorting
  const toggleSort = (field: "name" | "feesPaid" | "pendingFees" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Filter & Sort Logic
  const filteredStudents = students
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.mobile.includes(q);

      const matchesYear = !selectedYear || s.year === selectedYear;
      const matchesBranch = !selectedBranch || s.branch === selectedBranch;
      const matchesRoute = !selectedRoute || s.route?.id === selectedRoute;

      return matchesSearch && matchesYear && matchesBranch && matchesRoute;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === "name") {
        comp = a.fullName.localeCompare(b.fullName);
      } else if (sortBy === "feesPaid") {
        comp = a.feesPaid - b.feesPaid;
      } else if (sortBy === "pendingFees") {
        comp = a.pendingFees - b.pendingFees;
      } else if (sortBy === "date") {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === "asc" ? comp : -comp;
    });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2937]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">
            Enrolled Student Directory
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Complete database of student passengers, class distributions, route allocations, and live fee dues.
          </p>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          disabled={exporting || students.length === 0}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 self-start sm:self-auto border border-[#6366F1]"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          <span>Export Students (CSV)</span>
        </button>
      </div>

      {/* Search & Multi-Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, or mobile..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
          />
        </div>

        {/* Year Filter */}
        <div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-[#F9FAFB] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
          >
            <option value="">All Academic Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
          </select>
        </div>

        {/* Branch Filter */}
        <div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-[#F9FAFB] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
          >
            <option value="">All Engineering Branches</option>
            <option value="Computer">Computer</option>
            <option value="Civil">Civil</option>
            <option value="Mechanical">Mechanical</option>
          </select>
        </div>

        {/* Route Filter */}
        <div>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-[#F9FAFB] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
          >
            <option value="">All Bus Routes</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1F2937] shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-[#9CA3AF]">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#6366F1]" />
            <h3 className="text-base font-semibold text-[#F9FAFB]">
              No Student Records Match
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Try adjusting your search query, class year, branch, or route filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0F1C] border-b border-[#1F2937] text-[#9CA3AF] uppercase tracking-wider font-semibold">
                  <tr>
                    <th
                      onClick={() => toggleSort("name")}
                      className="px-5 py-3.5 cursor-pointer hover:text-[#6366F1] transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Student</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5">Academic Enrollment</th>
                    <th className="px-5 py-3.5">Assigned Route</th>
                    <th
                      onClick={() => toggleSort("feesPaid")}
                      className="px-5 py-3.5 text-right cursor-pointer hover:text-[#6366F1] transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Fees Paid</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort("pendingFees")}
                      className="px-5 py-3.5 text-right cursor-pointer hover:text-[#6366F1] transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Pending</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[#1f2937]/50 transition-colors"
                    >
                      {/* Student Name & Email */}
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-[#F9FAFB] block text-sm">
                            {s.fullName}
                          </span>
                          <span className="text-[#9CA3AF] text-[11px] block truncate max-w-[200px]">
                            {s.email}
                          </span>
                        </div>
                      </td>

                      {/* Class & Branch */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#F9FAFB] block">
                          {s.branch} Engineering
                        </span>
                        <span className="text-[11px] text-[#9CA3AF] block">{s.year}</span>
                      </td>

                      {/* Route */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-[#F9FAFB] block">
                          {s.route?.name || "Unassigned"}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF]">
                          {formatCurrency(s.totalFee)}/yr
                        </span>
                      </td>

                      {/* Paid */}
                      <td className="px-5 py-4 text-right font-bold text-emerald-400">
                        {formatCurrency(s.feesPaid)}
                      </td>

                      {/* Pending */}
                      <td className="px-5 py-4 text-right font-extrabold">
                        {s.pendingFees === 0 ? (
                          <span className="text-emerald-400">₹0</span>
                        ) : (
                          <span className="text-rose-400">
                            {formatCurrency(s.pendingFees)}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4 text-center">
                        {s.isCleared ? (
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

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openStudentDrawer(s)}
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#A78BFA] hover:bg-[#1f2937] border border-transparent hover:border-[#6366F1]/40"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive KPI Cards */}
            <div className="md:hidden divide-y divide-[#1F2937]">
              {filteredStudents.map((s) => (
                <div key={s.id} className="p-4 space-y-3 hover:bg-[#1f2937]/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-[#F9FAFB] text-sm block">
                        {s.fullName}
                      </span>
                      <span className="text-[#9CA3AF] text-xs block mt-0.5">
                        {s.year} • {s.branch} Engineering
                      </span>
                      <span className="text-[#9CA3AF]/70 text-[11px] block truncate max-w-[200px]">
                        {s.email}
                      </span>
                    </div>

                    {s.isCleared ? (
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

                  {/* Route & Fee KPI Metric Tiles */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0A0F1C] border border-[#1F2937] text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block">Total Fee</span>
                      <span className="text-xs font-bold text-[#F9FAFB] mt-0.5 block">
                        {formatCurrency(s.totalFee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">Paid</span>
                      <span className="text-xs font-extrabold text-emerald-400 mt-0.5 block">
                        {formatCurrency(s.feesPaid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-400 block">Balance</span>
                      <span
                        className={`text-xs font-extrabold mt-0.5 block ${
                          s.pendingFees > 0 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {formatCurrency(s.pendingFees)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#A78BFA] font-medium truncate max-w-[170px]">
                      🚌 {s.route?.name || "Unassigned"}
                    </span>
                    <button
                      onClick={() => openStudentDrawer(s)}
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-sm transition-all"
                    >
                      Inspect & Fees
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Student Detail Slide-Over */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border-l border-[#1F2937] h-full p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 text-[#F9FAFB]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA]">
                    Student Information Desk
                  </span>
                  <h3 className="text-xl font-bold text-[#F9FAFB] mt-0.5">
                    {selectedStudent.fullName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-lg text-[#9CA3AF] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedStudent.digitalIdNumber && (
                <div className="p-3.5 rounded-xl bg-[#0A0F1C] border border-[#6366F1]/40 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] block">
                      Active Digital Transit ID
                    </span>
                    <span className="font-mono font-bold text-sm text-[#F9FAFB]">
                      {selectedStudent.digitalIdNumber}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Contact & Profile
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#0A0F1C] border border-[#1F2937] flex justify-between">
                    <span className="text-[#9CA3AF]">Email:</span>
                    <span className="font-semibold text-[#F9FAFB]">
                      {selectedStudent.email}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A0F1C] border border-[#1F2937] flex justify-between">
                    <span className="text-[#9CA3AF]">Mobile:</span>
                    <span className="font-semibold text-[#F9FAFB]">
                      +91 {selectedStudent.mobile}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A0F1C] border border-[#1F2937] flex justify-between">
                    <span className="text-[#9CA3AF]">Enrollment:</span>
                    <span className="font-semibold text-[#F9FAFB]">
                      {selectedStudent.year} • {selectedStudent.branch}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Bus Route & Fee Ledger
                </h4>
                <div className="p-4 rounded-xl bg-[#0A0F1C] border border-[#1F2937] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Assigned Route:</span>
                    <span className="font-bold text-[#F9FAFB]">
                      {selectedStudent.route?.name || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Total Route Fare:</span>
                    <span className="font-semibold text-[#F9FAFB]">
                      {formatCurrency(selectedStudent.totalFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-semibold">Fees Paid:</span>
                    <span className="font-bold text-emerald-400">
                      {formatCurrency(selectedStudent.feesPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#1F2937] text-sm">
                    <span className="font-semibold text-[#F9FAFB]">
                      Pending Dues:
                    </span>
                    <span
                      className={`font-extrabold ${
                        selectedStudent.pendingFees > 0
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {formatCurrency(selectedStudent.pendingFees)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Update & Payment Console */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#0A0F1C] border border-[#6366F1]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#A78BFA]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F9FAFB]">
                      Record Payment / Update Dues
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTotalMode(!editTotalMode);
                      setPaymentFeedback(null);
                    }}
                    className="text-[10px] text-[#A78BFA] hover:text-white underline font-medium"
                  >
                    {editTotalMode ? "← Quick Payment" : "✎ Adjust Total"}
                  </button>
                </div>

                {paymentFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      paymentFeedback.type === "success"
                        ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950/40 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {paymentFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{paymentFeedback.msg}</span>
                  </div>
                )}

                {!editTotalMode ? (
                  <form onSubmit={handleRecordPaymentInDrawer} className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-semibold text-[#9CA3AF]">
                          Amount Paid by Student (₹)
                        </label>
                        {selectedStudent.pendingFees > 0 && (
                          <button
                            type="button"
                            onClick={() => setPayAmount(selectedStudent.pendingFees.toString())}
                            className="text-[10px] text-[#A78BFA] hover:text-white font-bold"
                          >
                            Full Balance (₹{selectedStudent.pendingFees.toLocaleString("en-IN")})
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#9CA3AF] text-xs font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={selectedStudent.totalFee}
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          placeholder="e.g. 10000"
                          className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-white font-bold outline-none focus:border-[#6366F1]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1">
                        Receipt / Reference Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={payNote}
                        onChange={(e) => setPayNote(e.target.value)}
                        placeholder="e.g. Cash Receipt #402, GPay UPI Ref 928374"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-white outline-none focus:border-[#6366F1]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recordingPayment || !payAmount}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all disabled:opacity-60"
                    >
                      {recordingPayment ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Payment...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Payment & Sync Profile</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAdjustTotalPaid} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1">
                        Override Total Fees Paid (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#9CA3AF] text-xs font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={selectedStudent.totalFee}
                          value={customTotalPaid}
                          onChange={(e) => setCustomTotalPaid(e.target.value)}
                          placeholder="Total fees paid"
                          className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-white font-bold outline-none focus:border-[#6366F1]"
                        />
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">
                        Total Route Fee: ₹{selectedStudent.totalFee.toLocaleString("en-IN")}. Pending will adjust automatically.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1">
                        Reason for Manual Adjustment
                      </label>
                      <input
                        type="text"
                        value={payNote}
                        onChange={(e) => setPayNote(e.target.value)}
                        placeholder="e.g. Corrected ledger entry"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-[#111827] border border-[#1F2937] text-white outline-none focus:border-[#6366F1]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recordingPayment || customTotalPaid === ""}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-md transition-all disabled:opacity-60"
                    >
                      {recordingPayment ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating Total Paid...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Save Total Fees Paid</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
              {/* Direct Issue Pass Actions */}
              <div className="pt-2 space-y-3">
                {issueNotice && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      issueNotice.type === "success"
                        ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950/40 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {issueNotice.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{issueNotice.msg}</span>
                  </div>
                )}

                {selectedStudent.digitalIdNumber ? (
                  <div className="p-3.5 rounded-xl bg-[#0A0F1C] border border-[#6366F1]/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#A78BFA] font-bold uppercase block">
                          Pass Active & Verified
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {selectedStudent.digitalIdNumber}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`/verify/${selectedStudent.digitalIdNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4f46e5] text-white font-bold text-xs shadow-sm transition-all"
                    >
                      View Live Pass
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={issuingId}
                    onClick={() => handleDirectIssuePass(selectedStudent.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#A78BFA] hover:opacity-90 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {issuingId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Issuing Transit ID...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Generate & Issue Digital ID Pass</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[#1F2937] flex items-center justify-between">
              <button
                type="button"
                disabled={deletingStudent}
                onClick={() => handleDeleteStudent(selectedStudent.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 transition-all disabled:opacity-50"
              >
                {deletingStudent ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setIssueNotice(null);
                }}
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
