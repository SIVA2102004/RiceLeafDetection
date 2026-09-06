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

  // Comprehensive response generator in active regional language
  const getLocalizedResponse = (query: string, lang: string): string | null => {
    const lowerQ = query.toLowerCase();
    const diseaseCatalog = t.diseases || {};

    // 1. Check disease matching (both English terms and Regional names)
    for (const [engName, dInfo] of Object.entries(diseaseCatalog)) {
      const matchEng = lowerQ.includes(engName.toLowerCase());
      const matchLocal = dInfo.name && lowerQ.includes(dInfo.name.toLowerCase());
      
      // Alias matching
      const isBlast = (lowerQ.includes("blast") || lowerQ.includes("అగ్గి") || lowerQ.includes("झुलसा")) && engName.includes("Blast");
      const isBlight = (lowerQ.includes("blight") || lowerQ.includes("ఎండు") || lowerQ.includes("ब्लाइट")) && engName.includes("Blight");
      const isSpot = (lowerQ.includes("brown") || lowerQ.includes("spot") || lowerQ.includes("మచ్చ") || lowerQ.includes("धब्बा")) && engName.includes("Spot");
      const isHealthy = (lowerQ.includes("healthy") || lowerQ.includes("ఆరోగ్య") || lowerQ.includes("स्वस्थ")) && engName === "Healthy";
      const isTungro = lowerQ.includes("tungro") && engName === "Tungro";
      const isHispa = (lowerQ.includes("hispa") || lowerQ.includes("కీటకం")) && engName === "Rice Hispa";

      if (matchEng || matchLocal || isBlast || isBlight || isSpot || isHealthy || isTungro || isHispa) {
        const labels: Record<string, { symptoms: string; precautions: string; management: string; disclaimer: string }> = {
          te: {
            symptoms: "గమనించిన ముఖ్య లక్షణాలు",
            precautions: "రైతు తీసుకోవాల్సిన జాగ్రత్తలు",
            management: "పొలంలో పాటించాల్సిన యాజమాన్య పద్ధతులు",
            disclaimer: "⚠️ సలహా: తీవ్రమైన పరిస్థితుల్లో మీ సమీప వ్యవసాయ విస్తరణ అధికారిని (AEO) సంప్రదించండి."
          },
          hi: {
            symptoms: "मुख्य लक्षण",
            precautions: "अनुशंसित सावधानियां",
            management: "खेत प्रबंधन और रोकथाम के उपाय",
            disclaimer: "⚠️ सलाह: गंभीर स्थिति में नजदीकी कृषि अधिकारी या कृषि विज्ञान केंद्र (KVK) से सलाह लें।"
          },
          ta: {
            symptoms: "முக்கிய அறிகுறிகள்",
            precautions: "பரிந்துரைக்கப்பட்ட முன்னெச்சரிக்கைகள்",
            management: "பயிர் மேலாண்மை வழிகாட்டுதல்",
            disclaimer: "⚠️ ஆலோசனை: தீவிர பாதிப்புகளுக்கு வேளாண்மை அலுவலரை அணுகவும்."
          },
          kn: {
            symptoms: "ಮುಖ್ಯ ರೋಗ ಲಕ್ಷಣಗಳು",
            precautions: "ರೈತರು ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
            management: "ಕ್ಷೇತ್ರ ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು",
            disclaimer: "⚠️ ಸಲಹೆ: ಹೆಚ್ಚಿನ ಹಾನಿಯಾಗಿದ್ದಲ್ಲಿ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ."
          },
          mr: {
            symptoms: "महत्त्वाची लक्षणे",
            precautions: "काळजीचे उपाय",
            management: "शेती व्यवस्थापन आणि प्रतिबंधात्मक पद्धती",
            disclaimer: "⚠️ सल्ला: गंभीर समस्येसाठी स्थानिक कृषी अधिकाऱ्यांशी संपर्क साधा."
          },
          gu: {
            symptoms: "મુખ્ય લક્ષણો",
            precautions: "સાવચેતીનાં પગલાં",
            management: "ખેત વ્યવસ્થાપન",
            disclaimer: "⚠️ સલાહ: વધુ નુકસાન માટે સ્થાનિક કૃષિ અધિકારીની મુલાકાત લો."
          },
          en: {
            symptoms: "Key Observed Symptoms",
            precautions: "Recommended Precautions",
            management: "Field Management Guidelines",
            disclaimer: "⚠️ Note: For severe symptoms, consult your local agricultural officer."
          }
        };

        const lbl = labels[lang] || labels.en;
        return `🌾 **${dInfo.name}**\n\n${dInfo.description}\n\n**${lbl.symptoms}:**\n${dInfo.symptoms.map((s) => `• ${s}`).join("\n")}\n\n**${lbl.precautions}:**\n${dInfo.precautions.map((p) => `• ${p}`).join("\n")}\n\n**${lbl.management}:**\n${dInfo.management.map((m) => `• ${m}`).join("\n")}\n\n${lbl.disclaimer}`;
      }
    }

    // 2. Prevention & Crop Protection queries (e.g. "తెగులు రాకుండా ఏమి చేయాలి?", "how to prevent diseases", "रोकथाम कैसे करें")
    const isPrevention = 
      lowerQ.includes("prevent") || lowerQ.includes("protection") || lowerQ.includes("రాకుండా") || 
      lowerQ.includes("నివారణ") || lowerQ.includes("रोकथाम") || lowerQ.includes("बचाव") || 
      lowerQ.includes("காப்பாற்ற") || lowerQ.includes("ರಕ್ಷಣೆ") || lowerQ.includes("कंट्रोल") ||
      lowerQ.includes("ఏమి చేయాలి") || lowerQ.includes("what should i do");

    if (isPrevention) {
      if (lang === "te") {
        return `🌾 **వరిలో తెగుళ్లు రాకుండా తీసుకోవాల్సిన సమగ్ర నివారణ చర్యలు:**

1. **విత్తన శుద్ధి (Seed Treatment)**:
• కిలో విత్తనానికి 2 గ్రాముల కార్బెండజిమ్ లేదా 3 గ్రాముల థైరమ్ కలిపి విత్తన శుద్ధి తప్పనిసరిగా చేయాలి.

2. **నారుమడి మరియు నాట్లు యాజమాన్యం**:
• నారు కొనలను తుంచకుండా నాట్లు వేయడం ద్వారా బాక్టీరియా తెగుళ్లు ఆశించకుండా కాపాడవచ్చు.
• సరైన సాంద్రతతో వరుసల్లో నాట్లు వేయడం వల్ల గాలి, వెలుతురు బాగా తగిలి తెగుళ్ల వ్యాప్తి తగ్గుతుంది.

3. **సమతుల్య ఎరువుల వినియోగం**:
• యూరియా (నత్రజని) ఒక్కసారే ఎక్కువగా వేయకూడదు. 3 విడతలుగా (దుక్కిలో, పిలక దశలో, చిరుపొట్ట దశలో) వేయాలి.
• సిఫార్సు చేసిన పొటాష్ తప్పనిసరిగా వాడాలి. పొటాష్ పైరుకు సహజ రోగనిరోధక శక్తిని ఇస్తుంది.

4. **నీటి యాజమాన్యం**:
• పొలంలో ఎల్లప్పుడూ లోతుగా నీరు నిల్వ ఉంచకుండా, అడపాదడపా నీటిని తీసి ఆరబెడుతుండాలి (AWD పద్ధతి).

5. **గట్ల పరిశుభ్రత**:
• పొలం గట్లపై కలుపు మొక్కలు లేకుండా శుభ్రంగా ఉంచడం ద్వారా చీడపీడల గుడ్లు, వైరస్ తెగుళ్లు వ్యాపించకుండా నియంత్రించవచ్చు.

⚠️ *రైతు గమనిక: ఏదైనా నిర్దిష్ట తెగులు లక్షణాలు కనిపిస్తే ఫోటోను పరీక్షించి కచ్చితమైన నివారణను పొందండి.*`;
      }
      if (lang === "hi") {
        return `🌾 **धान में रोगों से बचाव के लिए मुख्य रोकथाम उपाय:**

1. **बीज उपचार (Seed Treatment)**:
• प्रति किलो बीज में 2 ग्राम कार्बेन्डाजिम या ट्राइकोडर्मा मिलाकर बीज शोधन अवश्य करें।

2. **संतुलित खाद का प्रयोग**:
• यूरिया की पूरी मात्रा एक साथ न डालें। इसे 3 किस्तों में बांटकर प्रयोग करें।
• पोटाश और जिंक का संतुलित उपयोग पौधों को रोगों से लड़ने की ताकत देता है।

3. **रोपाई और दूरी**:
• उचित दूरी पर कतारों में रोपाई करें ताकि फसल में धूप और हवा का संचार बना रहे।
• रोपाई के समय पौधे की ऊपरी नोक न काटें।

4. **खेत की सफाई**:
• मेड़ों पर घास-फूस और खरपतवार न उगने दें, इससे कीट और बीमारियां कम फैलती हैं।

⚠️ *सलाह: किसी विशिष्ट रोग के लक्षण दिखने पर तुरंत पत्ती की फोटो अपलोड करके जांच करें।*`;
      }
      return `🌾 **Comprehensive Rice Disease Prevention Guidelines:**

1. **Seed Treatment**: Treat seeds with Carbendazim (2g/kg seed) or Trichoderma to eliminate seed-borne pathogens.
2. **Balanced Nutrition**: Avoid excessive single doses of Urea. Split nitrogen into 3 equal splits and apply adequate Potash.
3. **Proper Spacing & Aeration**: Maintain optimal planting density to prevent humid micro-climates that favor fungal growth.
4. **Water Drainage (AWD)**: Practice Alternate Wetting and Drying instead of continuous deep stagnation.
5. **Weed Management**: Keep field bunds clean to destroy alternate hosts and insect vectors.`;
    }

    // 3. Spray / Chemical Medicine queries
    const isMedicine = 
      lowerQ.includes("medicine") || lowerQ.includes("spray") || lowerQ.includes("chemical") || 
      lowerQ.includes("pesticide") || lowerQ.includes("fungicide") || lowerQ.includes("మందు") || 
      lowerQ.includes("స్ప్రే") || lowerQ.includes("దవా") || lowerQ.includes("दवा");

    if (isMedicine) {
      if (lang === "te") {
        return `🌾 **సస్యరక్షణ మరియు పిచికారీ మార్గదర్శకాలు:**

• **అగ్గి తెగులు (Blast)**: ట్రైసైక్లాజోల్ 75% WP లీటరు నీటికి 0.6 గ్రాములు లేదా ఐసోప్రోథియోలేన్ 1.5 మి.లీ కలపి పిచికారీ చేయాలి.
• **బాక్టీరియా ఆకు ఎండు (Bacterial Blight)**: కాపర్ ఆక్సీక్లోరైడ్ 3 గ్రాములు + స్ట్రెప్టోసైక్లిన్ 0.1 గ్రాము లీటరు నీటికి కలిపి పిచికారీ చేయాలి. వెంటనే నత్రజని ఎరువులు ఆపాలి.
• **ఎండిన మచ్చ (Brown Spot)**: మ్యాంకోజెబ్ 2.5 గ్రాములు లేదా హెక్సాకోనాజోల్ 2 మి.లీ లీటరు నీటికి కలిపి పిచికారీ చేయాలి.
• **పాము పొడ (Sheath Blight)**: వాలిడామైసిన్ 2 మి.లీ లేదా హెక్సాకోనాజోల్ 2 మి.లీ లీటరు నీటికి పిచికారీ చేయాలి.

⚠️ *హెచ్చరిక: గాలి వీచే దిశలో ఉదయం లేదా సాయంత్రం మాత్రమే పిచికారీ చేయాలి. ఖచ్చితమైన మోతాదుల కోసం స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.*`;
      }
      if (lang === "hi") {
        return `🌾 **धान सुरक्षा एवं छिड़काव मार्गदर्शन:**

• **झुलसा रोग (Blast)**: ट्राइसाइक्लाजोल 75% WP 0.6 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।
• **जीवाणु झुलसा (Bacterial Blight)**: कॉपर ऑक्सीक्लोराइड 3 ग्राम + स्ट्रेप्टोसाइक्लिन 0.1 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।
• **भूरा धब्बा (Brown Spot)**: मैंकोजेब 2.5 ग्राम या हेक्साकोनाजोल 2 मिली प्रति लीटर पानी में छिड़कें।
• **शीथ ब्लाइट (Sheath Blight)**: वैलिडामाइसिन 2 मिली प्रति लीटर पानी में मिलाकर तनों के पास छिड़कें।

⚠️ *सलाह: हमेशा सुबह या शाम के समय ही छिड़काव करें।*`;
      }
    }

    // 4. Water / Irrigation queries
    if (lowerQ.includes("water") || lowerQ.includes("irrigation") || lowerQ.includes("నీరు") || lowerQ.includes("पानी") || lowerQ.includes("పాણી")) {
      if (lang === "te") {
        return "🌾 **వరి పంట నీటి యాజమాన్యం:**\n\n• **పిలక దశ**: పిలకలు ఎక్కువగా రావడానికి 2 నుండి 3 సెం.మీ మేర పలుచటి నీటిని ఉంచాలి.\n• **చిరుపొట్ట మరియు ఈనె దశ**: ఈ దశలో నీటి ఎద్దడి ఉండకూడదు, 3 నుండి 5 సెం.మీ నీరు నిల్వ ఉంచాలి.\n• **తెగుళ్ల నివారణ**: బాక్టీరియా ఎండు లేదా పాముపొడ తెగులు ఆశిస్తే పొలంలోని నీటిని వెంటనే బయటకు తీసి ఆరబెట్టాలి.\n• **కోతకు ముందు**: పంట కోతకు 10-12 రోజుల ముందు పొలంలోని నీటిని పూర్తిగా తీసివేయాలి.";
      }
      if (lang === "hi") {
        return "🌾 **धान की फसल में जल प्रबंधन:**\n\n• **कल्ले निकलने की अवस्था**: अधिक कल्ले बनने के लिए खेत में 2-3 सेमी उथला पानी रखें।\n• **फूल आने की अवस्था**: इस समय खेत में 3-5 सेमी पानी होना आवश्यक है, सूखा न पड़ने दें।\n• **रोग नियंत्रण**: झुलसा या शीथ ब्लाइट दिखने पर खेत का पानी तुरंत निकाल दें और हवा लगने दें।\n• **कटाई पूर्व**: कटाई से 10-12 दिन पहले खेत का पानी पूरी तरह निकाल दें।";
      }
    }

    // 5. Fertilizer queries
    if (lowerQ.includes("fertilizer") || lowerQ.includes("urea") || lowerQ.includes("nitrogen") || lowerQ.includes("ఎరువులు") || lowerQ.includes("యూరియా") || lowerQ.includes("खाद")) {
      if (lang === "te") {
        return "🌾 **సమతుల్య ఎరువుల యాజమాన్యం:**\n\n• **యూరియా వాడకం**: యూరియా (నత్రజని) ఎక్కువగా వేస్తే ఆకులు మెత్తబడి అగ్గి తెగులు, ఆకు ఎండు తెగులు సులభంగా ఆశిస్తాయి.\n• **విడతల వారీగా**: యూరియాను ఒకేసారి వేయకుండా దుక్కిలో, పిలక దశలో, చిరుపొట్ట దశలో 3 సమాన విడతలుగా వేయాలి.\n• **పొటాష్ ప్రాముఖ్యత**: పొటాష్ ఎరువు పంటకు రోగ నిరోధక శక్తిని పెంచుతుంది.\n• **భూసార పరీక్ష**: ఎల్లప్పుడూ భూసార పరీక్ష ఆధారంగా సిఫార్సు చేసిన మోతాదులో మాత్రమే ఎరువులు వాడాలి.";
      }
      if (lang === "hi") {
        return "🌾 **धान में उर्वरक प्रबंधन:**\n\n• **संतुलित यूरिया**: अत्यधिक नाइट्रोजन (यूरिया) से पत्तियां अत्यधिक कोमल हो जाती हैं और ब्लास्ट व झुलसा रोग तेजी से फैलता है।\n• **तीन किस्तों में प्रयोग**: यूरिया की पूरी मात्रा एक बार में न देकर रोपाई, कल्ले फूटने और बाली निकलने के समय 3 भागों में दें।\n• **पोटाश का महत्व**: पोटाश पौधों की कोशिकाओं को मजबूत कर रोगों से लड़ने की क्षमता देता है।\n• **मिट्टी परीक्षण**: स्वाइल हेल्थ कार्ड की सिफारिशों के अनुसार ही खाद का प्रयोग करें।";
      }
    }

    return null;
  };

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
      // 1. If user asks in any language (English, Telugu, Hindi etc.), check for localized response in SELECTED language
      const localizedAnswer = getLocalizedResponse(query, language);

      if (localizedAnswer) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            message: localizedAnswer,
            language: language,
            created_at: new Date().toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      // 2. Otherwise query backend
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

  // Web Speech API - Speech to Text with robust permissions and error logging
  const toggleListening = () => {
    const hasSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    if (!hasSpeech) {
      alert("Voice input is supported in Google Chrome, Microsoft Edge, and modern mobile browsers. Please ensure you are using Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Locale mapping
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

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        setIsListening(false);
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
            handleSend(transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition event error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          alert("Microphone permission was denied. Please allow microphone access in your browser settings (click the lock/tune icon in the address bar).");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error("SpeechRecognition start error:", err);
      setIsListening(false);
      alert("Unable to start microphone. Please check your browser microphone permissions.");
    }
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
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-emerald-600">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-700 text-white rounded-br-none"
                  : "bg-white text-emerald-950 border border-emerald-200 rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-line">{msg.message}</div>

              {msg.role === "assistant" && (
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                  <span>{ui.knowledgeService}</span>
                  <button
                    onClick={() => speakText(msg.id, msg.message)}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold p-1 rounded"
                  >
                    {speakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="text-emerald-800">{ui.stopVoice}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t.readAloud}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-1 border border-emerald-300">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-emerald-700 text-xs pl-11">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>{ui.loading}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls */}
      <div className="p-3 bg-white border-t border-emerald-200 flex items-center gap-2">
        <button
          onClick={toggleListening}
          title={isListening ? "Listening..." : "Speak Question"}
          className={`p-3 rounded-xl border transition flex-shrink-0 ${
            isListening
              ? "bg-emerald-800 text-white border-emerald-800 animate-pulse"
              : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
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
          className="flex-1 bg-white border border-emerald-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-emerald-950 focus:outline-none focus:border-emerald-600 shadow-2xs"
        />

        <button
          disabled={!input.trim() || loading}
          onClick={() => handleSend()}
          className="bg-emerald-700 hover:bg-emerald-800 text-white p-3 rounded-xl transition disabled:opacity-50 flex-shrink-0 shadow-sm"
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
