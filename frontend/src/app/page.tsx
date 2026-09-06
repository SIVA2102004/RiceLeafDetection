"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { API_BASE_URL } from "@/lib/api";
import { DiseaseInfo } from "@/types";
import { Sprout, Camera, MessageSquare, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, BookOpen, AlertCircle } from "lucide-react";

export default function LandingPage() {
  const { t } = useApp();
  const [diseases, setDiseases] = useState<DiseaseInfo[]>([]);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/diseases`);
        if (res.ok) {
          const data = await res.json();
          setDiseases(data.filter((d: DiseaseInfo) => d.name !== "Unknown / Not Rice"));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDiseases();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 backdrop-blur border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
            <Sprout className="w-4 h-4" />
            <span>AI-Assisted Rice Crop Diagnostics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t.heroHeading}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {t.heroSub}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/analyze"
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition transform hover:-translate-y-0.5"
            >
              <span>{t.analyzeNow}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/live"
              className="bg-emerald-700/70 hover:bg-emerald-700 border border-emerald-500/40 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-sm flex items-center gap-2 text-sm transition"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>{t.liveScreening}</span>
            </Link>

            <Link
              href="/chat"
              className="bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-700 text-emerald-100 font-medium px-5 py-3.5 rounded-2xl shadow-sm flex items-center gap-2 text-sm transition"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>{t.askAssistant}</span>
            </Link>
          </div>
        </div>

        {/* Decorative background badge */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Sprout className="w-96 h-96" />
        </div>
      </section>

      {/* Safety & Agronomic Disclaimer Notice */}
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 text-amber-900 text-xs sm:text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-700 mt-0.5" />
        <div>
          <strong className="font-semibold block text-amber-950 mb-0.5">Preliminary Assessment Notice:</strong>
          {t.disclaimerText}
        </div>
      </section>

      {/* Supported Diseases Knowledge Base Preview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Supported Rice Diseases & Conditions</h2>
            <p className="text-xs text-stone-500 mt-1">
              Curated from ICAR, NRRI, and IRRI agricultural research manuals.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
            {diseases.length} Verified Profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diseases.map((d) => (
            <div
              key={d.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 hover:border-emerald-400 transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-base">{d.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                {d.scientific_name && (
                  <p className="text-xs italic text-stone-400 mt-0.5">{d.scientific_name}</p>
                )}
                <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                  {d.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-stone-400 truncate max-w-[180px]">
                  {d.source || "ICAR Guidelines"}
                </span>
                <Link
                  href={`/analyze`}
                  className="font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Scan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
