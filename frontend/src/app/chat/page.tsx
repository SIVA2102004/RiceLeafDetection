"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context";
import { API_BASE_URL } from "@/lib/api";
import { ChatMessage, AnalysisResult } from "@/types";
import { Send, Mic, Volume2, VolumeX, Bot, User, Sparkles, RefreshCw } from "lucide-react";

function ChatContent() {
  const { language, t } = useApp();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysis_id");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      message: "Namaste! I am your RiceGuard Farmer Assistant. Ask me anything about rice diseases, symptoms, balanced irrigation, fertilizers, or your recent crop scan.",
      language: "en",
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If redirected with analysisId, send automated follow-up context query
  useEffect(() => {
    if (analysisId) {
      const fetchContext = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}`);
          if (res.ok) {
            const data: AnalysisResult = await res.json();
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now(),
                role: "assistant",
                message: `🌾 I have loaded your recent assessment for **${data.condition}** (Severity: ${data.severity}, Confidence: ${Math.round(data.confidence * 100)}%). What questions do you have regarding managing this condition?`,
                language: "en",
                created_at: new Date().toISOString(),
              },
            ]);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchContext();
    }
  }, [analysisId]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      message: query,
      language: language,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          language: language,
          analysis_id: analysisId ? parseInt(analysisId) : null,
        }),
      });

      if (res.ok) {
        const reply: ChatMessage = await res.json();
        setMessages((prev) => [...prev, reply]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          message: "Sorry, I am having trouble connecting to the knowledge server. Please check your internet connection.",
          language: "en",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API - Speech to Text
  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Map language code to speech locale
    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      te: "te-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      mr: "mr-IN",
      gu: "gu-IN",
    };
    recognition.lang = langMap[language] || "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  // Text to Speech (TTS)
  const speakText = (msgId: number, text: string) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Chat header */}
      <div className="bg-emerald-800 text-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-700 p-2 rounded-xl text-amber-300">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base flex items-center gap-1.5">
              <span>RiceGuard Farmer Assistant</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h2>
            <p className="text-xs text-emerald-200">Verified Agricultural Knowledge & Safe Guidance</p>
          </div>
        </div>

        {analysisId && (
          <span className="text-[10px] bg-emerald-900/80 border border-emerald-600 px-2.5 py-1 rounded-full text-amber-300 font-medium">
            Active Diagnosis Context #{analysisId}
          </span>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-amber-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-700 text-white rounded-br-none"
                  : "bg-white text-stone-800 border border-stone-200 rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-line">{msg.message}</div>

              {msg.role === "assistant" && (
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                  <span>RiceGuard Knowledge Service</span>
                  <button
                    onClick={() => speakText(msg.id, msg.message)}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold p-1 rounded"
                  >
                    {speakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-rose-600">Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t.readAloud}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-stone-500 text-xs pl-11">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Consulting agricultural knowledge base...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls */}
      <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
        <button
          onClick={toggleListening}
          title={isListening ? "Listening..." : "Speak Question"}
          className={`p-3 rounded-xl border transition flex-shrink-0 ${
            isListening
              ? "bg-rose-600 text-white border-rose-600 animate-pulse"
              : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
          }`}
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about rice blast, brown spots, fertilizers, watering..."
          className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-emerald-600"
        />

        <button
          disabled={!input.trim() || loading}
          onClick={() => handleSend()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition disabled:opacity-50 flex-shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500 text-sm">Loading Assistant...</div>}>
      <ChatContent />
    </Suspense>
  );
}
