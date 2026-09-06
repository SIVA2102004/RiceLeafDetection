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

  // Multilingual welcome greetings
  const getWelcomeMessage = (lang: string) => {
    switch (lang) {
      case "te":
        return "నమస్కారం! నేను మీ రైస్ గార్డ్ రైతు సహాయకుడిని. వరి తెగుళ్లు, లక్షణాలు, సమతుల్య నీటి పారుదల, ఎరువుల యాజమాన్యం లేదా మీ ఇటీవలి పంట పరీక్ష గురించి ఏదైనా అడగండి.";
      case "hi":
        return "नमस्ते! मैं आपका राइसगार्ड किसान सहायक हूँ। धान के रोग, लक्षण, संतुलित सिंचाई, खाद प्रबंधन या अपनी हालिया फसल जांच के बारे में कुछ भी पूछें।";
      case "ta":
        return "வணக்கம்! நான் உங்கள் ரைஸ்கார்ட் விவசாயி உதவியாளர். நெல் நோய்கள், அறிகுறிகள், பாசன முறைகள் மற்றும் உர மேலாண்மை பற்றி என்னிடம் கேட்கலாம்.";
      case "kn":
        return "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ರೈಸ್‌ಗಾರ್ಡ್ ರೈತ ಸಹಾಯಕ. ಭತ್ತದ ರೋಗಗಳು, ಲಕ್ಷಣಗಳು, ನೀರಾವರಿ ಅಥವಾ ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.";
      case "mr":
        return "नमस्कार! मी आपला राइसगार्ड शेतकरी सहाय्यक आहे. भात पिकावरील रोग, लक्षणे, पाणी व्यवस्थापन किंवा खतांबद्दल काहीही विचारा.";
      case "gu":
        return "નમસ્તે! હું તમારો રાઇસગાર્ડ ખેડૂત સહાયક છું. ડાંગરના રોગો, લક્ષણો, સિંચાઈ અથવા ખાતર વ્યવસ્થાપન વિશે મને કંઈપણ પૂછો.";
      default:
        return "Namaste! I am your RiceGuard Farmer Assistant. Ask me anything about rice diseases, symptoms, balanced irrigation, fertilizers, or your recent crop scan.";
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      message: getWelcomeMessage(language),
      language: language,
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial welcome message when language changes if no conversation started
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [
          {
            id: 1,
            role: "assistant",
            message: getWelcomeMessage(language),
            language: language,
            created_at: new Date().toISOString(),
          },
        ];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If redirected with analysisId, send automated follow-up context query in farmer's language
  useEffect(() => {
    if (analysisId) {
      const fetchContext = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}`);
          if (res.ok) {
            const data: AnalysisResult = await res.json();
            const localizedCond = t.diseases?.[data.condition]?.name || data.condition;
            const localizedSev = t.diseases?.[data.condition]?.severity?.[data.severity] || data.severity;
            
            let followUpText = `🌾 I have loaded your recent assessment for **${localizedCond}** (Severity: ${localizedSev}, Confidence: ${Math.round(data.confidence * 100)}%). What questions do you have regarding managing this condition?`;
            if (language === "te") {
              followUpText = `🌾 మీ ఇటీవలి **${localizedCond}** విశ్లేషణను లోడ్ చేసాను (తీవ్రత: ${localizedSev}, ఖచ్చితత్వం: ${Math.round(data.confidence * 100)}%). ఈ తెగులు నివారణ లేదా జాగ్రత్తల గురించి మీకేమైనా సందేహాలు ఉన్నాయా?`;
            } else if (language === "hi") {
              followUpText = `🌾 मैंने आपकी **${localizedCond}** की हालिया जांच लोड कर ली है (गंभीरता: ${localizedSev}, विश्वास स्कोर: ${Math.round(data.confidence * 100)}%)। इस रोग के प्रबंधन के बारे में आपका क्या प्रश्न है?`;
            }

            setMessages((prev) => [
              ...prev,
              {
                id: Date.now(),
                role: "assistant",
                message: followUpText,
                language: language,
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
  }, [analysisId, language]);

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
      // Direct prompt answering via localized catalog if regional language
      let localAnswer: string | null = null;
      const lowerQ = query.toLowerCase();

      // Check disease match in active local language catalog
      for (const [key, dInfo] of Object.entries(t.diseases || {})) {
        if (
          lowerQ.includes(dInfo.name.toLowerCase()) || 
          lowerQ.includes(key.toLowerCase()) ||
          lowerQ.includes("లక్షణాలు") ||
          lowerQ.includes("నివారణ") ||
          lowerQ.includes("మందు") ||
          lowerQ.includes("లక్షణ") ||
          lowerQ.includes("ఎరువులు")
        ) {
          if (lowerQ.includes(dInfo.name.toLowerCase()) || lowerQ.includes(key.toLowerCase())) {
            localAnswer = `🌾 **${dInfo.name}**\n\n${dInfo.description}\n\n**లక్షణాలు (Symptoms):**\n${dInfo.symptoms.map((s) => `• ${s}`).join("\n")}\n\n**తీసుకోవాల్సిన జాగ్రత్తలు (Precautions):**\n${dInfo.precautions.map((p) => `• ${p}`).join("\n")}\n\n**యాజమాన్య పద్ధతులు (Management):**\n${dInfo.management.map((m) => `• ${m}`).join("\n")}\n\n⚠️ *సలహా: తీవ్రమైన పరిస్థితుల్లో మీ సమీప వ్యవసాయ విస్తరణ అధికారిని (AEO) సంప్రదించండి.*`;
            break;
          }
        }
      }

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
        // If query was in regional language and matched local knowledge, enhance response
        if (language !== "en" && localAnswer) {
          reply.message = localAnswer;
        }
        setMessages((prev) => [...prev, reply]);
      } else if (localAnswer) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            message: localAnswer!,
            language: language,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          message: language === "te" 
            ? "క్షమించండి, సర్వర్ అనుసంధానంలో సమస్య ఏర్పడింది. దయచేసి ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి."
            : language === "hi"
            ? "क्षमा करें, सर्वर से जुड़ने में समस्या आ रही है। कृपया अपना इंटरनेट कनेक्शन जांचें।"
            : "Sorry, I am having trouble connecting to the knowledge server. Please check your internet connection.",
          language: language,
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

    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      te: "te-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      mr: "mr-IN",
      gu: "gu-IN",
    };
    utterance.lang = langMap[language] || "en-IN";

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Multilingual UI strings for Chatbot
  const chatUiTexts = {
    en: {
      title: "RiceGuard Farmer Assistant",
      subtitle: "Verified Agricultural Knowledge & Safe Guidance",
      knowledgeService: "RiceGuard Knowledge Service",
      stopVoice: "Stop Voice",
      activeContext: "Active Diagnosis Context",
      loading: "Consulting agricultural knowledge base...",
    },
    te: {
      title: "రైస్ గార్డ్ రైతు సహాయకుడు",
      subtitle: "ధృవీకరించిన వ్యవసాయ సమాచారం & రైతు రక్షణ సలహాలు",
      knowledgeService: "రైస్ గార్డ్ నాలెడ్జ్ సర్వీస్",
      stopVoice: "వాయిస్ ఆపు",
      activeContext: "పరీక్ష ఫలితం సంఖ్య",
      loading: "వ్యవసాయ సమాచార కేంద్రాన్ని సంప్రదిస్తోంది...",
    },
    hi: {
      title: "राइसगार्ड किसान सहायक",
      subtitle: "सत्यापित कृषि ज्ञान और सुरक्षित मार्गदर्शन",
      knowledgeService: "राइसगार्ड ज्ञान सेवा",
      stopVoice: "आवाज़ रोकें",
      activeContext: "सक्रिय निदान संदर्भ",
      loading: "कृषि ज्ञान केंद्र से परामर्श लिया जा रहा है...",
    },
    ta: {
      title: "ரைஸ்கார்ட் விவசாயி உதவியாளர்",
      subtitle: "சரிபார்க்கப்பட்ட விவசாய அறிவு & வழிகாட்டுதல்",
      knowledgeService: "ரைஸ்கார்ட் சேவை",
      stopVoice: "குரலை நிறுத்து",
      activeContext: "செயலில் உள்ள ஆய்வு",
      loading: "தகவல்களைத் தேடுகிறது...",
    },
    kn: {
      title: "ರೈಸ್‌ಗಾರ್ಡ್ ರೈತ ಸಹಾಯಕ",
      subtitle: "ದೃಢೀಕರಿಸಿದ ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ರಕ್ಷಣೆ",
      knowledgeService: "ರೈಸ್‌ಗಾರ್ಡ್ ಸೇವೆ",
      stopVoice: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
      activeContext: "ಪರೀಕ್ಷಾ ವಿವರ",
      loading: "ಕೃಷಿ ಜ್ಞಾನ ತಾಣದಿಂದ ಮಾಹಿತಿ ಪಡೆಯುತ್ತಿದೆ...",
    },
    mr: {
      title: "राइसगार्ड शेतकरी सहाय्यक",
      subtitle: "सत्यापित कृषी माहिती आणि सुरक्षित मार्गदर्शन",
      knowledgeService: "राइसगार्ड सेवा",
      stopVoice: "आवाज थांबवा",
      activeContext: "तपासणी तपशील",
      loading: "कृषी माहिती केंद्राशी संपर्क साधत आहे...",
    },
    gu: {
      title: "રાઇસગાર્ડ ખેડૂત સહાયક",
      subtitle: "વિશ્વસનીય કૃષિ માર્ગદર્શન અને સલાહ",
      knowledgeService: "રાઇસગાર્ડ સેવા",
      stopVoice: "અવાજ બંધ કરો",
      activeContext: "ચકાસણી સંદર્ભ",
      loading: "માહિતી મેળવી રહ્યું છે...",
    },
  };

  const ui = chatUiTexts[language] || chatUiTexts.en;

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
              <span>{ui.title}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h2>
            <p className="text-xs text-emerald-200">{ui.subtitle}</p>
          </div>
        </div>

        {analysisId && (
          <span className="text-[10px] bg-emerald-900/80 border border-emerald-600 px-2.5 py-1 rounded-full text-amber-300 font-medium">
            {ui.activeContext} #{analysisId}
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
                  <span>{ui.knowledgeService}</span>
                  <button
                    onClick={() => speakText(msg.id, msg.message)}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold p-1 rounded"
                  >
                    {speakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-rose-600">{ui.stopVoice}</span>
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
            <span>{ui.loading}</span>
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
          placeholder={
            language === "te"
              ? "వరి తెగుళ్లు, మచ్చలు, ఎరువులు లేదా నీటి యాజమాన్యం గురించి అడగండి..."
              : language === "hi"
              ? "धान के रोग, धब्बे, खाद या पानी के प्रबंधन के बारे में पूछें..."
              : language === "ta"
              ? "நெல் நோய்கள், அறிகுறிகள் அல்லது உரங்கள் பற்றி கேளுங்கள்..."
              : "Ask about rice blast, brown spots, fertilizers, watering..."
          }
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
