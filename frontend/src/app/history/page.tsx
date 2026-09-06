"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { AnalysisResult } from "@/types";
import { History, Calendar, AlertTriangle, CheckCircle, ArrowRight, Filter } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [filter, setFilter] = useState<"all" | "diseased" | "healthy">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analysis/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filter === "healthy") return item.condition === "Healthy";
    if (filter === "diseased") return item.condition !== "Healthy";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>Diagnosis History</span>
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Review past scans, monitor disease progressions, and track crop health timelines.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === "all" ? "bg-white text-emerald-900 shadow-sm" : "text-stone-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("diseased")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === "diseased" ? "bg-white text-amber-700 shadow-sm" : "text-stone-600"
            }`}
          >
            Diseased
          </button>
          <button
            onClick={() => setFilter("healthy")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === "healthy" ? "bg-white text-emerald-700 shadow-sm" : "text-stone-600"
            }`}
          >
            Healthy
          </button>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">Loading past assessments...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
          <p className="text-stone-500 text-sm">No analysis records found for this filter.</p>
          <Link
            href="/analyze"
            className="inline-block bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Screen First Rice Leaf
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.analysis_id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-stone-200">
                  {item.condition === "Healthy" ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{item.condition}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        item.severity === "High"
                          ? "text-rose-600"
                          : item.severity === "Moderate"
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      Severity: {item.severity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <Link
                  href={`/chat?analysis_id=${item.analysis_id}`}
                  className="text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition"
                >
                  Consult Assistant
                </Link>
                <Link
                  href={`/analyze`}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
