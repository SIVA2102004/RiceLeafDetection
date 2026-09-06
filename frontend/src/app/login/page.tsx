"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { useApp } from "@/lib/context";
import { Lock, Phone, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useApp();
  const [identifier, setIdentifier] = useState("9123456780"); // Pre-filled demo farmer
  const [password, setPassword] = useState("Farmer@12345");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Authentication failed.");
      }

      const data = await res.json();
      localStorage.setItem("riceguard_token", data.access_token);
      localStorage.setItem("riceguard_user", JSON.stringify(data.user));
      setUser(data.user);
      router.push("/analyze");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-stone-900">Account Login</h1>
        <p className="text-xs text-stone-500">Access your fields, scan records, and AI recommendations securely</p>
      </div>

      <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 space-y-2 shadow-xs">
        <div className="flex items-center justify-between font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Quick Test Accounts (Bcrypt Secured):
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setIdentifier("9123456780");
              setPassword("Farmer@12345");
            }}
            className="text-left p-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 transition text-[11px] shadow-2xs"
          >
            <div className="font-semibold text-emerald-800">🌾 Farmer Demo</div>
            <div className="text-stone-500 font-mono text-[10px]">9123456780</div>
            <div className="text-stone-400 font-mono text-[9px]">Pass: Farmer@12345</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifier("9876543210");
              setPassword("Admin@12345");
            }}
            className="text-left p-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 transition text-[11px] shadow-2xs"
          >
            <div className="font-semibold text-amber-900">🛡️ Admin Officer</div>
            <div className="text-stone-500 font-mono text-[10px]">9876543210</div>
            <div className="text-stone-400 font-mono text-[9px]">Pass: Admin@12345</div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-stone-700 mb-1">Mobile Number or Email</label>
          <div className="relative">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 pl-9"
              placeholder="e.g. 9123456780"
            />
            <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 pl-9"
              placeholder="••••••••"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <span>{loading ? "Signing in..." : "Login"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-stone-500">
        Don't have an account?{" "}
        <Link href="/register" className="text-emerald-700 font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}
