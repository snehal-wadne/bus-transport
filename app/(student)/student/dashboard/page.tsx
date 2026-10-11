"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bus,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileCheck,
  CreditCard,
  Loader2,
  Sparkles,
} from "lucide-react";
import StudentProfileForm from "@/components/StudentProfileForm";
import StudentProfileCard from "@/components/StudentProfileCard";
import IDRequestTracker from "@/components/IDRequestTracker";
import DigitalIDCard from "@/components/DigitalIDCard";

interface RouteItem {
  id: string;
  name: string;
  fee: number;
}

export default function StudentDashboardPage() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [requestData, setRequestData] = useState<any>(null);
  const [digitalIdData, setDigitalIdData] = useState<any>(null);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErrorNotice("");

    try {
      const [profileRes, routesRes, requestsRes] = await Promise.all([
        fetch("/api/student/profile"),
        fetch("/api/routes"),
        fetch("/api/requests/my"),
      ]);

      const profileJson = await profileRes.json();
      const routesJson = await routesRes.json();
      const requestsJson = await requestsRes.json();

      if (profileRes.ok && profileJson.profile) {
        setProfile(profileJson.profile);
      } else {
        setProfile(null);
      }

      if (routesRes.ok && routesJson.routes) {
        setRoutes(routesJson.routes);
      }

      if (requestsRes.ok) {
        setRequestData(requestsJson);
      }

      // If approved, fetch digital ID details with QR code
      if (
        (profileJson.profile?.isApproved ||
          requestsJson?.latestRequest?.status === "APPROVED") &&
        requestsJson?.digitalId
      ) {
        const idRes = await fetch("/api/student/id");
        if (idRes.ok) {
          const idJson = await idRes.json();
          setDigitalIdData(idJson);
        }
      } else {
        setDigitalIdData(null);
      }
    } catch (err: any) {
      setErrorNotice("Could not load student transport profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isProfileComplete = Boolean(
    profile &&
      profile.fullName?.trim() &&
      profile.year?.trim() &&
      profile.branch?.trim() &&
      profile.mobile?.trim() &&
      profile.routeId
  );

  const isApproved =
    requestData?.latestRequest?.status === "APPROVED" || profile?.isApproved;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
        <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2937] print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#6366F1]/15 text-[#A78BFA] border border-[#6366F1]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flora Institutes • Student Transportation Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F9FAFB]">
            Bus Pass & Digital Transit ID
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Logged in as <span className="font-semibold text-white">{session?.user?.email}</span>
            {session?.user?.role === "ADMIN" && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6366F1]/20 text-[#A78BFA] border border-[#6366F1]/40">
                Admin Mode Active
              </span>
            )}
          </p>
        </div>

        {session?.user?.role === "ADMIN" && (
          <a
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] border border-[#6366F1] shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Return to Admin Desk</span>
          </a>
        )}
      </div>

      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 print:hidden">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout: Profile Form on Main, Pass & Request Tracker at the Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Side: Profile Summary Card or 3-Step Registration Form */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 print:hidden">
          {profile && !isEditing ? (
            <StudentProfileCard
              profile={profile}
              onEdit={() => setIsEditing(true)}
            />
          ) : (
            <StudentProfileForm
              initialData={profile}
              routes={routes}
              onSuccess={(savedProfile) => {
                setProfile(savedProfile);
                setIsEditing(false);
                fetchData();
              }}
              onCancel={profile ? () => setIsEditing(false) : undefined}
            />
          )}
        </div>

        {/* Side Column: ID Pass & Request Workflow Tracker */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          {/* Digital ID Pass Card (When Approved) */}
          {isApproved && digitalIdData && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <DigitalIDCard idData={digitalIdData} />
            </div>
          )}

          {/* ID Request Workflow Tracker */}
          <div className="print:hidden">
            <IDRequestTracker
              request={requestData?.latestRequest || profile?.latestRequest || null}
              isProfileComplete={isProfileComplete}
              onRequestSubmit={fetchData}
              onEditProfile={() => setIsEditing(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
