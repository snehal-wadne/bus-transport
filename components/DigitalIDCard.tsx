"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  Printer,
  RotateCw,
  Bus,
  ShieldCheck,
  QrCode,
  Sparkles,
  CheckCircle2,
  Phone,
  AlertCircle,
  Loader2,
  Share2,
} from "lucide-react";

interface DigitalIDCardProps {
  idData: {
    digitalId: {
      id: string;
      idNumber: string;
      issuedAt: string;
      validity: string;
      verificationUrl: string;
      qrCodeDataUrl: string;
    };
    student: {
      id: string;
      fullName: string;
      year: string;
      branch: string;
      mobile: string;
    };
    route?: {
      id: string;
      name: string;
      fee: number;
    } | null;
  };
}

export default function DigitalIDCard({ idData }: DigitalIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { digitalId, student, route } = idData;

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch("/api/student/id/download");
      if (!response.ok) throw new Error("PDF download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bus-Pass-${digitalId.idNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert("Failed to download pass PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-violet-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Verified Digital Bus Pass</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Active
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authorized by College Transport Administration. Ready for digital presentation or physical print.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Flip Pass (3D)</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm print:hidden"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-500" />
            <span>Print Pass</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-60 print:hidden"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="flex justify-center perspective-[1200px] py-4">
        <div
          className={`relative w-full max-w-[480px] h-[290px] transition-transform duration-700 ease-in-out transform-style-3d cursor-pointer select-none`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* ==================== FRONT SIDE ==================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between shadow-2xl backface-hidden overflow-hidden border border-white/20 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Holographic Watermark glow */}
            <div className="absolute -right-16 -top-16 w-52 h-52 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Flora Institutes"
                    width={28}
                    height={28}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-[#A78BFA] uppercase block">
                    Flora Education Society, Pune
                  </span>
                  <h4 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5 mt-0.5">
                    <Bus className="w-4 h-4 text-amber-400" />
                    <span>Flora Campus Bus Pass</span>
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {digitalId.idNumber}
                </span>
                <span className="text-[8px] text-slate-300 block mt-1 tracking-wider uppercase font-semibold">
                  Valid 2026-27
                </span>
              </div>
            </div>

            {/* Middle: Student Details */}
            <div className="relative z-10 flex items-center justify-between gap-4 my-auto">
              <div className="space-y-2">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-indigo-300 font-semibold block">
                    Student Full Name
                  </span>
                  <p className="text-base font-extrabold text-white tracking-wide">
                    {student.fullName}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-indigo-300 font-semibold block">
                      Enrollment
                    </span>
                    <span className="text-[11px] font-medium text-slate-200">
                      {student.year} • {student.branch}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-indigo-300 font-semibold block">
                      Mobile
                    </span>
                    <span className="text-[11px] font-medium text-slate-200">
                      +91 {student.mobile}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[8px] uppercase tracking-wider text-amber-300 font-semibold block">
                    Designated Route
                  </span>
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                    <Bus className="w-3 h-3 text-amber-400" />
                    {route?.name || "Campus Bus Route"}
                  </span>
                </div>
              </div>

              {/* Holographic Badge / QR Quick Peek */}
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 flex flex-col items-center justify-center text-center shadow-inner shrink-0">
                <img
                  src={digitalId.qrCodeDataUrl}
                  alt="QR Code"
                  className="w-14 h-14 rounded-lg bg-white p-0.5 shadow-sm"
                />
                <span className="text-[7px] text-indigo-200 font-bold uppercase mt-1">
                  Verified
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 text-[9px]">
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Valid Till: {digitalId.validity}
              </span>
              <span className="text-indigo-300 font-medium text-[8px] flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Click anywhere to flip
              </span>
            </div>
          </div>

          {/* ==================== BACK SIDE ==================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between shadow-2xl backface-hidden overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Back Header */}
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Flora Logo"
                    width={20}
                    height={20}
                    className="object-contain w-full h-full"
                  />
                </div>
                <span className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider">
                  Flora Institutes • Security Verification
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#F9FAFB]">
                {digitalId.idNumber}
              </span>
            </div>

            {/* Middle: High-Res QR Code & Instructions */}
            <div className="flex items-center justify-between gap-5 my-auto">
              <div className="w-28 h-28 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={digitalId.qrCodeDataUrl}
                  alt="Digital Pass QR Code"
                  className="w-24 h-24 rounded-xl"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block">
                  Scan for Live Authenticity
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Conductors and campus security can scan this QR code with any smartphone camera to verify pass validity in real-time.
                </p>
                <div className="text-[9px] text-slate-400 space-y-0.5 pt-1">
                  <p>• Non-transferable; valid only for registered holder.</p>
                  <p>• Emergency Transit Desk: +91 98765 43210</p>
                </div>
              </div>
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[9px] text-slate-400">
              <span>Signatory: Transport Officer</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Click to flip back
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
