"use client";

import { useEffect, useState } from "react";
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  User,
  GraduationCap,
  Bus,
  Phone,
  CreditCard,
  Building,
  Loader2,
  Calendar,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RequestItem {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminRemark?: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
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
    digitalId?: {
      id: string;
      idNumber: string;
      issuedAt: string;
    } | null;
    payments?: Array<{
      id: string;
      amount: number;
      date: string;
      note?: string | null;
      createdAt: string;
    }>;
  };
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [counts, setCounts] = useState({ all: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [routes, setRoutes] = useState<{ id: string; name: string }[]>([]);

  // Filter States
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [loading, setLoading] = useState(true);

  // Notifications
  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Detail Drawer State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectBoxOpen, setIsRejectBoxOpen] = useState(false);
  const [rejectionRemark, setRejectionRemark] = useState("");
  const [drawerError, setDrawerError] = useState("");

  const fetchRequests = async (pageToFetch = pagination.page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: "10",
      });

      if (activeTab !== "ALL") queryParams.set("status", activeTab);
      if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());
      if (selectedBranch) queryParams.set("branch", selectedBranch);
      if (selectedRoute) queryParams.set("routeId", selectedRoute);

      const [reqRes, routesRes] = await Promise.all([
        fetch(`/api/admin/requests?${queryParams.toString()}`),
        fetch("/api/routes"),
      ]);

      const reqData = await reqRes.json();
      const routesData = await routesRes.json();

      if (reqRes.ok) {
        setRequests(reqData.requests || []);
        setPagination(reqData.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
        setCounts(reqData.counts || { all: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 });
      } else {
        setErrorNotice(reqData.error || "Failed to load requests");
      }

      if (routesRes.ok && routesData.routes) {
        setRoutes(routesData.routes);
      }
    } catch (err: any) {
      setErrorNotice("Network error while loading requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, [activeTab, selectedBranch, selectedRoute]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests(1);
  };

  const openDrawer = (req: RequestItem) => {
    setSelectedRequest(req);
    setIsRejectBoxOpen(false);
    setRejectionRemark("");
    setDrawerError("");
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setDrawerError("");

    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}/approve`, {
        method: "PUT",
      });
      const data = await res.json();

      if (!res.ok) {
        setDrawerError(data.error || "Failed to approve application");
        setActionLoading(false);
        return;
      }

      setSuccessNotice(data.message || "Pass application approved successfully!");
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      setDrawerError("Network error while approving request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionRemark.trim() || rejectionRemark.trim().length < 3) {
      setDrawerError("Please provide an explanatory remark for the rejection (minimum 3 characters)");
      return;
    }

    setActionLoading(true);
    setDrawerError("");

    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: rejectionRemark.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setDrawerError(data.error || "Failed to reject application");
        setActionLoading(false);
        return;
      }

      setSuccessNotice(data.message || "Pass application rejected.");
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      setDrawerError("Network error while rejecting request");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bus Pass Applications & Approvals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review student digital transit requests, verify tuition fee records, and approve digital passes.
          </p>
        </div>
      </div>

      {/* Notices */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice("")} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { tab: "ALL", label: "All Requests", count: counts.all },
          { tab: "PENDING", label: "Pending Review", count: counts.PENDING },
          { tab: "APPROVED", label: "Approved Passes", count: counts.APPROVED },
          { tab: "REJECTED", label: "Rejected", count: counts.REJECTED },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab as any)}
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === item.tab
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === item.tab
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Dynamic Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, email, or mobile..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        {/* Branch Filter */}
        <div className="relative">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Engineering Branches</option>
            <option value="Computer">Computer</option>
            <option value="Civil">Civil</option>
            <option value="Mechanical">Mechanical</option>
          </select>
        </div>

        {/* Route Filter */}
        <div className="relative">
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Applications Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <FileCheck className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No Bus Pass Requests Found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no student applications matching your current filter criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Student Info</th>
                    <th className="px-5 py-3.5">Selected Route</th>
                    <th className="px-5 py-3.5 text-right">Fee Balance</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5">Applied Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">
                            {req.student.fullName}
                          </span>
                          <span className="text-slate-400 text-[11px] block">
                            {req.student.year} • {req.student.branch} • +91 {req.student.mobile}
                          </span>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {req.student.route?.name || "Unassigned"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Fare: {formatCurrency(req.student.totalFee)}
                        </span>
                      </td>

                      {/* Fee Balance */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          {req.student.feesPaid >= req.student.totalFee && req.student.totalFee > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Paid Full: {formatCurrency(req.student.feesPaid)}
                            </span>
                          ) : req.student.feesPaid > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              Paid: {formatCurrency(req.student.feesPaid)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Pay Later (₹0)
                            </span>
                          )}
                          <span
                            className={`block text-[11px] font-semibold ${
                              req.student.pendingFees > 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            Bal: {formatCurrency(req.student.pendingFees)}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4 text-center">
                        {req.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </span>
                        )}
                        {req.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                        {req.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action Button */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openDrawer(req)}
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive KPI Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((req) => (
                <div key={req.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {req.student.fullName}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs block mt-0.5">
                        {req.student.year} • {req.student.branch} • +91 {req.student.mobile}
                      </span>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium block mt-1">
                        🚌 {req.student.route?.name || "Unassigned"}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {req.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      )}
                      {req.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                      {req.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fee & Date Tiles */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Paid</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {formatCurrency(req.student.feesPaid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
                      <span
                        className={`text-xs font-extrabold mt-0.5 block ${
                          req.student.pendingFees > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatCurrency(req.student.pendingFees)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Applied</span>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5 block">
                        {new Date(req.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => openDrawer(req)}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Application</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} applications
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchRequests(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchRequests(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER / SLIDE-OVER */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Application Review Desk
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRequest.student.fullName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {drawerError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{drawerError}</span>
                </div>
              )}

              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Application Status
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedRequest.status === "APPROVED"
                      ? "Approved & Verified"
                      : selectedRequest.status === "PENDING"
                      ? "Awaiting Verification"
                      : "Rejected by Administration"}
                  </span>
                </div>
                <div>
                  {selectedRequest.status === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                  {selectedRequest.status === "PENDING" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                  {selectedRequest.status === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Digital ID badge if already issued */}
              {selectedRequest.student.digitalId && (
                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
                      Active Digital Transit Pass
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {selectedRequest.student.digitalId.idNumber}
                    </span>
                  </div>
                </div>
              )}

              {/* Student Personal & Academic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student Verification Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      College Email
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {selectedRequest.student.email}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Contact Mobile
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                      +91 {selectedRequest.student.mobile}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Academic Year
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {selectedRequest.student.year}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Branch
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {selectedRequest.student.branch} Engineering
                    </span>
                  </div>
                </div>
              </div>

              {/* Route & Fee Breakdown + Payment Audit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Route Fare & Declared Payment Audit
                  </h4>
                  {selectedRequest.student.feesPaid >= selectedRequest.student.totalFee && selectedRequest.student.totalFee > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      100% Cleared
                    </span>
                  ) : selectedRequest.student.feesPaid > 0 ? (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      Partial Declared
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      Pay Later
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Selected Bus Route:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedRequest.student.route?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Official Annual Fare:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(selectedRequest.student.totalFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-600 font-semibold">Payment Declared by Student:</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(selectedRequest.student.feesPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Pending Fee Balance:
                    </span>
                    <span
                      className={`font-extrabold ${
                        selectedRequest.student.pendingFees > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {formatCurrency(selectedRequest.student.pendingFees)}
                    </span>
                  </div>
                </div>

                {/* Declared Payment Logs & References */}
                {selectedRequest.student.payments && selectedRequest.student.payments.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
                      Payment Verification Reference:
                    </span>
                    {selectedRequest.student.payments.map((p) => (
                      <div key={p.id} className="text-xs space-y-0.5">
                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                          <span>Amount: {formatCurrency(p.amount)}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(p.date || p.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {p.note && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                            {p.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Show Rejection Remark if rejected */}
              {selectedRequest.adminRemark && (
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Recorded Administrative Remark:
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-1 italic">
                    &ldquo;{selectedRequest.adminRemark}&rdquo;
                  </p>
                </div>
              )}

              {/* Rejection Remark Input Form */}
              {isRejectBoxOpen && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-rose-800 dark:text-rose-300">
                    Reason for Rejection (Mandatory Remark)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionRemark}
                    onChange={(e) => setRejectionRemark(e.target.value)}
                    placeholder="e.g. Incomplete payment receipt, branch mismatch, or pending fee clearance required."
                    className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejectBoxOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
                    >
                      {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Confirm Rejection</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Actions Footer */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close Drawer
              </button>

              <div className="flex items-center gap-2">
                {!isRejectBoxOpen && (
                  <button
                    type="button"
                    onClick={() => setIsRejectBoxOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900"
                  >
                    Reject Application
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading || selectedRequest.status === "APPROVED"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/20"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {selectedRequest.status === "APPROVED" ? "Already Approved" : "Approve & Issue ID"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
