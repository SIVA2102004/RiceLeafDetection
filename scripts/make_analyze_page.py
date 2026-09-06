code = """\"use client\";

import React, { useState, useRef } from \"react\";
import { useApp } from \"@/lib/context\";
import { AnalysisResult } from \"@/types\";
import { API_BASE_URL } from \"@/lib/api\";
import { UploadCloud, CheckCircle, AlertTriangle, HelpCircle, ArrowRight, RefreshCw, MessageSquare, ThumbsUp, ThumbsDown, ShieldAlert, Sparkles } from \"lucide-react\";
import Link from \"next/link\";

export default function AnalyzePage() {
  const { t } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(\"\");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setStatusMessage(t.analyzingStep1 || \"Checking image quality...\");

    try {
      const formData = new FormData();
      formData.append(\"file\", file);

      setTimeout(() => setStatusMessage(t.analyzingStep2 || \"Analyzing leaf lamina and lesion patterns...\"), 400);

      const res = await fetch(`${API_BASE_URL}/analysis/image`, {
        method: \"POST\",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || \"Analysis failed. Please ensure the photo is clear.\");
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || \"An unexpected error occurred during processing.\");
    } finally {
      setLoading(false);
      setStatusMessage(\"\");
    }
  };

  const sendFeedback = async (rating: number) => {
    if (!result) return;
    try {
      await fetch(`${API_BASE_URL}/feedback`, {
        method: \"POST\",
        headers: { \"Content-Type\": \"application/json\" },
        body: JSON.stringify({ analysis_id: result.analysis_id, rating }),
      });
      setFeedbackSent(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to obtain localized disease details
  const localizedDisease = result && t.diseases && t.diseases[result.condition];
  const displayConditionName = localizedDisease?.name || result?.condition;
  const displaySeverity = localizedDisease?.severity?.[result?.severity as \"Low\" | \"Moderate\" | \"High\" | \"Unknown\"] || result?.severity;
  const displaySymptoms = localizedDisease?.symptoms || result?.symptoms || [];
  const displayRiskFactors = localizedDisease?.risk_factors || result?.risk_factors || [];
  const displayPrecautions = localizedDisease?.precautions || result?.precautions || [];
  const displayManagement = localizedDisease?.management || result?.management || [];

  return (
    <div className=\"max-w-4xl mx-auto space-y-6\">
      {/* Header */}
      <div className=\"bg-white p-6 rounded-2xl shadow-sm border border-stone-200\">
        <h1 className=\"text-2xl font-bold text-stone-900 flex items-center gap-2\">
          <Sparkles className=\"w-6 h-6 text-emerald-600\" />
          <span>{t.analyzeTitle}</span>
        </h1>
        <p className=\"text-sm text-stone-600 mt-1\">
          {t.analyzeSub}
        </p>
      </div>

      {/* Upload Zone */}
      <div className=\"bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4\">
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className=\"border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition\"
          >
            <div className=\"bg-emerald-100 p-4 rounded-full text-emerald-700 mb-3\">
              <UploadCloud className=\"w-8 h-8\" />
            </div>
            <p className=\"font-semibold text-stone-800 text-base\">{t.dropPhotoPrompt}</p>
            <p className=\"text-xs text-stone-500 mt-1\">{t.dropPhotoFormats}</p>
            <input
              ref={fileInputRef}
              type=\"file\"
              accept=\"image/*\"
              className=\"hidden\"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className=\"space-y-4\">
            <div className=\"relative max-h-96 overflow-hidden rounded-xl bg-stone-900 flex items-center justify-center\">
              <img
                src={preview}
                alt=\"Selected rice leaf preview\"
                className=\"max-h-96 object-contain rounded-lg\"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                }}
                className=\"absolute top-3 right-3 bg-stone-900/80 hover:bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur\"
              >
                {t.changePhoto}
              </button>
            </div>

            {!result && (
              <div className=\"flex justify-end gap-3\">
                <button
                  disabled={loading}
                  onClick={handleAnalyze}
                  className=\"bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-xl shadow flex items-center gap-2 transition disabled:opacity-50\"
                >
                  {loading ? (
                    <>
                      <RefreshCw className=\"w-4 h-4 animate-spin\" />
                      <span>{statusMessage || \"Analyzing...\"}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.startAiAnalysis}</span>
                      <ArrowRight className=\"w-4 h-4\" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className=\"p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm\">
            <AlertTriangle className=\"w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5\" />
            <div>
              <p className=\"font-medium\">{t.validationWarning}</p>
              <p className=\"text-xs text-rose-700 mt-0.5\">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className=\"space-y-6\">
          {/* Main Status Card */}
          <div className=\"bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4\">
            <div className=\"flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4\">
              <div>
                <span className=\"text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md\">
                  {result.is_demo ? t.demoAssessment : t.preliminaryAssessment}
                </span>
                <h2 className=\"text-2xl font-bold text-stone-900 mt-2 flex items-center gap-2\">
                  {result.condition === \"Healthy\" ? (
                    <CheckCircle className=\"w-7 h-7 text-emerald-600\" />
                  ) : (
                    <AlertTriangle className=\"w-7 h-7 text-amber-500\" />
                  )}
                  <span>{displayConditionName}</span>
                </h2>
              </div>

              {/* Confidence badge */}
              <div className=\"text-right\">
                <p className=\"text-xs text-stone-500\">{t.confidenceScore}</p>
                <p className=\"text-2xl font-black text-emerald-700\">{Math.round(result.confidence * 100)}%</p>
              </div>
            </div>

            {/* Metrics grid */}
            <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2\">
              <div className=\"bg-stone-50 p-3.5 rounded-xl border border-stone-100\">
                <p className=\"text-xs text-stone-500\">{t.estimatedSeverity}</p>
                <p className={`font-semibold text-base mt-0.5 ${
                  result.severity === \"High\" ? \"text-rose-600\" : result.severity === \"Moderate\" ? \"text-amber-600\" : \"text-emerald-700\"
                }`}>
                  {displaySeverity}
                </p>
              </div>
              <div className=\"bg-stone-50 p-3.5 rounded-xl border border-stone-100\">
                <p className=\"text-xs text-stone-500\">{t.affectedArea}</p>
                <p className=\"font-semibold text-stone-800 text-base mt-0.5\">
                  {result.affected_area_percentage}%
                </p>
              </div>
              <div className=\"bg-stone-50 p-3.5 rounded-xl border border-stone-100\">
                <p className=\"text-xs text-stone-500\">{t.modelPipeline}</p>
                <p className=\"font-semibold text-stone-700 text-xs mt-1 truncate\">
                  {result.model_version}
                </p>
              </div>
            </div>

            {/* Expert review badge if confidence is low */}
            {result.expert_review_required && (
              <div className=\"bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs\">
                <ShieldAlert className=\"w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5\" />
                <p>
                  <strong>{t.needsAgronomicReview}</strong> {t.needsAgronomicReviewText}
                </p>
              </div>
            )}
          </div>

          {/* Symptoms & Precautions Guidance */}
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            {/* Symptoms */}
            <div className=\"bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-3\">
              <h3 className=\"font-bold text-stone-900 text-base\">{t.keyObservedSymptoms}</h3>
              <ul className=\"space-y-2 text-xs text-stone-700\">
                {displaySymptoms.map((s, idx) => (
                  <li key={idx} className=\"flex items-start gap-2\">
                    <span className=\"w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0\" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              <h3 className=\"font-bold text-stone-900 text-base pt-3 border-t border-stone-100\">{t.contributingRiskFactors}</h3>
              <ul className=\"space-y-2 text-xs text-stone-700\">
                {displayRiskFactors.map((r, idx) => (
                  <li key={idx} className=\"flex items-start gap-2\">
                    <span className=\"w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0\" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Precautions & Management */}
            <div className=\"bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-3\">
              <h3 className=\"font-bold text-stone-900 text-base\">{t.recommendedPrecautions}</h3>
              <ul className=\"space-y-2 text-xs text-stone-700\">
                {displayPrecautions.map((p, idx) => (
                  <li key={idx} className=\"flex items-start gap-2\">
                    <CheckCircle className=\"w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0\" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <h3 className=\"font-bold text-stone-900 text-base pt-3 border-t border-stone-100\">{t.fieldManagementGuidelines}</h3>
              <ul className=\"space-y-2 text-xs text-stone-700\">
                {displayManagement.map((m, idx) => (
                  <li key={idx} className=\"flex items-start gap-2\">
                    <span className=\"w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 flex-shrink-0\" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Chatbot Bridge & Feedback */}
          <div className=\"bg-emerald-50/80 border border-emerald-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4\">
            <div>
              <h4 className=\"font-bold text-emerald-950 text-base\">{t.haveQuestions}</h4>
              <p className=\"text-xs text-emerald-800 mt-0.5\">
                {t.haveQuestionsSub}
              </p>
            </div>
            <Link
              href={`/chat?analysis_id=${result.analysis_id}`}
              className=\"bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 flex-shrink-0\"
            >
              <MessageSquare className=\"w-4 h-4\" />
              <span>{t.askFarmerAssistantBtn}</span>
            </Link>
          </div>

          {/* Farmer Feedback Section */}
          <div className=\"bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between text-xs\">
            <span className=\"text-stone-600\">{t.wasHelpful}</span>
            {feedbackSent ? (
              <span className=\"text-emerald-700 font-medium\">{t.thankFeedback}</span>
            ) : (
              <div className=\"flex items-center gap-2\">
                <button
                  onClick={() => sendFeedback(1)}
                  className=\"flex items-center gap-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-stone-200 transition\"
                >
                  <ThumbsUp className=\"w-3.5 h-3.5\" />
                  <span>{t.yes}</span>
                </button>
                <button
                  onClick={() => sendFeedback(0)}
                  className=\"flex items-center gap-1 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-stone-200 transition\"
                >
                  <ThumbsDown className=\"w-3.5 h-3.5\" />
                  <span>{t.no}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
"""

with open("frontend/src/app/analyze/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)
print("Saved frontend/src/app/analyze/page.tsx")
