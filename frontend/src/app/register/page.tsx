"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { useApp } from "@/lib/context";
import { User, Phone, Lock, MapPin, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          password,
          village,
          district,
          state,
          language: "en",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed.");
      }

      const data = await res.json();
      localStorage.setItem("riceguard_token", data.access_token);
      localStorage.setItem("riceguard_user", JSON.stringify(data.user));
      setUser(data.user);
      router.push("/analyze");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-stone-900">Farmer Registration</h1>
        <p className="text-xs text-stone-500">Join RiceGuard AI to protect your paddy crops</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block font-medium text-stone-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
            placeholder="e.g. Ramesh Patel"
          />
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Mobile Number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
            placeholder="e.g. 9876543210"
          />
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
            placeholder="Create password"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Village</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
              placeholder="e.g. Anand"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-700 mb-1">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
              placeholder="e.g. Anand"
            />
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
        >
          <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-stone-500">
        Already registered?{" "}
        <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
          Login here
        </Link>
      </div>
    </div>
  );
}
