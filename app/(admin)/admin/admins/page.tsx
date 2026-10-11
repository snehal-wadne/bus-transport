"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  User,
} from "lucide-react";

interface AdminItem {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  student?: {
    id: string;
    fullName: string;
    branch: string;
    year: string;
  } | null;
}

export default function AdminStaffManagementPage() {
  const { data: session } = useSession();
  const currentEmail = session?.user?.email;

  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Admin Form (e.g. HOD Sir)
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submittingNew, setSubmittingNew] = useState(false);
  const [newSuccess, setNewSuccess] = useState("");
  const [newError, setNewError] = useState("");

  // Update Personal Credentials Form (Harshal's account)
  const [updateEmail, setUpdateEmail] = useState("");
  const [updatePassword, setUpdatePassword] = useState("");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok && data.admins) {
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewSuccess("");
    setNewError("");

    if (!newEmail || !newPassword) {
      setNewError("Please provide both email and password.");
      return;
    }

    if (newPassword.length < 6) {
      setNewError("Password must be at least 6 characters.");
      return;
    }

    setSubmittingNew(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setNewError(data.error || "Failed to create administrator");
      } else {
        setNewSuccess(data.message || "Admin account created successfully!");
        setNewEmail("");
        setNewPassword("");
        fetchAdmins();
      }
    } catch (err) {
      setNewError("Network error while creating administrator");
    } finally {
      setSubmittingNew(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess("");
    setUpdateError("");

    if (!updateEmail && !updatePassword) {
      setUpdateError("Please specify a new email or new password to update.");
      return;
    }

    if (updatePassword && updatePassword.length < 6) {
      setUpdateError("New password must be at least 6 characters.");
      return;
    }

    setSubmittingUpdate(true);
    try {
      const payload: any = {};
      if (updateEmail) payload.newEmail = updateEmail;
      if (updatePassword) payload.newPassword = updatePassword;

      const res = await fetch("/api/admin/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setUpdateError(data.error || "Failed to update credentials");
      } else {
        setUpdateSuccess("Your administrator credentials were updated successfully!");
        setUpdateEmail("");
        setUpdatePassword("");
        fetchAdmins();
      }
    } catch (err) {
      setUpdateError("Network error while updating credentials");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 text-[#F9FAFB]">
      {/* Header Banner */}
      <div className="pb-6 border-b border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#6366F1]/15 text-[#A78BFA] border border-[#6366F1]/30 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Staff Security & Credentials Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F9FAFB]">
            Administrator & HOD Staff Management
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Manage authorized transit desk officers, invite HOD Sir, and update personal login credentials.
          </p>
        </div>
      </div>

      {/* Dual Role Card Highlight */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111827] via-[#111827] to-[#1E1B4B] border border-[#6366F1]/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6366F1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <span>Dual Role Mode Active: Student + Admin</span>
            </div>
            <h3 className="text-lg font-bold text-[#F9FAFB]">
              You can act as both an Administrator and a Student simultaneously!
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Your account has full administrative privileges to review requests and record fees. You can also switch to the{" "}
              <strong className="text-white">Student Portal</strong> anytime from the top navigation bar to fill your student profile, pick your route, and generate your own bus pass.
            </p>
          </div>
          <a
            href="/student/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#A78BFA] hover:opacity-90 shadow-md transition-all hover:scale-105 shrink-0"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Open Student Portal View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid: Add HOD Sir & Update My Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Add HOD Sir / Co-Admin */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1F2937]">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 text-[#A78BFA] flex items-center justify-center shrink-0 border border-[#6366F1]/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F9FAFB]">
                  Add HOD Sir / Second Admin
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Create an immediate admin login without requiring student signup.
                </p>
              </div>
            </div>

            {newSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{newSuccess}</span>
              </div>
            )}

            {newError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{newError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  HOD Sir&apos;s College Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="hod.computer@flora.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0A0F1C] border border-[#1F2937] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Set Initial Password for HOD Sir
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters (e.g. Hod@2026)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0A0F1C] border border-[#1F2937] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  HOD Sir can sign in directly at <code>/login</code> with these credentials.
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingNew}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60"
              >
                {submittingNew ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Admin Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create HOD Admin Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Update My Credentials */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1F2937]">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-[#A78BFA] flex items-center justify-center shrink-0 border border-violet-600/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F9FAFB]">
                  Change My Admin Credentials
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Currently logged in as <strong className="text-[#A78BFA]">{currentEmail}</strong>
                </p>
              </div>
            </div>

            {updateSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{updateSuccess}</span>
              </div>
            )}

            {updateError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Change Login Email (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={updateEmail}
                    onChange={(e) => setUpdateEmail(e.target.value)}
                    placeholder="your.email@flora.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0A0F1C] border border-[#1F2937] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Change Password (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={updatePassword}
                    onChange={(e) => setUpdatePassword(e.target.value)}
                    placeholder="New strong password (min 6 chars)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0A0F1C] border border-[#1F2937] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingUpdate}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#111827] hover:bg-[#1f2937] border border-[#6366F1]/50 hover:border-[#6366F1] shadow-md transition-all disabled:opacity-60"
              >
                {submittingUpdate ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-[#A78BFA]" />
                    <span>Save My Credentials</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Active Administrators List */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#6366F1]" />
            <h3 className="text-base font-bold text-[#F9FAFB]">
              Active Authorized Administrators ({admins.length})
            </h3>
          </div>
          <span className="text-xs text-[#9CA3AF]">
            Full System Privileges
          </span>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center text-[#9CA3AF]">
            <Loader2 className="w-6 h-6 animate-spin text-[#6366F1]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0F1C] border-b border-[#1F2937] text-[#9CA3AF] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Access Level</th>
                  <th className="py-3 px-4">Student Profile Linked</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[#1f2937]/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#F9FAFB] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#6366F1]/20 text-[#A78BFA] flex items-center justify-center font-bold text-xs">
                        {admin.email.charAt(0).toUpperCase()}
                      </div>
                      <span>{admin.email}</span>
                      {admin.email === currentEmail && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#6366F1]/20 text-[#A78BFA] border border-[#6366F1]/30">
                        <Shield className="w-3 h-3" />
                        Administrator
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#9CA3AF]">
                      {admin.student ? (
                        <span className="text-emerald-400 font-medium">
                          Yes • {admin.student.fullName} ({admin.student.branch})
                        </span>
                      ) : (
                        <span className="text-[#9CA3AF]/60">Admin Only</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#9CA3AF]">
                      {new Date(admin.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
