"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { ShieldCheck, Users, Activity, CheckCircle, AlertTriangle, Cpu, MessageSquare } from "lucide-react";

interface AdminStats {
  total_farmers: number;
  total_analyses: number;
  disease_cases: number;
  healthy_cases: number;
  pending_reviews: number;
  total_feedback: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await fetch(`${API_BASE_URL}/admin/dashboard`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const modelsRes = await fetch(`${API_BASE_URL}/admin/models`);
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setModels(modelsData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Admin Title */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            <span>Agricultural Admin & Quality Assurance</span>
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            System overview, model telemetry, dataset verification pipeline, and expert review queue.
          </p>
        </div>
        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-300">
          Admin Portal
        </span>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Farmers</span>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.total_farmers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Total Scans</span>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.total_analyses}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Healthy</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.healthy_cases}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Diseased</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.disease_cases}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Review Queue</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.pending_reviews}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Feedback</span>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.total_feedback}</p>
          </div>
        </div>
      )}

      {/* AI Models Registry */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
        <h2 className="font-bold text-stone-900 text-lg flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-600" />
          <span>Active Computer Vision Model Registry</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3">Model Architecture</th>
                <th className="p-3">Version</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Val Accuracy</th>
                <th className="p-3">F1 Score</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/60">
                  <td className="p-3 font-semibold text-stone-900">{m.name}</td>
                  <td className="p-3 font-mono">{m.version}</td>
                  <td className="p-3 text-emerald-700 font-medium">{m.accuracy ? `${(m.accuracy * 100).toFixed(1)}%` : "N/A"}</td>
                  <td className="p-3">{m.val_accuracy ? `${(m.val_accuracy * 100).toFixed(1)}%` : "N/A"}</td>
                  <td className="p-3">{m.f1_score ? `${(m.f1_score * 100).toFixed(1)}%` : "N/A"}</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
