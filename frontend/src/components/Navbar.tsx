"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context";
import { LanguageCode } from "@/types";
import { Sprout, Camera, History, MessageSquare, ShieldCheck, User, Globe, LogOut } from "lucide-react";

export default function Navbar() {
  const { language, setLanguage, t, user, logout } = useApp();
  const pathname = usePathname();

  const navItems = [
    { href: "/analyze", label: t.analyzeNow, icon: Sprout },
    { href: "/live", label: t.liveScreening, icon: Camera },
    { href: "/chat", label: t.askAssistant, icon: MessageSquare },
    { href: "/history", label: t.history, icon: History },
    { href: "/fields", label: t.fields, icon: Sprout },
  ];

  const languages: { code: LanguageCode; label: string }[] = [
    { code: "en", label: "English" },
    { code: "te", label: "తెలుగు" },
    { code: "hi", label: "हिंदी" },
    { code: "gu", label: "ગુજરાતી" },
    { code: "ta", label: "தமிழ்" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "mr", label: "मराठी" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-emerald-800 text-white shadow-md border-b border-emerald-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:text-emerald-100 transition">
          <div className="bg-white p-2 rounded-xl text-emerald-800 shadow-sm">
            <Sprout className="w-6 h-6" />
          </div>
          <span>{t.appName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active ? "bg-white text-emerald-850 font-bold shadow-sm" : "text-emerald-100 hover:bg-emerald-700 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side controls: Language switcher + User Auth */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="flex items-center gap-1 bg-emerald-900/90 px-2.5 py-1.5 rounded-lg border border-emerald-600/70 text-xs text-white">
            <Globe className="w-3.5 h-3.5 text-white" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-emerald-900 text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/fields"
                className="hidden sm:flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-600"
              >
                <User className="w-3.5 h-3.5 text-white" />
                <span>{user.name.split(" ")[0]}</span>
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/80 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs text-emerald-100 hover:text-white px-2 py-1 rounded transition"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition"
              >
                {t.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
