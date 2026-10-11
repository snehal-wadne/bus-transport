import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Bus,
  Calendar,
  Building,
  User,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface VerifyPageProps {
  params: {
    idNumber: string;
  };
}

export default async function VerifyPassPage({ params }: VerifyPageProps) {
  const { idNumber } = params;

  let isValid = false;
  let passData: any = null;

  try {
    const digitalId = await prisma.digitalID.findUnique({
      where: { idNumber: idNumber?.trim() },
      include: {
        student: {
          include: {
            route: true,
            idRequests: {
              where: { status: "APPROVED" },
              take: 1,
            },
          },
        },
      },
    });

    if (digitalId && digitalId.student.idRequests.length > 0) {
      isValid = true;
      const student = digitalId.student;
      const issuedYear = new Date(digitalId.issuedAt).getFullYear();

      passData = {
        idNumber: digitalId.idNumber,
        issuedAt: digitalId.issuedAt,
        validity: `30 June ${issuedYear + 1}`,
        fullName: student.fullName,
        year: student.year,
        branch: student.branch,
        mobile: student.mobile,
        route: student.route?.name || "General Route",
        college: "College of Engineering & Technology",
      };
    }
  } catch (err) {
    isValid = false;
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Verification Result Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-6 text-center">
          {isValid ? (
            <>
              {/* VALID BADGE */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2 ring-8 ring-emerald-50 dark:ring-emerald-900/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase block">
                  Official Verification Desk
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Valid Campus Transit Pass
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This bus pass is authenticated and currently active in the collegiate registry.
                </p>
              </div>

              {/* Pass ID Pill */}
              <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm tracking-wider border border-slate-200 dark:border-slate-700">
                {passData.idNumber}
              </div>

              {/* Student & Route Verified Details */}
              <div className="text-left p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Student Name
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {passData.fullName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Authorized Bus Route
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5" />
                    {passData.route}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Class & Branch
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {passData.year} • {passData.branch}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Issue Date
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(passData.issuedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Validity Period
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    Valid Till {passData.validity}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* INVALID BADGE */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-2 ring-8 ring-rose-50 dark:ring-rose-900/30">
                <XCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold tracking-widest text-rose-600 dark:text-rose-400 uppercase block">
                  Verification Failed
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Invalid or Expired Pass
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  The scanned transit ID number is not recognized or has not been authorized.
                </p>
              </div>

              {/* Scanned ID */}
              <div className="inline-block px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold text-sm tracking-wider border border-rose-200 dark:border-rose-800">
                {idNumber}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 leading-relaxed text-left">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Security Notice:
                </p>
                <p>
                  No approved record was found for this barcode. If you believe this is an error, please direct the student to the Transport Cell or visit the official portal.
                </p>
              </div>
            </>
          )}

          {/* Action Link */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Return to Campus Transport Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
