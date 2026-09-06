"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";
import { API_BASE_URL } from "@/lib/api";
import { AnalysisResult } from "@/types";
import { Camera, CameraOff, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, SwitchCamera } from "lucide-react";
import Link from "next/link";

export default function LiveCameraPage() {
  const { t } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [liveAssessment, setLiveAssessment] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Camera start / stop logic
  const startCamera = async () => {
    setError(null);
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err: any) {
      setError("Unable to access device camera. Please check camera permissions or use the photo upload option.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setLiveAssessment(null);
  };

  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Capture single frame and send throttled inference request
  const captureAndAssess = async () => {
    if (!videoRef.current || !canvasRef.current || isScreening) return;
    setIsScreening(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 480;
      canvas.height = (video.videoHeight / video.videoWidth) * 480 || 360;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsScreening(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", blob, "live_frame.jpg");

        const res = await fetch(`${API_BASE_URL}/analysis/live`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.detail || "Frame evaluation incomplete.");
        } else {
          const data: AnalysisResult = await res.json();
          setLiveAssessment(data);
        }
        setIsScreening(false);
      }, "image/jpeg", 0.85);
    } catch (err: any) {
      setError("Screening evaluation failed. Please hold camera steady.");
      setIsScreening(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Camera className="w-6 h-6 text-emerald-600" />
          <span>Live Rice Screening HUD</span>
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Aim your device camera steadily at suspected rice leaf lesions. Press <strong>Screen Leaf</strong> to capture and assess.
        </p>
      </div>

      {/* Camera Viewfinder */}
      <div className="bg-stone-900 rounded-3xl overflow-hidden shadow-lg relative min-h-[380px] flex flex-col items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full max-h-[500px] object-cover ${!isCameraActive ? "hidden" : "block"}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isCameraActive ? (
          <div className="p-8 text-center text-stone-400 flex flex-col items-center gap-3">
            <CameraOff className="w-12 h-12 text-stone-600" />
            <p className="text-sm font-medium">Camera is currently paused or inactive</p>
            <button
              onClick={startCamera}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow mt-2"
            >
              {t.startCamera}
            </button>
          </div>
        ) : (
          <>
            {/* Viewfinder Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-64 h-64 border-2 border-dashed border-amber-300/80 rounded-2xl flex items-center justify-center backdrop-brightness-105">
                <span className="text-[10px] uppercase font-bold text-amber-300 bg-stone-900/60 px-2.5 py-1 rounded-md backdrop-blur">
                  Align Rice Leaf Here
                </span>
              </div>
            </div>

            {/* Live Camera Controls */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 px-4 z-10">
              <button
                onClick={captureAndAssess}
                disabled={isScreening}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition transform active:scale-95 disabled:opacity-50"
              >
                {isScreening ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.captureFrame}</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleFacingMode}
                title="Switch Camera"
                className="bg-stone-800/80 hover:bg-stone-700 text-white p-3 rounded-2xl backdrop-blur transition"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                onClick={stopCamera}
                title="Stop Camera"
                className="bg-rose-700/80 hover:bg-rose-600 text-white p-3 rounded-2xl backdrop-blur transition"
              >
                <CameraOff className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Assessment HUD Card */}
      {liveAssessment && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live Frame Result
              </span>
              <h3 className="text-xl font-bold text-stone-900 mt-1 flex items-center gap-2">
                {liveAssessment.condition === "Healthy" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <span>{liveAssessment.condition}</span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500">Confidence</span>
              <p className="text-xl font-black text-emerald-700">{Math.round(liveAssessment.confidence * 100)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              <span className="text-stone-500">Severity</span>
              <p className="font-semibold text-stone-800 mt-0.5">{liveAssessment.severity}</p>
            </div>
            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              <span className="text-stone-500">Affected Area</span>
              <p className="font-semibold text-stone-800 mt-0.5">{liveAssessment.affected_area_percentage}%</p>
            </div>
            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100 col-span-2 sm:col-span-1">
              <span className="text-stone-500">Model</span>
              <p className="font-semibold text-stone-700 mt-0.5 truncate">{liveAssessment.model_version}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href={`/analyze`}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Full Diagnostic Report & Precautions</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
