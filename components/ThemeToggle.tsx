"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateState = () => {
      const darkActive = document.documentElement.classList.contains("dark");
      setIsDark(darkActive);
    };

    // Initial check
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      // Default to dark mode for transit portal branding
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }

    // Listen to theme change events from other toggle instances or tabs
    window.addEventListener("theme-change", updateState);
    window.addEventListener("storage", updateState);

    return () => {
      window.removeEventListener("theme-change", updateState);
      window.removeEventListener("storage", updateState);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    }

    // Broadcast change to synchronize other toggle instances (desktop & mobile)
    window.dispatchEvent(new Event("theme-change"));
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] text-slate-700 dark:text-[#A78BFA] hover:bg-slate-100 dark:hover:bg-[#1f2937] hover:border-[#6366F1] transition-all shadow-sm active:scale-95"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 -rotate-12 hover:rotate-0 transition-transform" />
      )}
    </button>
  );
}
