"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Bus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please provide a valid email format";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccessMessage("Account created successfully! Signing you in...");

      // Automatically sign in upon successful registration
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginRes?.ok) {
        router.push("/student/dashboard");
        router.refresh();
      } else {
        router.push("/login?registered=true");
      }
    } catch (err: any) {
      setErrorMessage("Network error occurred during registration");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#0A0F1C] transit-grid-bg">
      <div className="w-full max-w-md">
        {/* Card Header with Flora Emblem */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white p-1.5 items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 border border-[#1F2937]">
            <Image
              src="/logo.png"
              alt="Flora Institutes"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#F9FAFB]">
            Register for Bus Pass
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Flora Education Society • Student Transport Enrollment
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

          {successMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5"
              >
                College Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="student@flora.edu.in"
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
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5"
              >
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="At least 6 characters"
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

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                    }
                  }}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0A0F1C] border ${
                    fieldErrors.confirmPassword
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-[#1F2937] focus:border-[#6366F1] focus:ring-[#6366F1]"
                  } text-[#F9FAFB] placeholder-[#9CA3AF]/60 outline-none transition-all`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#6366F1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed border border-[#6366F1]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold text-[#A78BFA] hover:underline"
          >
            Sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
