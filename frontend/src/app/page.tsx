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
    // Generate fallback profiles from the active language / default dictionary
    const fallbackList: DiseaseInfo[] = Object.entries(t.diseases || {})
      .filter(([name]) => name !== "Unknown / Not Rice")
      .map(([name, val], idx) => ({
        id: idx + 1,
        name: val.name || name,
        description: val.description || "",
        symptoms: val.symptoms || [],
        risk_factors: val.risk_factors || [],
        precautions: val.precautions || [],
        management: val.management || [],
        source: "ICAR / IRRI Manual",
        status: "verified"
      }));

    const fetchDiseases = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/diseases`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((d: DiseaseInfo) => d.name !== "Unknown / Not Rice");
          if (filtered.length > 0) {
            // Apply language translations to fetched diseases
            const localized = filtered.map((d: DiseaseInfo) => {
              const trans = t.diseases?.[d.name];
              return trans
                ? {
                    ...d,
                    name: trans.name || d.name,
                    description: trans.description || d.description,
                  }
                : d;
            });
            setDiseases(localized);
            return;
          }
        }
      } catch (e) {
        console.warn("Backend /diseases fetch failed, using localized knowledge base fallback.", e);
      }
      // If backend is sleeping (Render cold start) or uncontactable, immediately show the localized verified diseases
      setDiseases(fallbackList);
    };

    fetchDiseases();
  }, [t]);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl border border-emerald-600">
        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur border border-white/30 px-3 py-1 rounded-full text-xs font-semibold text-white">
            <Sprout className="w-4 h-4 text-white" />
            <span>AI-Assisted Rice Crop Diagnostics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            {t.heroHeading}
          </h1>

          <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-normal">
            {t.heroSub}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/analyze"
              className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition transform hover:-translate-y-0.5"
            >
              <span>{t.analyzeNow}</span>
              <ArrowRight className="w-4 h-4 text-emerald-800" />
            </Link>

            <Link
              href="/live"
              className="bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-400/50 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-sm flex items-center gap-2 text-sm transition"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>{t.liveScreening}</span>
            </Link>

            <Link
              href="/chat"
              className="bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-400/50 text-white font-medium px-5 py-3.5 rounded-2xl shadow-sm flex items-center gap-2 text-sm transition"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>{t.askAssistant}</span>
            </Link>
          </div>
        </div>

        {/* Decorative background badge */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12 text-white">
          <Sprout className="w-96 h-96" />
        </div>
      </section>

      {/* Safety & Agronomic Disclaimer Notice */}
      <section className="bg-white border-2 border-emerald-600 rounded-2xl p-5 flex items-start gap-3.5 text-emerald-950 text-xs sm:text-sm shadow-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-emerald-700 mt-0.5" />
        <div>
          <strong className="font-bold block text-emerald-900 mb-0.5">Preliminary Assessment Notice:</strong>
          {t.disclaimerText}
        </div>
      </section>

      {/* Supported Diseases Knowledge Base Preview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Supported Rice Diseases & Conditions</h2>
            <p className="text-xs text-emerald-800 mt-1">
              Curated from ICAR, NRRI, and IRRI agricultural research manuals.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-lg border border-emerald-300">
            {diseases.length} Verified Profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diseases.map((d) => (
            <div
              key={d.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 hover:border-emerald-600 transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-950 text-base">{d.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified
                  </span>
                </div>
                {d.scientific_name && (
                  <p className="text-xs italic text-emerald-700/80 mt-0.5">{d.scientific_name}</p>
                )}
                <p className="text-xs text-emerald-900/90 mt-2 line-clamp-3 leading-relaxed">
                  {d.description}
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-emerald-700 truncate max-w-[180px]">
                  {d.source || "ICAR Guidelines"}
                </span>
                <Link
                  href={`/analyze`}
                  className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
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
