"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import {
  Bus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setErrorMessage(res.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (res?.ok) {
        const session = await getSession();
        const role = session?.user?.role;

        let target = callbackUrl;
        if (!target) {
          target = role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";
        }

        router.push(target);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage("Something went wrong during sign in. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md">
      {/* Card Header with Flora Emblem */}
      <div className="text-center mb-8">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-white p-1.5 items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 border border-[#1F2937]">
          <Image src="/logo.png" alt="Flora Institutes" width={48} height={48} className="object-contain w-full h-full" priority />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#F9FAFB]">
          Flora Institutes Transit Portal
        </h1>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Sign in to access your student bus pass or admin control desk
        </p>
      </div>

      {/* Card Container */}
      <div className="rounded-3xl border border-[#1F2937] bg-[#111827] p-7 sm:p-8 shadow-2xl">
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5"
            >
              College Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                placeholder="student@flora.ac.in"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0A0F1C] border ${
                  fieldErrors.email
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-[#1F2937] focus:border-[#6366F1] focus:ring-[#6366F1]"
                } text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none transition-all`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-rose-400">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm bg-[#0A0F1C] border ${
                  fieldErrors.password
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-[#1F2937] focus:border-[#6366F1] focus:ring-[#6366F1]"
                } text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#F9FAFB] focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-400">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed border border-[#6366F1]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Link */}
      <p className="text-center text-xs text-[#9CA3AF] mt-6">
        New student applying for college bus?{" "}
        <Link
          href="/register"
          className="font-bold text-[#A78BFA] hover:underline"
        >
          Register for Bus Pass
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#0A0F1C] transit-grid-bg">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-2xl border border-[#1F2937] bg-[#111827] flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#6366F1]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
