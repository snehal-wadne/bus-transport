import Link from "next/link";
import {
  Users,
  Route as RouteIcon,
  FileCheck,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let totalStudents = 0;
  let pendingRequests = 0;
  let approvedIDs = 0;
  let totalPendingFees = 0;
  let routesWithCounts: { id: string; name: string; fee: number; count: number }[] = [];

  try {
    const [students, requests, digitalIds, routes] = await Promise.all([
      prisma.student.findMany({ include: { route: true } }),
      prisma.iDRequest.count({ where: { status: "PENDING" } }),
      prisma.digitalID.count(),
      prisma.route.findMany({
        include: {
          _count: { select: { students: true } },
        },
        orderBy: { fee: "desc" },
      }),
    ]);

    totalStudents = students.length;
    pendingRequests = requests;
    approvedIDs = digitalIds;

    const totalRouteFees = students.reduce((sum, s) => sum + (s.route?.fee || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + s.feesPaid, 0);
    totalPendingFees = Math.max(0, totalRouteFees - totalPaid);

    routesWithCounts = routes.map((r) => ({
      id: r.id,
      name: r.name,
      fee: r.fee,
      count: r._count.students,
    }));
  } catch (e) {
    // Graceful fallback during dev setup
  }

  // Calculate highest student count for bar chart scaling
  const maxRouteStudents = Math.max(1, ...routesWithCounts.map((r) => r.count));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transport Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics for bus route enrollment, pending pass approvals, and fee collections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Desk: admin@college.com</span>
          </span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Enrolled
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Registered Students
          </span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalStudents}
          </p>
        </div>

        {/* Pending Requests */}
        <Link
          href="/admin/requests"
          className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Pending Pass Requests
          </span>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {pendingRequests}
          </p>
        </Link>

        {/* Approved Digital IDs */}
        <Link
          href="/admin/requests?status=APPROVED"
          className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Approved Transit IDs
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {approvedIDs}
          </p>
        </Link>

        {/* Total Pending Fees */}
        <Link
          href="/admin/fees"
          className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Pending Fees
          </span>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalPendingFees)}
          </p>
        </Link>
      </div>

      {/* Bar Chart: Students Per Route */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Route Enrollment Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live student capacity and subscription counts across all bus corridors
            </p>
          </div>
          <Link
            href="/admin/routes"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Configure Routes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {routesWithCounts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No route data available to display chart.
          </div>
        ) : (
          <div className="space-y-5">
            {routesWithCounts.map((r) => {
              const percentage = Math.round((r.count / maxRouteStudents) * 100);
              return (
                <div key={r.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{r.name}</span>
                      <span className="text-slate-400 font-normal">
                        ({formatCurrency(r.fee)}/yr)
                      </span>
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {r.count} student{r.count === 1 ? "" : "s"}
                    </span>
                  </div>

                  {/* Horizontal Bar with fill percentage */}
                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(6, percentage)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Desk Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/requests"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
              Review Pass Requests
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-xs text-slate-500">
            Verify student submissions and issue official QR transit ID cards.
          </p>
        </Link>

        <Link
          href="/admin/fees"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
              Record Fee Receipts
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-xs text-slate-500">
            Record cash/bank payments and inspect individual student ledgers.
          </p>
        </Link>

        <Link
          href="/admin/routes"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
              Bus Routes & Fares
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-xs text-slate-500">
            Modify ticket pricing, add new stops, or adjust route rosters.
          </p>
        </Link>
      </div>
    </div>
  );
}
